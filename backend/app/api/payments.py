from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.agent import Agent
from app.models.lead import Lead
from app.models.payment import PaymentInvoice
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])

class CreateInvoiceRequest(BaseModel):
    agent_id: int
    lead_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    amount: float
    description: Optional[str] = None
    provider: Optional[str] = "click"

class UpdateInvoiceStatusRequest(BaseModel):
    status: str  # 'paid', 'pending', 'cancelled'

@router.get("/stats")
async def get_payment_stats(
    agent_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PaymentInvoice).where(PaymentInvoice.user_id == current_user.id)
    if agent_id:
        query = query.where(PaymentInvoice.agent_id == agent_id)
    
    res = await db.execute(query)
    invoices = res.scalars().all()

    total_revenue = sum(inv.amount for inv in invoices if inv.status == "paid")
    pending_amount = sum(inv.amount for inv in invoices if inv.status == "pending")
    total_count = len(invoices)
    paid_count = sum(1 for inv in invoices if inv.status == "paid")

    return {
        "total_revenue": total_revenue,
        "pending_amount": pending_amount,
        "total_invoices": total_count,
        "paid_invoices": paid_count,
        "currency": "UZS"
    }

@router.get("")
async def list_invoices(
    agent_id: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(PaymentInvoice).where(PaymentInvoice.user_id == current_user.id).options(
        selectinload(PaymentInvoice.agent)
    ).order_by(PaymentInvoice.id.desc()).limit(limit)

    if agent_id:
        query = query.where(PaymentInvoice.agent_id == agent_id)
    if status:
        query = query.where(PaymentInvoice.status == status)

    res = await db.execute(query)
    invoices = res.scalars().all()

    result = []
    for inv in invoices:
        result.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "agent_id": inv.agent_id,
            "agent_name": inv.agent.name if inv.agent else "Noma'lum",
            "lead_id": inv.lead_id,
            "customer_name": inv.customer_name,
            "customer_phone": inv.customer_phone,
            "amount": inv.amount,
            "currency": inv.currency,
            "description": inv.description,
            "provider": inv.provider,
            "status": inv.status,
            "payment_url_click": inv.payment_url_click,
            "payment_url_payme": inv.payment_url_payme,
            "paid_at": inv.paid_at,
            "created_at": inv.created_at
        })
    return result

@router.post("/create-invoice")
async def create_invoice(
    payload: CreateInvoiceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check agent ownership
    stmt = select(Agent).where(Agent.id == payload.agent_id, Agent.user_id == current_user.id)
    res = await db.execute(stmt)
    agent = res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent topilmadi")

    invoice_number = PaymentService.generate_invoice_number()
    
    click_url = PaymentService.generate_click_url(
        service_id=agent.click_service_id,
        merchant_id=agent.click_merchant_id,
        amount=payload.amount,
        transaction_param=invoice_number
    )

    payme_url = PaymentService.generate_payme_url(
        merchant_id=agent.payme_merchant_id,
        amount=payload.amount,
        order_id=invoice_number
    )

    invoice = PaymentInvoice(
        user_id=current_user.id,
        agent_id=payload.agent_id,
        lead_id=payload.lead_id,
        invoice_number=invoice_number,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        amount=payload.amount,
        currency="UZS",
        description=payload.description or "Xizmat / Mahsulot uchun to'lov",
        provider=payload.provider or "click",
        status="pending",
        payment_url_click=click_url,
        payment_url_payme=payme_url
    )

    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    return {
        "status": "success",
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "amount": invoice.amount,
        "click_url": click_url,
        "payme_url": payme_url,
        "uzum_info": PaymentService.generate_uzum_payment_info(agent.uzum_card_number, invoice.amount),
        "message": "To'lov hisobi (Invoice) muvaffaqiyatli yaratildi!"
    }

@router.post("/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: int,
    payload: UpdateInvoiceStatusRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(PaymentInvoice).where(PaymentInvoice.id == invoice_id, PaymentInvoice.user_id == current_user.id)
    res = await db.execute(stmt)
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="To'lov hujjati topilmadi")

    inv.status = payload.status
    if payload.status == "paid":
        inv.paid_at = datetime.utcnow()
    else:
        inv.paid_at = None

    await db.commit()
    return {"status": "success", "invoice_id": inv.id, "new_status": inv.status}
