from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    
    customer_tg_id = Column(BigInteger, nullable=False, index=True)
    customer_name = Column(String(150), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    
    intent = Column(String(100), nullable=True)  # 'appointment', 'order', 'consultation'
    summary = Column(Text, nullable=False)        # "Kuzatuv: Ertaga soat 15:00 ga stomatolog ko'rigiga yozilmoqchi"
    status = Column(String(50), default="new")   # 'new', 'in_progress', 'completed', 'cancelled'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agent = relationship("Agent", back_populates="leads")
