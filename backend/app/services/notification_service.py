import logging
from typing import Optional
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from app.core.config import settings

logger = logging.getLogger("notification_service")

class NotificationService:
    @classmethod
    def _get_bot(cls, fallback_token: Optional[str] = None) -> Optional[Bot]:
        if settings.MASTER_BOT_TOKEN and settings.MASTER_BOT_TOKEN != "YOUR_MASTER_TELEGRAM_BOT_TOKEN":
            return Bot(token=settings.MASTER_BOT_TOKEN)
        if fallback_token:
            return Bot(token=fallback_token)
        return None

    @classmethod
    def _get_webapp_url(cls, subpath: str = "") -> str:
        base = settings.WEBHOOK_BASE_URL or "https://b12e0e00d73ef6.lhr.life"
        if subpath:
            return f"{base.rstrip('/')}#{subpath}"
        return base

    @classmethod
    async def notify_new_lead(
        cls, 
        user_tg_id: int, 
        agent_name: str, 
        lead_name: str, 
        lead_phone: str, 
        intent: str, 
        summary: str, 
        fallback_token: Optional[str] = None
    ):
        if not user_tg_id:
            return

        bot = cls._get_bot(fallback_token)
        if not bot:
            return

        try:
            webapp_url = cls._get_webapp_url("/leads")
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📥 CRM & Lidni Ko'rish", web_app=WebAppInfo(url=webapp_url))]
            ])

            msg_text = (
                "🚨 <b>YANGI LID / BUYURTMA QABUL QILINDI!</b>\n\n"
                f"🤖 <b>Agent:</b> {agent_name}\n"
                f"👤 <b>Mijoz:</b> {lead_name or 'Noma\'lum'}\n"
                f"📞 <b>Telefon:</b> <code>{lead_phone or 'Ko\'rsatilmadi'}</code>\n"
                f"🎯 <b>Murojaat turi:</b> {intent or 'Konsultatsiya'}\n"
                f"📝 <b>AI Xulosa:</b> {summary}\n\n"
                "<i>Jasper CRM orqali mijoz bilan darhol bog'lanishingiz mumkin! 👇</i>"
            )

            await bot.send_message(chat_id=user_tg_id, text=msg_text, reply_markup=kb, parse_mode="HTML")
        except Exception as e:
            logger.warning(f"Lid xabarnomasini yuborishda xatolik: {e}")
        finally:
            await bot.session.close()

    @classmethod
    async def notify_human_takeover_request(
        cls, 
        user_tg_id: int, 
        agent_name: str, 
        customer_name: str, 
        last_message: str, 
        fallback_token: Optional[str] = None
    ):
        if not user_tg_id:
            return

        bot = cls._get_bot(fallback_token)
        if not bot:
            return

        try:
            webapp_url = cls._get_webapp_url("/chat")
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="💬 Live Chatga Kirish", web_app=WebAppInfo(url=webapp_url))]
            ])

            msg_text = (
                "👨‍💻 <b>DIQQAT: MIJOZ OPERATOR YORDAMINI KUTMOQDA!</b>\n\n"
                f"🤖 <b>Agent:</b> {agent_name}\n"
                f"👤 <b>Mijoz:</b> {customer_name}\n"
                f"💬 <b>So'nggi xabar:</b> <i>\"{last_message}\"</i>\n\n"
                "⚡ AI avtomatik pauzaga olindi. Iltimos, mijozga javob bering 👇"
            )

            await bot.send_message(chat_id=user_tg_id, text=msg_text, reply_markup=kb, parse_mode="HTML")
        except Exception as e:
            logger.warning(f"Operator xabarnomasini yuborishda xatolik: {e}")
        finally:
            await bot.session.close()

    @classmethod
    async def notify_invoice_created_or_paid(
        cls, 
        user_tg_id: int, 
        agent_name: str, 
        invoice_number: str, 
        amount: float, 
        customer_name: str, 
        status: str, 
        fallback_token: Optional[str] = None
    ):
        if not user_tg_id:
            return

        bot = cls._get_bot(fallback_token)
        if not bot:
            return

        try:
            webapp_url = cls._get_webapp_url("/payments")
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="💳 Kassani Ko'rish", web_app=WebAppInfo(url=webapp_url))]
            ])

            status_text = "✅ MUVAFFAQIYATLI TO'LANDI" if status == "paid" else "⏳ TO'LOV KUTILMOQDA"
            msg_text = (
                f"💳 <b>TO'LOV HUJJATI (INVOICE): {status_text}</b>\n\n"
                f"🧾 <b>Chek raqami:</b> <code>{invoice_number}</code>\n"
                f"💰 <b>Summa:</b> <b>{amount:,.0f} UZS</b>\n"
                f"👤 <b>Mijoz:</b> {customer_name or 'Mijoz'}\n"
                f"🤖 <b>Filial/Agent:</b> {agent_name}\n\n"
                "<i>Kassa va hisobotlarni ilovada ko'rishingiz mumkin 👇</i>"
            )

            await bot.send_message(chat_id=user_tg_id, text=msg_text, reply_markup=kb, parse_mode="HTML")
        except Exception as e:
            logger.warning(f"To'lov xabarnomasini yuborishda xatolik: {e}")
        finally:
            await bot.session.close()
