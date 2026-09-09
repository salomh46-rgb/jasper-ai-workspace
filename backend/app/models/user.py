from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=True)
    full_name = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=True)
    language = Column(String(10), default="uz")
    role = Column(String(20), default="business_owner")  # 'admin', 'business_owner'
    is_active = Column(Boolean, default=True)
    
    # SaaS Subscription Fields
    subscription_plan = Column(String(30), default="free")  # 'free', 'starter', 'pro', 'enterprise'
    plan_status = Column(String(20), default="active")       # 'active', 'pending', 'expired'
    plan_expires_at = Column(DateTime(timezone=True), nullable=True)
    max_bots = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agents = relationship("Agent", back_populates="owner", cascade="all, delete-orphan")
