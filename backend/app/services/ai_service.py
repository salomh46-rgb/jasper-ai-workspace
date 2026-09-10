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

--- QAT'IY VA MUHIM KO'RSATMALAR (CRITICAL MULTILINGUAL RULES) ---
1. TILNI AVTOMATIK MOSLASHTIRISH (STRICT LANGUAGE MATCHING):
   - Foydalanuvchi / Mijoz sizga qaysi tilda murojaat qilsa (yoki gapirsa), SIZ HAM 100% AYNAN O'SHA TILDA (Rus, Ingliz yoki O'zbek) javob bering!
   - Agar mijoz Rus tilida yozsa yoki gapirsa ("У меня боль в ноге", "Здравствуйте", "Сколько стоит?") -> BARCHA JAVOBINGIZNI FAQAT VA FAQAT SOF RUS TILIDA BERING! Hech qanday o'zbekcha so'z aralashtirmang!
   - Agar mijoz Ingliz tilida yozsa yoki gapirsa ("I have pain in my leg", "Hello", "How much?") -> BARCHA JAVOBINGIZNI FAQAT VA FAQAT SOF INGLIZ TILIDA BERING!
   - Agar mijoz O'zbek tilida yozsa yoki gapirsa ("Oyog'im og'riyapti", "Salom", "Narxi qancha?") -> SOF O'ZBEK TILIDA javob bering.
2. Bilimlar bazasidagi ma'lumotlar boshqa tilda yozilgan bo'lsa ham, ularning mazmunini mijozning tiliga moslashtirib (tarjima qilib) tushuntiring.
3. Agar mijoz shoshilinch yordamga yoki qabulga yozilmoqchi bo'lsa, xushmuomala va aniq yo'l-yo'riq ko'rsating.
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
                    "text": "Ushbu ovozli xabarni diqqat bilan eshiting va tahlil qiling. MUHIM: Foydalanuvchi qaysi tilda gapirgan bo'lsa (agar ruscha gapirgan bo'lsa — RUSCHA, agar inglizcha gapirgan bo'lsa — INGLIZCHA, agar o'zbekcha gapirgan bo'lsa — O'ZBEKCHA), AYNAN O'SHA TILDA ravon, muloyim va professional javob bering!"
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

    @classmethod
    async def generate_complete_business_pack(
        cls, business_name: str, category: str = "custom", phone: str = "", address: str = ""
    ) -> Dict[str, Any]:
        """1-bosishda butun biznes uchun to'liq agent va bilimlar bazasini generatsiya qilish"""
        prompt = f"""Siz biznesni avtomatlashtirish bo'yicha eng tajribali AI mutaxassissiz.
Biznes nomi: "{business_name}"
Sohasi/Yo'nalishi: "{category}"
Telefon: "{phone or "Mavjud emas"}"
Manzil: "{address or "Toshkent shahri"}"

Ushbu biznes uchun O'zbekiston bozoriga mos, eng yuqori sifatli Telegram AI sotuvchi/konsultant xodimining to'liq ma'lumotlar paketini yarating:
1. "name": Botning chiroyli nomi (Masalan: "{business_name} AI Yordamchi")
2. "system_prompt": Mijozlar bilan muloyim, tezkor va savdoni oshiruvchi xulq-atvor qoidasi (UZ/RU/EN ko'p tillilik qoidasi bilan)
3. "welcome_message": Telegramda /start bosganda chiqadigan samimiy, emoji va bo'limlar bilan bezatilgan salomlashish xabari
4. "knowledge_items": Aynan shu sohaga mos 4 ta tayyor bilimlar bazasi elementi:
   - 1-bilim: "Ish vaqti va lokatsiya" (Manzil, ish vaqti, mo'ljal) -> category: "service"
   - 2-bilim: "Asosiy xizmatlar va narxlar" (Sohaga mos 3-4 ta xizmat/mahsulot va o'rtacha narxlari) -> category: "price"
   - 3-bilim: "Ko'p beriladigan savollar (FAQ)" (Mijozlar eng ko'p so'raydigan 2-3 ta savol va aniq javoblar) -> category: "faq"
   - 4-bilim: "Yetkazib berish va to'lov shartlari" (Click, Payme, naqd va yetkazish) -> category: "policy"

Javobingizni FAQAT quyidagi JSON formatida bering:
{{
  "name": "{business_name} AI Xodimi",
  "system_prompt": "...",
  "welcome_message": "...",
  "knowledge_items": [
    {{"title": "Ish vaqti va manzil", "category": "service", "content": "..."}},
    {{"title": "Asosiy xizmatlar va narxlar", "category": "price", "content": "..."}},
    {{"title": "Ko'p beriladigan savollar (FAQ)", "category": "faq", "content": "..."}},
    {{"title": "Yetkazib berish va to'lov", "category": "policy", "content": "..."}}
  ]
}}"""

        fallback = {
            "name": f"{business_name} AI Xodimi",
            "system_prompt": f"Siz {business_name} kompaniyasining aqlli, xushmuomala va professional AI konsultantisiz. Mijozlarga barcha savollar bo'yicha yordam bering.",
            "welcome_message": f"Assalomu alaykum! {business_name} xizmatiga xush kelibsiz. Sizga qanday yordam bera olaman?",
            "knowledge_items": [
                {"title": "Ish vaqti va manzil", "category": "service", "content": f"Manzil: {address or 'Toshkent sh.'}\nTelefon: {phone or '+998 90 123 45 67'}\nIsh vaqti: Har kuni 09:00 dan 20:00 gacha."},
                {"title": "Xizmatlar va narxlar", "category": "price", "content": f"{business_name} barcha asosiy xizmatlarni qulay narxlarda taqdim etadi. Batafsil ma'lumot uchun menejer bilan bog'lanishingiz mumkin."},
                {"title": "Savol-Javob (FAQ)", "category": "faq", "content": "1. Qanday buyurtma berish mumkin? - Botga xabar yozish yoki telefon orqali.\n2. Bepul konsultatsiya bormi? - Ha, birinchi so'rov bepul."},
                {"title": "To'lov turlari", "category": "policy", "content": "Click, Payme, Uzum Bank va naqd to'lovlar qabul qilinadi."}
            ]
        }

        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            return fallback

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text)
                    if "name" in parsed and "system_prompt" in parsed:
                        return parsed
                return fallback
            except Exception as e:
                logger.error(f"Error in generate_complete_business_pack: {e}")
                return fallback
