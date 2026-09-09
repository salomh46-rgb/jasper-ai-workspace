import base64
import random
import time
from typing import Optional, Dict, Any

class PaymentService:
    @staticmethod
    def generate_invoice_number() -> str:
        timestamp = time.strftime("%y%m%d%H%M")
        rand = random.randint(100, 999)
        return f"INV-{timestamp}-{rand}"

    @staticmethod
    def generate_click_url(
        service_id: Optional[str],
        merchant_id: Optional[str],
        amount: float,
        transaction_param: str,
        return_url: str = "https://t.me/"
    ) -> str:
        s_id = service_id or "32456"
        m_id = merchant_id or "21450"
        return f"https://my.click.uz/services/pay?service_id={s_id}&merchant_id={m_id}&amount={amount:.2f}&transaction_param={transaction_param}&return_url={return_url}"

    @staticmethod
    def generate_payme_url(
        merchant_id: Optional[str],
        amount: float,
        order_id: str
    ) -> str:
        m_id = merchant_id or "64b0f9c2d1e2a3b4c5d6e7f8"
        amount_tiyin = int(amount * 100)
        raw_params = f"m={m_id};ac.order_id={order_id};a={amount_tiyin}"
        encoded = base64.b64encode(raw_params.encode("utf-8")).decode("utf-8")
        return f"https://checkout.paycom.uz/{encoded}"

    @staticmethod
    def generate_uzum_payment_info(card_number: Optional[str], amount: float) -> str:
        card = card_number or "8600 0000 0000 0000"
        return f"Uzum / Karta orqali: {card} (Summa: {amount:,.0f} so'm)"
