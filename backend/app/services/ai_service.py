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
1. Har doim samimiy, xushmuomala, professional va tabiiy o'zbek tilida (yoki mijoz gapirgan/yozgan tilda) javob bering.
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
    async def _call_gemini_api(cls, contents: List[Dict[str, Any]], system_instruction: str) -> Dict[str, Any]:
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            return {
                "reply": "Assalomu alaykum! Tizim sinov rejimida ishlamoqda. Xabaringiz qabul qilindi!",
                "lead_data": None
            }

        candidate_models = [settings.GEMINI_MODEL, "gemini-flash-lite-latest", "gemini-3.6-flash", "gemini-flash-latest"]
        candidate_models = list(dict.fromkeys([m for m in candidate_models if m]))

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

        async with httpx.AsyncClient(timeout=30.0) as client:
            for model_name in candidate_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                try:
                    res = await client.post(url, json=payload)
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
                    else:
                        logger.warning(f"Gemini API model {model_name} xatolik: {data}. Keyingi model sinab ko'rilmoqda...")
                        continue
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
        
        contents = []
        for msg in chat_history[-6:]:
            role = "user" if msg["sender"] == "customer" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["text"]}]
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
        base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        
        contents = []
        for msg in chat_history[-4:]:
            role = "user" if msg["sender"] == "customer" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg["text"]}]
            })
        
        contents.append({
            "role": "user",
            "parts": [
                {
                    "inlineData": {
                        "mimeType": mime_type,
                        "data": base64_audio
                    }
                },
                {
                    "text": "Mijoz yuqoridagi ovozli xabarni yubordi. Uning ovozli murojaatini o'zbek tilida to'liq tushunib, bilimlar bazasi asosida samimiy, aniq va xushmuomala javob qaytaring. Agar buyurtma yoki qabulga yozilish niyati bo'lsa, lead_json blokini qo'shing."
                }
            ]
        })

        return await cls._call_gemini_api(contents, system_instruction)

    @classmethod
    async def enhance_system_prompt(cls, business_description: str, category: str = "custom") -> Dict[str, str]:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return {
                "suggested_name": "Mening AI Yordamchim",
                "system_prompt": f"Siz {business_description} sohasi bo'yicha aqlli va xushmuomala AI konsultantisiz.",
                "welcome_message": "Assalomu alaykum! Sizga qanday yordam bera olaman?"
            }

        prompt = f"""Quyidagi biznes uchun professional, yuqori konversiyali va samimiy Telegram AI Agent sozlamalarini o'zbek tilida yaratib bering.
Hech qanday qoliplarga cheklanmang. Biznesning o'ziga xos xususiyatlarini to'liq ochib bering.

Biznes haqida ma'lumot:
"{business_description}"
Yo'nalish: {category}

Quyidagi JSON formatda javob bering (boshqa hech narsa yozmang):
```json
{{
  "suggested_name": "Qisqa va jarangdor agent nomi (masalan: Samarqand Oshxona AI)",
  "welcome_message": "Mijoz /start bosganda chiqadigan samimiy va chiroyli salomlashish xabari",
  "system_prompt": "AI uchun to'liq va mukammal ko'rsatma (xarakteri, qanday muloqot qilishi, mijozdan ma'lumot olish tartibi)"
}}
```"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}]
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, json=payload)
                data = res.json()
                if "candidates" in data:
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    if "```json" in raw_text:
                        json_str = raw_text.split("```json")[1].split("```")[0].strip()
                    elif "```" in raw_text:
                        json_str = raw_text.split("```")[1].split("```")[0].strip()
                    else:
                        json_str = raw_text.strip()
                    return json.loads(json_str)
        except Exception as e:
            logger.error(f"Error enhancing prompt: {e}")

        return {
            "suggested_name": "Shaxsiy AI Operator",
            "welcome_message": "Assalomu alaykum! Xizmatimizga xush kelibsiz. Sizga qanday yordam berishim mumkin?",
            "system_prompt": f"Siz {business_description} bo'yicha mijozlarga professional maslahat beruvchi va buyurtmalarni qabul qiluvchi aqlli AI xodimisiz."
        }
