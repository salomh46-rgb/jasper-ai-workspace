import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.auth import router as auth_router
from app.api.agents import router as agents_router
from app.api.knowledge import router as knowledge_router
from app.api.leads import router as leads_router
from app.api.stats import router as stats_router
from app.webhook.router import router as webhook_router

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("jasper_workspace")

from app.services.master_bot import start_master_bot, stop_master_bot

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Jasper AI Workspace ishga tushmoqda...")
    await init_db()
    logger.info("✅ Ma'lumotlar bazasi initsializatsiya qilindi.")
    await start_master_bot()
    yield
    await stop_master_bot()
    logger.info("🛑 Jasper AI Workspace to'xtatildi.")

app = FastAPI(
    title="Jasper AI Workspace API",
    description="Telegram Mini App & Multi-Tenant AI Agent Builder SaaS Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS sozlamalari (Mini App va tashqi Dashboard uchun)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routerlarni ulash
app.include_router(auth_router, prefix="/api")
app.include_router(agents_router, prefix="/api")
app.include_router(knowledge_router, prefix="/api")
app.include_router(leads_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(webhook_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "Jasper AI Workspace SaaS Platform",
        "version": "1.0.0",
        "gemini_model": settings.GEMINI_MODEL
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
