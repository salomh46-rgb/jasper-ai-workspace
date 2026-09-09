from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.knowledge import KnowledgeItem
from app.services.ai_service import AIService

router = APIRouter(prefix="/agents", tags=["Agents"])

# Shablonlar kutubxonasi
TEMPLATES = {
    "clinic": {
        "name": "Stomatologiya & Klinika AI Qabulxona",
        "system_prompt": "Siz nufuzli tibbiyot klinikasi va stomatologiyaning aqlli, mehribon va professional AI administratorisiz. Mijozlarga xizmatlar, shifokorlar malakasi va narxlar bo'yicha ma'lumot bering. Qabulga yozilish istagida bo'lganlardan ismini, telefon raqamini va qulay vaqtni aniqlang.",
        "welcome_message": "Assalomu alaykum! Klinikamizning sun'iy intellekt yordamchisiga xush kelibsiz. Sizga qanday yordam bera olaman?",
        "default_knowledge": [
            {"title": "Klinika xizmatlari va narxlari", "content": "1. Terapevtik davolash: 150,000 so'mdan\n2. Tish tozalash (Air Flow): 200,000 so'm\n3. Implantatsiya: 2,500,000 so'mdan\n4. Bepul dastlabki konsultatsiya va rentgen ko'rigi mavjud.", "category": "price"},
            {"title": "Qabul tartibi", "content": "Qabulga yozilish uchun mijoz ismini, telefon raqamini va tashrif buyurmoqchi bo'lgan sana/vaqtini qoldirishi kifoya.", "category": "policy"}
        ]
    },
    "shop": {
        "name": "Kiyim & Do'kon AI Sotuvchi",
        "system_prompt": "Siz zamonaviy brend kiyim va aksessuarlar do'konining professional AI savdo menejerisiz. Mijozlarga mahsulot o'lchamlari, matolari, yetkazib berish shartlari va mavjud tovarlar haqida to'liq maslahat bering. Buyurtma bermoqchi bo'lgan mijozdan qaysi tovar kerakligi, o'lchami, manzili va telefon raqamini so'rang.",
        "welcome_message": "Salom! Do'konimizning AI savdo yordamchisiman. Sizga qaysi mahsulot yoki o'lcham bo'yicha yordam beray?",
        "default_knowledge": [
            {"title": "Yetkazib berish shartlari", "content": "Toshkent shahri bo'ylab yetkazib berish — 25,000 so'm (1 kunda). Viloyatlarga BTS/Pochta orqali — 35,000 so'm (2-3 kunda). 300,000 so'mdan yuqori buyurtmalarga bepul.", "category": "policy"},
            {"title": "To'lov turlari", "content": "Click, Payme, Uzum Bank yoki buyurtmani qo'lga olganda naqd pul shaklida to'lash mumkin.", "category": "policy"}
        ]
    },
    "education": {
        "name": "O'quv Markazi AI Maslahatchi",
        "system_prompt": "Siz zamonaviy o'quv markazining ta'lim bo'yicha bosh AI konsultantisiz. Kurslar davomiyligi, narxlari, dars jadvali va ustozlar haqida batafsil ma'lumot bering. O'quvchini bepul ochiq darsga yoki sinov testiga yozib oling.",
        "welcome_message": "Assalomu alaykum! O'quv markazimizning AI konsultantiga xush kelibsiz. Qaysi kurs yoki yo'nalish sizni qiziqtiryapti?",
        "default_knowledge": [
            {"title": "Kurslar va narxlar", "content": "1. Dasturlash (Python / Frontend): 800,000 so'm/oy\n2. Ingliz tili (IELTS / General): 600,000 so'm/oy\n3. Matematika: 500,000 so'm/oy. Birinchi dars har doim mutlaqo bepul!", "category": "price"}
        ]
    },
    "craftsman": {
        "name": "Usta Bozor & Servis AI Dispetcher",
        "system_prompt": "Siz usta xizmatlari (santexnik, elektrik, mebel, maishiy texnika ta'mirlash) servisining tezkor va aniq AI dispetcherisiz. Mijozdan qanday nosozlik bo'lgani, manzil va qulay vaqtni aniqlab, mutaxassisni yo'naltiring.",
        "welcome_message": "Assalomu alaykum! Qanday ta'mirlash yoki o'rnatish xizmati bo'yicha yordam kerak?",
        "default_knowledge": [
            {"title": "Servis narxlari va kafolat", "content": "Usta ko'rigi va diagnostika — 50,000 so'm. Har bir bajarilgan ishga 6 oygacha rasmiy kafolat beriladi.", "category": "service"}
        ]
    }
}

