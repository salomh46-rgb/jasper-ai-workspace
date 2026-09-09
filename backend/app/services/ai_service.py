import json
import logging
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
        if agent.company_name or agent.phone_number or agent.address or agent.working_hours:
            company_info = (
                f"\n--- ALOQA VA TASHKILOT MA'LUMOTLARI ---\n"
                f"🏢 Tashkilot: {agent.company_name or 'Kompaniya'}\n"
                f"📞 Telefon: {agent.phone_number or 'Mavjud emas'}\n"
                f"📍 Manzil: {agent.address or 'Mavjud emas'}\n"
                f"⏰ Ish vaqti: {agent.working_hours or 'Mavjud emas'}\n"
            )

        instructions = f"""{agent.system_prompt}

{company_info}
{knowledge_text}

--- MUHIM KO'RSATMALAR ---
1. Har doim samimiy, xushmuomala, professional va tabiiy o'zbek tilida (yoki mijoz yozgan tilda) javob bering.
2. Faqat yuqoridagi bilimlar bazasiga asoslanib aniq javob bering. Bilmagan narsangizni to'qimang.
3. Agar mijoz xizmatga/qabulga yozilmoqchi bo'lsa yoki mahsulot sotib olmoqchi bo'lsa:
   - Undan ismini, telefon raqamini va qulay vaqtini/manzilini aniqlang.
4. Javobingiz oxirida AGAR mijoz o'z telefon raqamini yoki buyurtma xohishini bildirgan bo'lsa, maxsus JSON blok qo'shing:
```lead_json
{{
  "has_lead": true,
  "customer_name": "Ism yoki null",
  "customer_phone": "Telefon yoki null",
  "intent": "appointment | order | consultation",
  "summary": "Mijoz xohishi haqida qisqacha xulosa"
}}
```
Agar hali lid shakllanmagan bo'lsa, `lead_json` blokini qo'shmang."""
        return instructions

    @classmethod
    async def generate_response(
        cls,
        agent,
        knowledge_items: List[Any],
        chat_history: List[Dict[str, str]],
        user_message: str
    ) -> Dict[str, Any]:
        system_instruction = cls._build_system_instruction(agent, knowledge_items)
        
        # Build contents for Gemini API
        contents = []
        for msg in chat_history[-6:]:  # oxirgi 6 ta xabar kontekst uchun
            role = "user" if msg["sender"] == "customer" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["text"]}]
            })
        
        contents.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            return {
                "reply": f"Assalomu alaykum! Men {agent.name} sun'iy intellekt yordamchisiman. Hozirda tizim sinov rejimida ishlamoqda. Xabaringiz qabul qilindi!",
                "lead_data": None
            }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={api_key}"
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 800
            }
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(url, json=payload)
                data = res.json()
                
                if "candidates" in data and len(data["candidates"]) > 0:
                    raw_reply = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Parse lead_json if generated
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
                else:
                    logger.error(f"Gemini API error response: {data}")
                    return {
                        "reply": "Kechirasiz, hozirda javob berishda texnik nosozlik yuz berdi. Tez orada javob beramiz!",
                        "lead_data": None
                    }
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            return {
                "reply": "Assalomu alaykum! Xabaringiz yetib keldi. Tez orada operatorimiz siz bilan bog'lanadi.",
                "lead_data": None
            }
