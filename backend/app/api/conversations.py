from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.conversation import Conversation, ChatMessage
import httpx

router = APIRouter(prefix="/conversations", tags=["Conversations"])

class OperatorReplyRequest(BaseModel):
    text: str

class ToggleHumanRequest(BaseModel):
    is_paused_for_human: bool

@router.get("")
async def list_conversations(
    agent_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = (
        select(Conversation)
        .join(Agent)
        .where(Agent.user_id == current_user.id)
        .options(
            selectinload(Conversation.agent),
            selectinload(Conversation.messages)
        )
        .order_by(Conversation.last_message_at.desc())
    )
    if agent_id:
        stmt = stmt.where(Conversation.agent_id == agent_id)

    res = await db.execute(stmt)
    convs = res.scalars().all()

    result = []
    for c in convs:
        msgs = sorted(c.messages, key=lambda m: m.id)
        last_msg = msgs[-1].text if msgs else ""
        result.append({
            "id": c.id,
            "agent_id": c.agent_id,
            "agent_name": c.agent.name if c.agent else "Noma'lum",
            "customer_tg_id": c.customer_tg_id,
            "customer_name": c.customer_name or "Telegram Foydalanuvchisi",
            "is_paused_for_human": c.is_paused_for_human,
            "last_message": last_msg,
            "last_message_at": c.last_message_at,
            "messages_count": len(msgs)
        })
    return result

@router.get("/{conv_id}")
async def get_conversation(conv_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = (
        select(Conversation)
        .join(Agent)
        .where(Conversation.id == conv_id, Agent.user_id == current_user.id)
        .options(
            selectinload(Conversation.agent),
            selectinload(Conversation.messages)
        )
    )
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi")

    msgs = sorted(c.messages, key=lambda m: m.id)
    return {
        "id": c.id,
        "agent_id": c.agent_id,
        "agent_name": c.agent.name if c.agent else "",
        "customer_tg_id": c.customer_tg_id,
        "customer_name": c.customer_name or "Mijoz",
        "is_paused_for_human": c.is_paused_for_human,
        "messages": [
            {
                "id": m.id,
                "sender": m.sender,
                "text": m.text,
                "created_at": m.created_at
            }
            for m in msgs
        ]
    }

@router.post("/{conv_id}/toggle-human")
async def toggle_human_takeover(conv_id: int, payload: ToggleHumanRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Conversation).join(Agent).where(Conversation.id == conv_id, Agent.user_id == current_user.id).options(selectinload(Conversation.agent))
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi")

    c.is_paused_for_human = payload.is_paused_for_human
    await db.commit()
    await db.refresh(c)
    
    status_str = "Inson operatoriga topshirildi (AI to'xtatildi)" if c.is_paused_for_human else "AI avtomatik javob berishiga qaytarildi"
    return {"status": "success", "is_paused_for_human": c.is_paused_for_human, "message": status_str}

@router.post("/{conv_id}/reply")
async def operator_reply(conv_id: int, payload: OperatorReplyRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Conversation).join(Agent).where(Conversation.id == conv_id, Agent.user_id == current_user.id).options(selectinload(Conversation.agent))
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi")

    # 1. Save operator message to DB
    msg = ChatMessage(
        conversation_id=c.id,
        sender="human_operator",
        text=payload.text
    )
    db.add(msg)
    c.is_paused_for_human = True
    await db.commit()
    await db.refresh(msg)

    # 2. If agent has bot_token and customer_tg_id, send Telegram message directly to customer
    telegram_sent = False
    if c.agent and c.agent.bot_token and c.customer_tg_id:
        try:
            tg_url = f"https://api.telegram.org/bot{c.agent.bot_token}/sendMessage"
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(tg_url, json={
                    "chat_id": c.customer_tg_id,
                    "text": f"👤 Operator: {payload.text}"
                })
                telegram_sent = resp.status_code == 200
        except Exception as e:
            pass

    return {
        "status": "success",
        "message_id": msg.id,
        "telegram_sent": telegram_sent,
        "text": msg.text,
        "created_at": msg.created_at
    }
