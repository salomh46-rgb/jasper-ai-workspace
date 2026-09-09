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

            c_name = lead_name if lead_name else "Noma'lum"
            c_phone = lead_phone if lead_phone else "Ko'rsatilmadi"
            c_intent = intent if intent else "Konsultatsiya"

            msg_text = (
                "🚨 <b>YANGI LID / BUYURTMA QABUL QILINDI!</b>\n\n"
                f"🤖 <b>Agent:</b> {agent_name}\n"
                f"👤 <b>Mijoz:</b> {c_name}\n"
                f"📞 <b>Telefon:</b> <code>{c_phone}</code>\n"
                f"🎯 <b>Murojaat turi:</b> {c_intent}\n"
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

    @classmethod
    async def notify_admin_subscription_request(
        cls,
        user_id: int,
        plan_id: str,
        plan_name: str,
        price: str,
        sender_name: str,
        sender_phone: str,
        payment_method: str = "card"
    ):
        admin_id = settings.ADMIN_TELEGRAM_ID
        if not admin_id:
            return

        bot = cls._get_bot()
        if not bot:
            return

        try:
            method_label = "💳 Visa / Karta (P2P)" if payment_method == "card" else "⭐ Telegram Stars"
            
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text=f"✅ Tasdiqlash & Yoqish ({plan_id.capitalize()})", 
                        callback_data=f"sub_appr_{user_id}_{plan_id}"
                    )
                ],
                [
                    InlineKeyboardButton(
                        text="❌ Rad Etish (To'lanmadi)", 
                        callback_data=f"sub_rej_{user_id}_{plan_id}"
                    )
                ]
            ])

            msg_text = (
                "💎 <b>YANGI SAAS OBUNA SO'ROVI QABUL QILINDI!</b>\n\n"
                f"🆔 <b>Foydalanuvchi ID:</b> <code>#{user_id}</code>\n"
                f"🚀 <b>Tarif:</b> {plan_name} ({price} so'm / oy)\n"
                f"👤 <b>Mijoz:</b> {sender_name}\n"
                f"📞 <b>Telefon:</b> <code>{sender_phone}</code>\n"
                f"💵 <b>To'lov usuli:</b> {method_label}\n"
                f"⏳ <b>Holat:</b> To'lov tekshiruvi kutilmoqda\n\n"
                f"<i>Karta hisobingizga pul tushgan bo'lsa, quyidagi tugma orqali 1 bosishda faollashtiring 👇</i>"
            )

            await bot.send_message(chat_id=admin_id, text=msg_text, reply_markup=kb, parse_mode="HTML")
            logger.info(f"✅ Adminga ({admin_id}) yangi obuna so'rovi xabarnomasi yuborildi!")
        except Exception as e:
            logger.warning(f"Adminga obuna xabarnomasini yuborishda xatolik: {e}")
        finally:
            await bot.session.close()
