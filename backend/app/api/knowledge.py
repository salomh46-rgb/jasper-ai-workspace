from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.knowledge import KnowledgeItem

router = APIRouter(prefix="/knowledge", tags=["Knowledge"])

class KnowledgeCreateRequest(BaseModel):
    agent_id: int
    title: str
    content: str
    category: str = "service"

class KnowledgeUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/agent/{agent_id}")
async def list_agent_knowledge(agent_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify agent ownership
    stmt = select(Agent).where(Agent.id == agent_id, Agent.user_id == current_user.id)
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Agent topilmadi")

    k_stmt = select(KnowledgeItem).where(KnowledgeItem.agent_id == agent_id).order_by(KnowledgeItem.id.desc())
    k_res = await db.execute(k_stmt)
    return k_res.scalars().all()

@router.post("")
async def create_knowledge_item(payload: KnowledgeCreateRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Agent).where(Agent.id == payload.agent_id, Agent.user_id == current_user.id)
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Agent topilmadi")

    item = KnowledgeItem(
        agent_id=payload.agent_id,
        title=payload.title,
        content=payload.content,
        category=payload.category
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{item_id}")
async def delete_knowledge_item(item_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(KnowledgeItem).join(Agent).where(KnowledgeItem.id == item_id, Agent.user_id == current_user.id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Ma'lumot topilmadi")

    await db.delete(item)
    await db.commit()
    return {"status": "success", "message": "Ma'lumot o'chirildi"}
