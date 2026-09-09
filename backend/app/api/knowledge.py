from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.knowledge import KnowledgeItem
from app.services.document_parser import DocumentParserService

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

@router.post("/upload-file")
async def upload_knowledge_file(
    agent_id: int = Form(...),
    category: str = Form("service"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify agent ownership
    stmt = select(Agent).where(Agent.id == agent_id, Agent.user_id == current_user.id)
    res = await db.execute(stmt)
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Agent topilmadi")

    content_bytes = await file.read()
    if len(content_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="Fayl hajmi 20MB dan oshmasligi kerak")

    try:
        parsed_items = await DocumentParserService.parse_file(
            filename=file.filename,
            content_bytes=content_bytes,
            mime_type=file.content_type or ""
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    saved_items = []
    for item in parsed_items:
        k_item = KnowledgeItem(
            agent_id=agent_id,
            title=item["title"],
            content=item["content"],
            category=item.get("category", category)
        )
        db.add(k_item)
        saved_items.append(k_item)

    await db.commit()
    for item in saved_items:
        await db.refresh(item)

    return {
        "status": "success",
        "message": f"'{file.filename}' faylidan {len(saved_items)} ta bilim muvaffaqiyatli saqlandi!",
        "items_count": len(saved_items),
        "items": [
            {"id": it.id, "title": it.title, "category": it.category} for it in saved_items
        ]
    }

@router.get("/agent/{agent_id}")
async def list_agent_knowledge(agent_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
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
