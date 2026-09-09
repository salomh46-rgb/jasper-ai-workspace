from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Jasper AI Workspace"
    ENVIRONMENT: str = "development"
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

settings = Settings()
