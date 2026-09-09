import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Jasper AI Workspace"
    ENVIRONMENT: str = "production"
    PORT: int = 8000
    SECRET_KEY: str = "jasper-super-secret-workspace-key-2026-antigravity"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./jasper_workspace.db"
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = "YOUR_GEMINI_API_KEY_HERE"
    GEMINI_MODEL: str = "gemini-flash-lite-latest"
    
    # Master Bot for Telegram Mini App and Alerts
    MASTER_BOT_TOKEN: Optional[str] = None
    WEBHOOK_BASE_URL: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL
        if not url:
            return "sqlite+aiosqlite:///./jasper_workspace.db"
        # Handle Railway standard Postgres URL prefix
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("sqlite:///") and not url.startswith("sqlite+aiosqlite:///"):
            url = url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
        return url

settings = Settings()