class AgentCreateRequest(BaseModel):
    name: str
    category: str = "clinic"
    bot_token: str
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    working_hours: Optional[str] = None
    system_prompt: Optional[str] = None
    welcome_message: Optional[str] = None

class AgentUpdateRequest(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    working_hours: Optional[str] = None
    system_prompt: Optional[str] = None
    welcome_message: Optional[str] = None
    voice_enabled: Optional[bool] = None
    human_takeover_enabled: Optional[bool] = None
    is_active: Optional[bool] = None

class TestAgentRequest(BaseModel):
    message: str

@router.get("/templates")
async def get_templates():
    return TEMPLATES

@router.get("")
async def list_agents(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Agent).where(Agent.user_id == current_user.id).options(
        selectinload(Agent.knowledge_items),
        selectinload(Agent.leads)
    ).order_by(Agent.id.desc())
    res = await db.execute(stmt)
    agents = res.scalars().all()
    
    result = []
    for a in agents:
        result.append({
            "id": a.id,
            "name": a.name,
            "category": a.category,
            "company_name": a.company_name,
            "bot_token_masked": a.bot_token[:6] + "..." + a.bot_token[-4:] if len(a.bot_token) > 10 else "***",
            "bot_username": a.bot_username,
            "voice_enabled": a.voice_enabled,
            "human_takeover_enabled": a.human_takeover_enabled,
            "is_active": a.is_active,
            "knowledge_count": len(a.knowledge_items),
            "leads_count": len(a.leads),
            "created_at": a.created_at
        })
    return result

@router.post("")
async def create_agent(payload: AgentCreateRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Shablonni tanlash
    tpl = TEMPLATES.get(payload.category, TEMPLATES["clinic"])
    
    sys_prompt = payload.system_prompt or tpl["system_prompt"]
    welcome_msg = payload.welcome_message or tpl["welcome_message"]

    agent = Agent(
        user_id=current_user.id,
        name=payload.name,
        category=payload.category,
        bot_token=payload.bot_token.strip(),
        company_name=payload.company_name,
        phone_number=payload.phone_number,
        address=payload.address,
        working_hours=payload.working_hours,
        system_prompt=sys_prompt,
        welcome_message=welcome_msg
    )
    db.add(agent)
    await db.flush()

    # Default bilimlarni avtomatik kiritish
    for k in tpl.get("default_knowledge", []):
        k_item = KnowledgeItem(
            agent_id=agent.id,
            title=k["title"],
            content=k["content"],
            category=k["category"]
        )
        db.add(k_item)

    await db.commit()
    await db.refresh(agent)
    return {"status": "success", "agent_id": agent.id, "message": "Agent muvaffaqiyatli yaratildi!"}

@router.get("/{agent_id}")
async def get_agent(agent_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Agent).where(Agent.id == agent_id, Agent.user_id == current_user.id).options(
        selectinload(Agent.knowledge_items)
    )
    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent topilmadi")
    return agent

@router.put("/{agent_id}")
async def update_agent(agent_id: int, payload: AgentUpdateRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Agent).where(Agent.id == agent_id, Agent.user_id == current_user.id)
    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent topilmadi")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(agent, field, val)

    await db.commit()
    await db.refresh(agent)
    return {"status": "success", "message": "Agent muvaffaqiyatli yangilandi!"}

@router.post("/{agent_id}/test")
async def test_agent(agent_id: int, payload: TestAgentRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Agent).where(Agent.id == agent_id, Agent.user_id == current_user.id).options(
        selectinload(Agent.knowledge_items)
    )
    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent topilmadi")

    ai_res = await AIService.generate_response(
        agent=agent,
        knowledge_items=agent.knowledge_items,
        chat_history=[],
        user_message=payload.message
    )
    return ai_res

@router.delete("/{agent_id}")
async def delete_agent(agent_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Agent).where(Agent.id == agent_id, Agent.user_id == current_user.id)
    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent topilmadi")

    await db.delete(agent)
    await db.commit()
    return {"status": "success", "message": "Agent o'chirildi"}
