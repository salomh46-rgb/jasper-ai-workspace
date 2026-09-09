import io
import os
import base64
import logging
import httpx
import openpyxl
from pypdf import PdfReader
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class DocumentParserService:
    @classmethod
    async def parse_file(cls, filename: str, content_bytes: bytes, mime_type: str = "") -> List[Dict[str, str]]:
        """Fayl turiga qarab matn, jadval yoki rasmdan ma'lumotlarni ajratib oladi"""
        ext = os.path.splitext(filename)[1].lower()
        items = []

        try:
            if ext == ".pdf":
                items = cls._parse_pdf(filename, content_bytes)
            elif ext in [".xlsx", ".xls"]:
                items = cls._parse_excel(filename, content_bytes)
            elif ext == ".csv":
                text = content_bytes.decode("utf-8", errors="ignore")
                items = [{"title": f"{filename} (Jadval)", "content": text, "category": "price"}]
            elif ext in [".txt", ".md", ".json"]:
                text = content_bytes.decode("utf-8", errors="ignore")
                items = [{"title": f"{filename} (Hujjat)", "content": text, "category": "service"}]
            elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
                items = await cls._parse_image_with_gemini(filename, content_bytes, mime_type or "image/jpeg")
            else:
                text = content_bytes.decode("utf-8", errors="ignore")
                items = [{"title": filename, "content": text[:3000], "category": "service"}]
        except Exception as e:
            logger.error(f"Fayl tahlil qilishda xatolik ({filename}): {e}")
            raise ValueError(f"Faylni tahlil qilib bo'lmadi: {str(e)}")

        return items

    @classmethod
    def _parse_pdf(cls, filename: str, content_bytes: bytes) -> List[Dict[str, str]]:
        reader = PdfReader(io.BytesIO(content_bytes))
        total_pages = len(reader.pages)
        full_text = ""
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                full_text += f"\n--- {i+1}-sahifa ---\n" + page_text.strip() + "\n"

        if not full_text.strip():
            raise ValueError("PDF ichida o'qiladigan matn topilmadi. Agar bu skaner qilingan rasm bo'lsa, rasm formatida yuklang.")

        # If text is too long, split by 2500 chars chunks
        if len(full_text) > 3000:
            chunks = []
            paragraphs = full_text.split("\n\n")
            cur_chunk = ""
            part_num = 1
            for p in paragraphs:
                if len(cur_chunk) + len(p) > 2000:
                    chunks.append({"title": f"{filename} (Qism {part_num})", "content": cur_chunk.strip(), "category": "service"})
                    part_num += 1
                    cur_chunk = p + "\n\n"
                else:
                    cur_chunk += p + "\n\n"
            if cur_chunk.strip():
                chunks.append({"title": f"{filename} (Qism {part_num})", "content": cur_chunk.strip(), "category": "service"})
            return chunks
        else:
            return [{"title": f"{filename} (To'liq)", "content": full_text.strip(), "category": "service"}]

    @classmethod
    def _parse_excel(cls, filename: str, content_bytes: bytes) -> List[Dict[str, str]]:
        wb = openpyxl.load_workbook(io.BytesIO(content_bytes), data_only=True)
        items = []

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            rows = list(ws.iter_rows(values_only=True))
            if not rows or len(rows) < 2:
                continue

            headers = [str(h or f"Ustun_{i+1}") for i, h in enumerate(rows[0])]
            table_md = "| " + " | ".join(headers) + " |\n"
            table_md += "| " + " | ".join(["---"] * len(headers)) + " |\n"

            for r in rows[1:]:
                if all(v is None for v in r):
                    continue
                row_vals = [str(v if v is not None else "") for v in r]
                # align with header length
                row_vals = (row_vals + [""] * len(headers))[:len(headers)]
                table_md += "| " + " | ".join(row_vals) + " |\n"

            items.append({
                "title": f"{filename} ({sheet_name} jadvali)",
                "content": table_md.strip(),
                "category": "price"
            })

        if not items:
            raise ValueError("Excel fayl ichida to'ldirilgan ma'lumotlar topilmadi.")

        return items

    @classmethod
    async def _parse_image_with_gemini(cls, filename: str, content_bytes: bytes, mime_type: str) -> List[Dict[str, str]]:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return [{"title": filename, "content": "Rasm yuklandi (AI kaliti o'rnatilmagan)", "category": "service"}]

        base64_img = base64.b64encode(content_bytes).decode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
        
        prompt = """Ushbu rasmdagi (prayst-list, kafe menyusi, xizmatlar narxi, sertifikat yoki e'lon) barcha matnlar, narxlar, shartlar va ma'lumotlarni o'zbek tilida to'liq va aniq qilib matn/jadval ko'rinishida yozib bering.
Hech qanday ma'lumotni o'tkazib yubormang. Faqat rasmdagi faktik ma'lumotlarni yozing."""

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"inlineData": {"mimeType": mime_type, "data": base64_img}},
                        {"text": prompt}
                    ]
                }
            ]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, json=payload)
            data = res.json()
            if "candidates" in data and len(data["candidates"]) > 0:
                extracted_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                return [{
                    "title": f"{filename} (Rasm Menyu/Narxlar)",
                    "content": extracted_text,
                    "category": "price"
                }]
            else:
                raise ValueError(f"Gemini rasmni tahlil qila olmadi: {data}")
