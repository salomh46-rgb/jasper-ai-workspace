from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.lead import Lead

router = APIRouter(prefix="/leads", tags=["Leads"])

class LeadStatusUpdate(BaseModel):
    status: str  # 'new', 'in_progress', 'completed', 'cancelled'

@router.get("")
async def list_leads(
    agent_id: Optional[int] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Lead).join(Agent).where(Agent.user_id == current_user.id).options(selectinload(Lead.agent))
    if agent_id:
        stmt = stmt.where(Lead.agent_id == agent_id)
    if status:
        stmt = stmt.where(Lead.status == status)

    stmt = stmt.order_by(Lead.id.desc())
    res = await db.execute(stmt)
    leads = res.scalars().all()

    result = []
    for l in leads:
        result.append({
            "id": l.id,
            "agent_id": l.agent_id,
            "agent_name": l.agent.name if l.agent else "Noma'lum",
            "customer_tg_id": l.customer_tg_id,
            "customer_name": l.customer_name,
            "customer_phone": l.customer_phone,
            "intent": l.intent,
            "summary": l.summary,
            "status": l.status,
            "created_at": l.created_at
        })
    return result

@router.put("/{lead_id}")
async def update_lead_status(lead_id: int, payload: LeadStatusUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Lead).join(Agent).where(Lead.id == lead_id, Agent.user_id == current_user.id)
    res = await db.execute(stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lid topilmadi")

    lead.status = payload.status
    await db.commit()
    return {"status": "success", "message": "Lid holati yangilandi"}
