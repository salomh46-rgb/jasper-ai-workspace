import logging
from aiogram import Bot
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.models.agent import Agent
from app.models.lead import Lead
from app.models.conversation import Conversation, ChatMessage
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)

class BotManager:
    @classmethod
    async def handle_customer_message(cls, bot_token: str, telegram_user: dict, message_text: str) -> str:
        async with AsyncSessionLocal() as db:
            # 1. Find agent by bot token
            stmt = select(Agent).where(Agent.bot_token == bot_token, Agent.is_active == True).options(
                selectinload(Agent.knowledge_items),
                selectinload(Agent.owner)
            )
            res = await db.execute(stmt)
            agent = res.scalar_one_or_none()
            
            if not agent:
                return "Kechirasiz, ushbu bot hozirda faol emas."

            # 2. Get or create conversation
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

            # 3. Check if human takeover is active
            if conversation.is_paused_for_human:
                # Save customer message and wait for human operator
                user_msg = ChatMessage(conversation_id=conversation.id, sender="customer", text=message_text)
                db.add(user_msg)
                await db.commit()
                return "Sizning xabaringiz operatorga uzatildi. Tez orada javob qaytaramiz! 👨‍💻"

            # 4. Save user message to history
            user_msg = ChatMessage(conversation_id=conversation.id, sender="customer", text=message_text)
            db.add(user_msg)
            await db.flush()

            # Build recent history
            history = []
            if conversation.messages:
                for m in conversation.messages[-6:]:
                    history.append({"sender": m.sender, "text": m.text})

            # 5. Generate AI response via Gemini
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
                
                # Notify business owner if owner has telegram_id
                if agent.owner and agent.owner.telegram_id:
                    try:
                        owner_bot = Bot(token=agent.bot_token)
                        alert_msg = (
                            f"🔔 <b>YANGI BUYURTMA / LID TUSHDI!</b>\n\n"
                            f"🤖 <b>Agent:</b> {agent.name}\n"
                            f"👤 <b>Mijoz:</b> {new_lead.customer_name}\n"
                            f"📱 <b>Telefon:</b> {new_lead.customer_phone or 'Ko\'rsatilmadi'}\n"
                            f"📝 <b>Xulosa:</b> {new_lead.summary}\n\n"
                            f"Mini App orqali buyurtmani boshqarishingiz mumkin!"
                        )
                        await owner_bot.send_message(agent.owner.telegram_id, alert_msg, parse_mode="HTML")
                        await owner_bot.session.close()
                    except Exception as e:
                        logger.error(f"Failed to notify owner: {e}")

            await db.commit()
            return reply_text
