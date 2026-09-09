from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.lead import Lead
from app.models.conversation import Conversation, ChatMessage

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/overview")
async def get_overview(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Total agents
    agents_res = await db.execute(select(func.count(Agent.id)).where(Agent.user_id == current_user.id))
    total_agents = agents_res.scalar() or 0

    # 2. Total leads
    leads_res = await db.execute(select(func.count(Lead.id)).join(Agent).where(Agent.user_id == current_user.id))
    total_leads = leads_res.scalar() or 0

    # 3. New leads count
    new_leads_res = await db.execute(select(func.count(Lead.id)).join(Agent).where(Agent.user_id == current_user.id, Lead.status == "new"))
    new_leads = new_leads_res.scalar() or 0

    # 4. Total conversations
    conv_res = await db.execute(select(func.count(Conversation.id)).join(Agent).where(Agent.user_id == current_user.id))
    total_conversations = conv_res.scalar() or 0

    return {
        "total_agents": total_agents,
        "total_leads": total_leads,
        "new_leads": new_leads,
        "total_conversations": total_conversations,
        "ai_status": "Online (Gemini 2.5 Flash)",
        "server_time": func.now()
    }
