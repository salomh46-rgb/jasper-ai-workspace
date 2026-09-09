from sqlalchemy import Column, Integer, String, Text, BigInteger, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    
    customer_tg_id = Column(BigInteger, nullable=False)
    customer_name = Column(String(150), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    intent = Column(String(100), nullable=True)
    summary = Column(Text, nullable=False)
    status = Column(String(50), default="new")  # 'new', 'contacted', 'converted', 'closed'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agent = relationship("Agent", back_populates="leads")
    invoices = relationship("PaymentInvoice", back_populates="lead")
