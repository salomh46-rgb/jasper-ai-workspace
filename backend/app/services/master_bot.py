import logging
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, MenuButtonWebApp
from app.core.config import settings

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
    
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 AI Workspace Ochish", web_app=WebAppInfo(url=webapp_url))]
    ])
    
    welcome_text = (
        f"Assalomu alaykum, <b>{message.from_user.full_name}</b>! 👋\n\n"
        f"🤖 <b>Jasper AI Workspace</b> ga xush kelibsiz!\n\n"
        f"Bu platforma orqali siz o'z biznesingiz (Klinika, Do'kon, O'quv markazi, Servis) uchun "
        f"1 daqiqada shaxsiy <b>AI Agent (Bot)</b> yaratishingiz, narxlar va xizmatlar bazasini yuklashingiz "
        f"hamda tushgan buyurtmalarni CRM-da boshqarishingiz mumkin.\n\n"
        f"Boshqaruv panelini ochish uchun quyidagi tugmani bosing 👇"
    )
    
    await message.answer(welcome_text, reply_markup=kb, parse_mode="HTML")

async def start_master_bot():
    global _master_bot_instance, _master_polling_task
    if not settings.MASTER_BOT_TOKEN or settings.MASTER_BOT_TOKEN == "YOUR_MASTER_TELEGRAM_BOT_TOKEN":
        logger.warning("MASTER_BOT_TOKEN o'rnatilmagan, Master Bot ishga tushirilmadi.")
        return

    try:
        _master_bot_instance = Bot(token=settings.MASTER_BOT_TOKEN)
        
        # Set Menu Button automatically
        webapp_url = get_webapp_url()
        try:
            await _master_bot_instance.set_chat_menu_button(
                menu_button=MenuButtonWebApp(text="🚀 AI Workspace", web_app=WebAppInfo(url=webapp_url))
            )
            logger.info("✅ Master Bot Menu Button o'rnatildi!")
        except Exception as e:
            logger.warning(f"Menu button o'rnatishda xatolik: {e}")

        # Start polling
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
