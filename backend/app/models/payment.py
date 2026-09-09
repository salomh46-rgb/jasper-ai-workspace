from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class PaymentInvoice(Base):
    __tablename__ = "payment_invoices"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    invoice_number = Column(String(100), unique=True, index=True, nullable=False)
    customer_name = Column(String(150), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    
    amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), default="UZS")
    description = Column(Text, nullable=True)

    provider = Column(String(50), default="click")  # 'click', 'payme', 'uzum', 'cash'
    status = Column(String(50), default="pending")  # 'pending', 'paid', 'cancelled', 'refunded'
    
    payment_url_click = Column(Text, nullable=True)
    payment_url_payme = Column(Text, nullable=True)
    payment_url_uzum = Column(Text, nullable=True)
    
    transaction_id = Column(String(150), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    agent = relationship("Agent", back_populates="invoices")
    lead = relationship("Lead", back_populates="invoices")
