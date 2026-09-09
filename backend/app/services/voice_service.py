import logging
import edge_tts
import io
import re
from typing import Optional

logger = logging.getLogger("voice_service")

class VoiceService:
    # Uzbek Neural Voices: "uz-UZ-MadinaNeural" (Ayol ovozi), "uz-UZ-SardorNeural" (Erkak ovozi)
    DEFAULT_VOICE = "uz-UZ-MadinaNeural"

    @classmethod
    def clean_text_for_tts(cls, text: str) -> str:
        # Remove markdown symbols, emoji overload, JSON blocks
        cleaned = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        cleaned = re.sub(r'[\*_#`~\[\]\(\)]', '', cleaned)
        cleaned = re.sub(r'https?://\S+', 'havola', cleaned)
        cleaned = cleaned.strip()
        return cleaned[:800]  # Limit length for rapid TTS response

    @classmethod
    async def text_to_speech(cls, text: str, voice: str = DEFAULT_VOICE) -> bytes:
        cleaned_text = cls.clean_text_for_tts(text)
        if not cleaned_text:
            cleaned_text = "Assalomu alaykum, sizga qanday yordam bera olaman?"

        try:
            communicate = edge_tts.Communicate(cleaned_text, voice)
            audio_bytes = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes += chunk["data"]
            return audio_bytes
        except Exception as e:
            logger.error(f"TTS generation error: {e}")
            # Fallback to male voice if female fails
            try:
                communicate = edge_tts.Communicate(cleaned_text, "uz-UZ-SardorNeural")
                audio_bytes = b""
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_bytes += chunk["data"]
                return audio_bytes
            except Exception as e2:
                logger.error(f"Fallback TTS failed: {e2}")
                return b""
