import logging
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.models.agent import Agent
from app.models.lead import Lead
from app.models.conversation import Conversation, ChatMessage
from app.services.ai_service import AIService

logger = logging.getLogger("bot_manager")

class BotManager:
    _active_bot_tasks = {}
    _active_bot_instances = {}

    @classmethod
    async def start_all_agent_bots(cls):
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(Agent).where(Agent.is_active == True))
            agents = res.scalars().all()
            logger.info(f"🤖 Bazada {len(agents)} ta agent bot topildi.")
            for agent in agents:
                tok = (agent.bot_token or "").strip()
                if tok and ":" in tok:
                    await cls.start_bot(tok)

    @classmethod
    async def start_bot(cls, bot_token: str):
        bot_token = bot_token.strip()
        if not bot_token or ":" not in bot_token:
            return
        if bot_token in cls._active_bot_tasks:
            return

        try:
            bot = Bot(token=bot_token)
            await bot.delete_webhook(drop_pending_updates=True)
            dp = Dispatcher()

            @dp.message()
            async def on_message(message: types.Message):
                from_user = {
                    "id": message.from_user.id,
                    "first_name": message.from_user.first_name,
                    "last_name": message.from_user.last_name,
                    "username": message.from_user.username
                }
                text = message.text or ""
                voice_bytes = None
                if message.voice:
                    try:
                        file_info = await bot.get_file(message.voice.file_id)
                        bio = await bot.download_file(file_info.file_path)
                        voice_bytes = bio.getvalue() if hasattr(bio, "getvalue") else bio.read()
                        text = "🎙️ [Ovozli xabar]"
                    except Exception as e:
                        logger.error(f"Error downloading voice: {e}")
                        text = "[Ovozli xabar yuborildi]"

                reply = await cls.handle_customer_message(
                    bot_token=bot_token,
                    telegram_user=from_user,
                    message_text=text,
                    voice_bytes=voice_bytes
                )
                if reply:
                    await message.answer(reply, parse_mode="HTML")

            task = asyncio.create_task(dp.start_polling(bot))
            cls._active_bot_tasks[bot_token] = task
            cls._active_bot_instances[bot_token] = bot
            logger.info(f"✅ Agent Bot ({bot_token[:8]}...) Telegramda jonli (Polling) tinglashni boshladi!")
        except Exception as e:
            logger.error(f"❌ Agent botni ishga tushirishda xatolik ({bot_token[:8]}...): {e}")

    @classmethod
    async def stop_bot(cls, bot_token: str):
        bot_token = bot_token.strip()
        if bot_token in cls._active_bot_tasks:
            cls._active_bot_tasks[bot_token].cancel()
            del cls._active_bot_tasks[bot_token]
        if bot_token in cls._active_bot_instances:
            await cls._active_bot_instances[bot_token].session.close()
            del cls._active_bot_instances[bot_token]
        logger.info(f"🛑 Agent Bot ({bot_token[:8]}...) to'xtatildi.")

    @classmethod
    async def handle_customer_message(
        cls,
        bot_token: str,
        telegram_user: dict,
        message_text: str,
        voice_bytes: bytes = None
    ) -> str:
        async with AsyncSessionLocal() as db:
            # 1. Find agent by bot token
            stmt = select(Agent).where(Agent.bot_token == bot_token, Agent.is_active == True).options(
                selectinload(Agent.knowledge_items),
                selectinload(Agent.owner)
            )
            res = await db.execute(stmt)
            agent = res.scalar_one_or_none()
            
            if not agent:
                return "Assalomu alaykum! Tizim sozlanmoqda."

            # Fast greeting reply for /start
            if message_text.strip() == "/start":
                welcome = agent.welcome_message or f"Assalomu alaykum! Men {agent.name} xizmatining aqlli yordamchisiman. Sizga qanday yordam bera olaman?"
                return welcome

            # 2. Get or create conversation (Strict Multi-Tenant Isolation per Agent & Customer)
            customer_tg_id = telegram_user.get("id")
            customer_name = telegram_user.get("first_name", "") + " " + (telegram_user.get("last_name") or "")
            customer_name = customer_name.strip() or "Mijoz"

            conv_stmt = select(Conversation).where(
                Conversation.agent_id == agent.id,
                Conversation.customer_tg_id == customer_tg_id
            ).options(selectinload(Conversation.messages))
            conv_res = await db.execute(conv_stmt)
            conversation = conv_res.scalar_one_or_none()

            if not conversation:
                conversation = Conversation(
                    agent_id=agent.id,
                    customer_tg_id=customer_tg_id,
                    customer_name=customer_name
                )
                db.add(conversation)
                await db.flush()

            # 3. Check for operator takeover trigger keywords or active paused state
            operator_keywords = [
                "operator", "inson", "odam", "admin", "menejer", "mutaxassis", "jonli suhbat",
                "оператор", "человек", "админ", "менеджер", "живой человек", "помощь человека",
                "human", "live agent", "real person", "support", "talk to human"
            ]
            is_requesting_human = any(k in message_text.lower() for k in operator_keywords)

            if conversation.is_paused_for_human or is_requesting_human:
                if is_requesting_human and not conversation.is_paused_for_human:
                    conversation.is_paused_for_human = True
                    if agent.owner and agent.owner.telegram_id:
                        from app.services.notification_service import NotificationService
                        await NotificationService.notify_human_takeover_request(
                            user_tg_id=agent.owner.telegram_id,
                            agent_name=agent.name,
                            customer_name=customer_name,
                            last_message=message_text,
                            fallback_token=agent.bot_token
                        )

                user_msg = ChatMessage(conversation_id=conversation.id, sender="customer", text=message_text)
                db.add(user_msg)
                await db.commit()
                return "Sizning so'rovingiz qabul qilindi. Operatorimiz tez orada siz bilan bog'lanadi! 👨‍💻"

            # 4. Save user message to history
            user_msg = ChatMessage(conversation_id=conversation.id, sender="customer", text=message_text)
            db.add(user_msg)
            await db.flush()

            # Build recent history
            history = []
            if conversation.messages:
                for m in conversation.messages[-6:]:
                    history.append({"sender": m.sender, "text": m.text})

            # 5. Generate AI response via Gemini (Voice or Text)
            if voice_bytes:
                ai_res = await AIService.process_voice_message(
                    agent=agent,
                    knowledge_items=agent.knowledge_items,
                    chat_history=history,
                    audio_bytes=voice_bytes
                )
            else:
                ai_res = await AIService.generate_response(
                    agent=agent,
                    knowledge_items=agent.knowledge_items,
                    chat_history=history,
                    user_message=message_text
                )
            reply_text = ai_res["reply"]
            lead_data = ai_res.get("lead_data")

            # 6. Save AI reply
            ai_msg = ChatMessage(conversation_id=conversation.id, sender="ai", text=reply_text)
            db.add(ai_msg)

            # 7. Create Lead if detected
            if lead_data and lead_data.get("has_lead"):
                new_lead = Lead(
                    agent_id=agent.id,
                    customer_tg_id=customer_tg_id,
                    customer_name=lead_data.get("customer_name") or customer_name,
                    customer_phone=lead_data.get("customer_phone"),
                    intent=lead_data.get("intent", "consultation"),
                    summary=lead_data.get("summary", "Yangi lid qabul qilindi"),
                    status="new"
                )
                db.add(new_lead)
                
                # Push notification to business owner
                if agent.owner and agent.owner.telegram_id:
                    from app.services.notification_service import NotificationService
                    await NotificationService.notify_new_lead(
                        user_tg_id=agent.owner.telegram_id,
                        agent_name=agent.name,
                        lead_name=new_lead.customer_name,
                        lead_phone=new_lead.customer_phone,
                        intent=new_lead.intent,
                        summary=new_lead.summary,
                        fallback_token=agent.bot_token
                    )

            await db.commit()
            return reply_text
