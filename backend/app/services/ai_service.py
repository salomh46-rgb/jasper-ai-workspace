import json
import logging
import base64
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    @classmethod
    def _build_system_instruction(cls, agent, knowledge_items: List[Any]) -> str:
        knowledge_text = ""
        if knowledge_items:
            knowledge_text = "\n\n--- KOMPANIYA MA'LUMOTLARI VA XIZMATLAR BAZASI ---\n"
            for item in knowledge_items:
                knowledge_text += f"📌 {item.title}:\n{item.content}\n\n"
        
        company_info = ""
        c_name = getattr(agent, "company_name", None)
        c_phone = getattr(agent, "phone_number", None)
        c_addr = getattr(agent, "address", None)
        c_hours = getattr(agent, "working_hours", None)
        if c_name or c_phone or c_addr or c_hours:
            company_info = (
                f"\n--- ALOQA VA TASHKILOT MA'LUMOTLARI ---\n"
                f"🏢 Tashkilot: {c_name or 'Kompaniya'}\n"
                f"📞 Telefon: {c_phone or 'Mavjud emas'}\n"
                f"📍 Manzil: {c_addr or 'Mavjud emas'}\n"
                f"⏰ Ish vaqti: {c_hours or 'Mavjud emas'}\n"
            )

        payment_info = ""
        if getattr(agent, "click_merchant_id", None) or getattr(agent, "payme_merchant_id", None) or getattr(agent, "uzum_card_number", None):
            payment_info = (
                f"\n--- TO'LOV VA KASSA MA'LUMOTLARI ---\n"
                f"💳 Qabul qilinadigan to'lovlar: Click, Payme, Uzum Bank, Naqd.\n"
                f"Karta / Ruxsat: {getattr(agent, 'uzum_card_number', 'Kassa orqali')}\n"
                f"Mijoz to'lov qilmoqchi bo'lsa, to'lov havolasi yoki karta orqali to'lash imkoni borligini xushmuomalalik bilan ayting.\n"
            )

        instructions = f"""{agent.system_prompt}

{company_info}
{payment_info}
{knowledge_text}

--- MUHIM KO'RSATMALAR ---
1. Har doim samimiy, xushmuomala, professional va tabiiy o'zbek tilida qisqa, aniq va lo'nda javob bering.
2. Faqat yuqoridagi bilimlar bazasiga asoslanib aniq javob bering.
3. Agar mijoz xizmatga/qabulga yozilmoqchi bo'lsa yoki tez yordam holati bo'lsa, zudlik bilan kerakli choralarni va telefon raqamini aniqlang.
4. Javobingiz oxirida AGAR mijoz o'z telefon raqamini yoki buyurtma xohishini bildirgan bo'lsa, maxsus JSON blok qo'shing:
```lead_json
{{
  "has_lead": true,
  "customer_name": "Ism yoki null",
  "customer_phone": "Telefon yoki null",
  "intent": "emergency | appointment | order | consultation",
  "summary": "Mijoz xohishi haqida qisqacha xulosa"
}}
```
Agar hali lid shakllanmagan bo'lsa, `lead_json` blokini qo'shmang."""
        return instructions

    @classmethod
    async def _call_gemini_api(cls, contents: List[Dict[str, Any]], system_instruction: str) -> Dict[str, Any]:
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            return {
                "reply": "Assalomu alaykum! Tizim sinov rejimida ishlamoqda. Xabaringiz qabul qilindi!",
                "lead_data": None
            }

        # Use the fastest reliable model first (gemini-flash-lite-latest responds in sub-second)
        candidate_models = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-2.5-flash-lite", settings.GEMINI_MODEL]
        candidate_models = list(dict.fromkeys([m for m in candidate_models if m]))

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 600
            }
        }

        async with httpx.AsyncClient(timeout=8.0) as client:
            for model_name in candidate_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                try:
                    res = await client.post(url, json=payload)
                    if res.status_code != 200:
                        continue
                    data = res.json()
                    
                    if "candidates" in data and len(data["candidates"]) > 0:
                        raw_reply = data["candidates"][0]["content"]["parts"][0]["text"]
                        
                        lead_data = None
                        if "```lead_json" in raw_reply:
                            parts = raw_reply.split("```lead_json")
                            clean_reply = parts[0].strip()
                            json_str = parts[1].split("```")[0].strip()
                            try:
                                lead_data = json.loads(json_str)
                            except Exception:
                                pass
                        else:
                            clean_reply = raw_reply.strip()
                        
                        return {
                            "reply": clean_reply,
                            "lead_data": lead_data
                        }
                except Exception as e:
                    logger.error(f"Error calling model {model_name}: {e}")
                    continue

        return {
            "reply": "Assalomu alaykum! Xabaringiz yetib keldi. Tez orada operatorimiz siz bilan bog'lanadi.",
            "lead_data": None
        }

    @classmethod
    async def generate_response(
        cls,
        agent,
        knowledge_items: List[Any],
        chat_history: List[Dict[str, str]],
        user_message: str
    ) -> Dict[str, Any]:
        system_instruction = cls._build_system_instruction(agent, knowledge_items)

        # Ultra fast response for standard single-word greetings
        clean_msg = user_message.strip().lower()
        if clean_msg in ["salom", "assalomu alaykum", "salom aleykum", "hayrli kun", "/start"]:
            welcome = agent.welcome_message or "Assalomu alaykum! Sizga qanday yordam bera olaman?"
            return {"reply": welcome, "lead_data": None}

        contents = []
        for msg in chat_history[-4:]:
            role = "user" if msg.get("sender") == "customer" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.get("text", "")}]
            })

        contents.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        return await cls._call_gemini_api(contents, system_instruction)

    @classmethod
    async def process_voice_message(
        cls,
        agent,
        knowledge_items: List[Any],
        chat_history: List[Dict[str, str]],
        audio_bytes: bytes,
        mime_type: str = "audio/ogg"
    ) -> Dict[str, Any]:
        system_instruction = cls._build_system_instruction(agent, knowledge_items)
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        contents = [{
            "role": "user",
            "parts": [
                {
                    "inlineData": {
                        "mimeType": mime_type,
                        "data": audio_b64
                    }
                },
                {
                    "text": "Ushbu ovozli xabarni diqqat bilan tinglang va bilimlaringiz asosida professional tarzda o'zbek tilida javob bering."
                }
            ]
        }]

        return await cls._call_gemini_api(contents, system_instruction)

    @classmethod
    async def enhance_system_prompt(cls, user_description: str, category: str = "custom") -> Dict[str, str]:
        prompt = f"""Siz tajribali AI Agent me'morisiz. Foydalanuvchi quyidagi biznes/tashkilot uchun Telegram AI Agent yaratmoqchi:
Tavsif: "{user_description}"
Kategoriya: "{category}"

Ushbu ma'lumotdan kelib chiqib:
1. Mukammal, aniq va do'stona System Prompt (Tizim ko'rsatmasi) tuzib bering.
2. Salomlashish xabari (/start) tayyorlang.
3. Kategoriya nomini aniqlang.

Javobingizni FAQAT quyidagi JSON formatda qaytaring:
{{
  "name": "Kompaniya yoki Agent nomi",
  "system_prompt": "Tizim ko'rsatmasi...",
  "welcome_message": "Salomlashish xabari..."
}}"""

        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            return {
                "name": "Maxsus AI Yordamchi",
                "system_prompt": f"Siz {user_description} bo'yicha mijozlarga xizmat ko'rsatuvchi professional AI xodimsiz.",
                "welcome_message": "Assalomu alaykum! Sizga qanday yordam bera olaman?"
            }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                res = await client.post(url, json=payload)
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
            except Exception as e:
                logger.error(f"Error generating AI prompt: {e}")
                return {
                    "name": "Maxsus AI Agent",
                    "system_prompt": f"Siz {user_description} bo'yicha aqlli yordamchisiz.",
                    "welcome_message": "Assalomu alaykum! Sizga qanday yordam bera olaman?"
                }
