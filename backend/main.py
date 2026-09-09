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
from app.api.conversations import router as conversations_router
from app.api.payments import router as payments_router
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

import asyncio

async def start_port_forwarder(source_port: int, target_port: int):
    if source_port == target_port:
        return None
    async def handle_client(reader, writer):
        try:
            t_reader, t_writer = await asyncio.open_connection("127.0.0.1", target_port)
            async def pipe(r, w):
                try:
                    while True:
                        data = await r.read(65536)
                        if not data:
                            break
                        w.write(data)
                        await w.drain()
                except Exception:
                    pass
                finally:
                    try:
                        w.close()
                    except Exception:
                        pass
            asyncio.create_task(pipe(reader, t_writer))
            asyncio.create_task(pipe(t_reader, writer))
        except Exception:
            try:
                writer.close()
            except Exception:
                pass
    try:
        server = await asyncio.start_server(handle_client, "0.0.0.0", source_port)
        logger.info(f"🔀 Port forwarding faollashtirildi: 0.0.0.0:{source_port} -> 127.0.0.1:{target_port}")
        return server
    except Exception as e:
        logger.warning(f"Zaxira port {source_port} ochishda ogohlantirish: {e}")
        return None

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Jasper AI Workspace ishga tushmoqda...")
    await init_db()
    logger.info("✅ Ma'lumotlar bazasi initsializatsiya qilindi.")

    # Start dual-port forwarder between 8080 and 8000 for Railway compatibility
    active_port = int(os.environ.get("PORT", 8080))
    forward_server = None
    if active_port == 8080:
        forward_server = await start_port_forwarder(8000, 8080)
    elif active_port == 8000:
        forward_server = await start_port_forwarder(8080, 8000)

    await start_master_bot()
    from app.services.bot_manager import BotManager
    await BotManager.start_all_agent_bots()
    yield
    if forward_server:
        forward_server.close()
        await forward_server.wait_closed()
    await stop_master_bot()
    from app.services.bot_manager import BotManager
    for tok in list(BotManager._active_bot_tasks.keys()):
        await BotManager.stop_bot(tok)
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

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Routerlarni ulash
app.include_router(auth_router, prefix="/api")
app.include_router(agents_router, prefix="/api")
app.include_router(knowledge_router, prefix="/api")
app.include_router(leads_router, prefix="/api")
app.include_router(stats_router, prefix="/api")
app.include_router(conversations_router, prefix="/api")
app.include_router(payments_router, prefix="/api")
app.include_router(webhook_router)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/info")
async def api_info():
    return {
        "status": "online",
        "app": "Jasper AI Workspace SaaS Platform",
        "version": "1.0.0",
        "gemini_model": settings.GEMINI_MODEL
    }

# Frontend SPA / Static Files Mount
FRONTEND_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "static"))

target_dist = None
if os.path.exists(STATIC_DIR) and os.path.exists(os.path.join(STATIC_DIR, "index.html")):
    target_dist = STATIC_DIR
elif os.path.exists(FRONTEND_DIST_DIR) and os.path.exists(os.path.join(FRONTEND_DIST_DIR, "index.html")):
    target_dist = FRONTEND_DIST_DIR

if target_dist:
    logger.info(f"🌐 Frontend Single-Page App yuklandi: {target_dist}")
    assets_dir = os.path.join(target_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"error": "Not Found"}
        potential_file = os.path.join(target_dist, full_path)
        if full_path and os.path.isfile(potential_file):
            return FileResponse(potential_file)
        return FileResponse(os.path.join(target_dist, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "status": "online",
            "app": "Jasper AI Workspace SaaS Platform",
            "version": "1.0.0",
            "gemini_model": settings.GEMINI_MODEL
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"🚀 Starting server on 0.0.0.0:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")

