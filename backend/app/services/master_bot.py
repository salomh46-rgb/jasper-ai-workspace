import logging
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, MenuButtonWebApp
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.agent import Agent
from app.models.lead import Lead

logger = logging.getLogger("master_bot")

master_dp = Dispatcher()
_master_bot_instance = None
_master_polling_task = None

def get_webapp_url() -> str:
    if settings.WEBHOOK_BASE_URL:
        return settings.WEBHOOK_BASE_URL
    return "https://b12e0e00d73ef6.lhr.life"

@master_dp.message(CommandStart())
async def cmd_start(message: types.Message):
    webapp_url = get_webapp_url()
    tg_id = message.from_user.id
    username = message.from_user.username
    full_name = message.from_user.full_name

    # Auto-register or link telegram_id to user in DB
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(User).where(User.telegram_id == tg_id)
            res = await db.execute(stmt)
            user = res.scalar_one_or_none()
            if not user:
                if username:
                    stmt_u = select(User).where(User.username == username)
                    res_u = await db.execute(stmt_u)
                    user = res_u.scalar_one_or_none()
                
                if user:
                    user.telegram_id = tg_id
                else:
                    user = User(
                        telegram_id=tg_id,
                        username=username,
                        full_name=full_name,
                        role="user"
                    )
                    db.add(user)
            await db.commit()
    except Exception as e:
        logger.warning(f"Error registering user in master bot: {e}")

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Jasper AI Workspace Ochish", web_app=WebAppInfo(url=webapp_url))],
        [
            InlineKeyboardButton(text="📊 Statistika", callback_data="btn_stats"),
            InlineKeyboardButton(text="📥 So'nggi Lidlar", callback_data="btn_leads")
        ]
    ])
    
    welcome_text = (
        f"Assalomu alaykum, <b>{full_name}</b>! 👋\n\n"
        f"🤖 <b>Jasper AI Workspace</b> ga xush kelibsiz!\n\n"
        f"Bu platforma orqali siz o'z biznesingiz (Klinika, Do'kon, O'quv markazi, Servis) uchun "
        f"1 daqiqada shaxsiy <b>AI Agent (Bot)</b> yaratishingiz, narxlar va xizmatlar bazasini yuklashingiz "
        f"hamda tushgan buyurtmalarni CRM-da boshqarishingiz mumkin.\n\n"
        f"🔔 <i>Sizga yangi buyurtma va to'lovlar haqida tezkor xabarnomalar shu bot orqali yuboriladi!</i>\n\n"
        f"Boshqaruv panelini ochish uchun quyidagi tugmani bosing 👇"
    )
    
    await message.answer(welcome_text, reply_markup=kb, parse_mode="HTML")

@master_dp.message(Command("stats"))
async def cmd_stats(message: types.Message):
    tg_id = message.from_user.id
    webapp_url = get_webapp_url()
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(User).where(User.telegram_id == tg_id).options(selectinload(User.agents))
            res = await db.execute(stmt)
            user = res.scalar_one_or_none()
            if not user or not user.agents:
                await message.answer(
                    "Sizda hali yaratilgan AI agentlar mavjud emas.\nMini App orqali birinchi agentingizni yarating!",
                    reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                        [InlineKeyboardButton(text="🚀 Agent Yaratish", web_app=WebAppInfo(url=webapp_url))]
                    ])
                )
                return

            agent_ids = [a.id for a in user.agents]
            lead_res = await db.execute(select(Lead).where(Lead.agent_id.in_(agent_ids)))
            leads = lead_res.scalars().all()

            msg = (
                f"📊 <b>BIZNESINGIZ STATISTIKASI:</b>\n\n"
                f"🤖 <b>Faol Agentlar:</b> {len(user.agents)} ta\n"
                f"📥 <b>Jami Lidlar / Buyurtmalar:</b> {len(leads)} ta\n"
                f"🟢 <b>Yangi Lidlar:</b> {sum(1 for l in leads if l.status == 'new')} ta\n\n"
                f"Batafsil boshqaruv uchun Mini Appni oching 👇"
            )
            await message.answer(msg, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🚀 Panelni Ochish", web_app=WebAppInfo(url=webapp_url))]
            ]))
    except Exception as e:
        await message.answer(f"Statistikani olishda xatolik: {e}")

@master_dp.message(Command("leads"))
async def cmd_leads(message: types.Message):
    tg_id = message.from_user.id
    webapp_url = get_webapp_url()
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(User).where(User.telegram_id == tg_id).options(selectinload(User.agents))
            res = await db.execute(stmt)
            user = res.scalar_one_or_none()
            if not user or not user.agents:
                await message.answer("Sizda hali lidlar mavjud emas.")
                return

            agent_ids = [a.id for a in user.agents]
            lead_res = await db.execute(
                select(Lead).where(Lead.agent_id.in_(agent_ids)).order_by(Lead.id.desc()).limit(5)
            )
            leads = lead_res.scalars().all()

            if not leads:
                await message.answer("Hozircha yangi lidlar tushgani yo'q.")
                return

            msg = "📥 <b>SO'NGGI 5 TA LID VA BUYURTMALAR:</b>\n\n"
            for idx, l in enumerate(leads, 1):
                msg += f"<b>{idx}. {l.customer_name or 'Mijoz'}</b>\n"
                msg += f"📞 <code>{l.customer_phone or 'Noma\'lum'}</code>\n"
                msg += f"📝 {l.summary}\n\n"

            await message.answer(msg, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📥 Barcha Lidlarni Ko'rish", web_app=WebAppInfo(url=f"{webapp_url}#/leads"))]
            ]))
    except Exception as e:
        await message.answer(f"Lidlarni olishda xatolik: {e}")

@master_dp.callback_query()
async def handle_callbacks(call: types.CallbackQuery):
    if call.data == "btn_stats":
        await call.answer()
        await cmd_stats(call.message)
    elif call.data == "btn_leads":
        await call.answer()
        await cmd_leads(call.message)

async def start_master_bot():
    global _master_bot_instance, _master_polling_task
    if not settings.MASTER_BOT_TOKEN or settings.MASTER_BOT_TOKEN == "YOUR_MASTER_TELEGRAM_BOT_TOKEN":
        logger.warning("MASTER_BOT_TOKEN o'rnatilmagan, Master Bot ishga tushirilmadi.")
        return

    try:
        _master_bot_instance = Bot(token=settings.MASTER_BOT_TOKEN)
        webapp_url = get_webapp_url()
        try:
            await _master_bot_instance.set_chat_menu_button(
                menu_button=MenuButtonWebApp(text="🚀 AI Workspace", web_app=WebAppInfo(url=webapp_url))
            )
            logger.info("✅ Master Bot Menu Button o'rnatildi!")
        except Exception as e:
            logger.warning(f"Menu button o'rnatishda xatolik: {e}")

        logger.info("🤖 Master Bot Telegramda tinglashni boshladi (Polling)...")
        _master_polling_task = asyncio.create_task(master_dp.start_polling(_master_bot_instance))
    except Exception as e:
        logger.error(f"Master Botni ishga tushirishda xatolik: {e}")

async def stop_master_bot():
    global _master_bot_instance, _master_polling_task
    if _master_polling_task:
        _master_polling_task.cancel()
    if _master_bot_instance:
        await _master_bot_instance.session.close()
        logger.info("Master Bot to'xtatildi.")
