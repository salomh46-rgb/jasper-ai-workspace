from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(200), nullable=False)  # Masalan: "Plomba va tish davolash narxlari"
    content = Column(Text, nullable=False)        # Matn, narxlar, shartlar
    category = Column(String(50), default="service")  # 'service', 'price', 'faq', 'policy'
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agent = relationship("Agent", back_populates="knowledge_items")
