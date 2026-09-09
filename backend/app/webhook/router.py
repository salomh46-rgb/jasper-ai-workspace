import hashlib
import logging
from fastapi import APIRouter, Request, Header, HTTPException
from app.services.bot_manager import BotManager

router = APIRouter(tags=["Telegram Webhook"])
logger = logging.getLogger(__name__)

@router.post("/webhook/tg/{bot_token}")
async def telegram_webhook(bot_token: str, request: Request):
    try:
        update_data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # Check if this is a standard message
    message = update_data.get("message")
    if not message:
        return {"ok": True}

    from_user = message.get("from", {})
    text = message.get("text", "")
    
    # Handle voice message
    if "voice" in message:
        text = "[Ovozli xabar yuborildi: Menga narxlar va xizmatlar haqida ma'lumot bering]"

    if not text:
        return {"ok": True}

    # Process through BotManager
    reply = await BotManager.handle_customer_message(
        bot_token=bot_token,
        telegram_user=from_user,
        message_text=text
    )

    # Return aiogram webhook response or send via HTTP
    chat_id = message.get("chat", {}).get("id")
    if chat_id:
        return {
            "method": "sendMessage",
            "chat_id": chat_id,
            "text": reply,
            "parse_mode": "HTML"
        }

    return {"ok": True}
