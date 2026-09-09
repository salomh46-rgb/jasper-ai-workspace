from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(150), nullable=False)
    category = Column(String(100), default="clinic")
    bot_token = Column(String(200), nullable=False)
    bot_username = Column(String(100), nullable=True)
    
    system_prompt = Column(Text, nullable=False)
    welcome_message = Column(Text, nullable=False)
    voice_enabled = Column(Boolean, default=True)
    human_takeover_enabled = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    
    # Custom contact info
    company_name = Column(String(200), nullable=True)
    phone_number = Column(String(50), nullable=True)
    address = Column(String(300), nullable=True)
    working_hours = Column(String(150), nullable=True)

    # Payment Integration Settings
    click_merchant_id = Column(String(100), nullable=True)
    click_service_id = Column(String(100), nullable=True)
    payme_merchant_id = Column(String(100), nullable=True)
    uzum_card_number = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="agents")
    knowledge_items = relationship("KnowledgeItem", back_populates="agent", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="agent", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="agent", cascade="all, delete-orphan")
    invoices = relationship("PaymentInvoice", back_populates="agent", cascade="all, delete-orphan")
