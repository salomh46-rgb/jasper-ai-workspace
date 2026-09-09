import logging
import edge_tts
import io
import re
from typing import Optional

logger = logging.getLogger("voice_service")

class VoiceService:
    # High-quality neural voices per language
    VOICES = {
        "uz_female": "uz-UZ-MadinaNeural",
        "uz_male": "uz-UZ-SardorNeural",
        "ru_female": "ru-RU-SvetlanaNeural",
        "ru_male": "ru-RU-DmitryNeural",
        "en_female": "en-US-JennyNeural",
        "en_male": "en-US-GuyNeural"
    }
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
    def detect_language(cls, text: str) -> str:
        """Detect language based on characters and common keywords."""
        cyrillic_count = len(re.findall(r'[\u0400-\u04FF]', text))
        total_letters = len(re.findall(r'[a-zA-Z\u0400-\u04FF]', text))
        
        if total_letters == 0:
            return "uz"
            
        # If substantial Cyrillic characters present, check if Russian or Cyrillic Uzbek
        if cyrillic_count / total_letters > 0.3:
            return "ru"

        # Check for English indicators
        english_words = {"the", "is", "and", "hello", "welcome", "please", "thank", "you", "service", "appointment", "help", "order", "delivery"}
        words = set(re.findall(r'[a-zA-Z]+', text.lower()))
        if len(words.intersection(english_words)) >= 2:
            return "en"

        return "uz"

    @classmethod
    async def text_to_speech(cls, text: str, voice: str = "auto") -> bytes:
        cleaned_text = cls.clean_text_for_tts(text)
        if not cleaned_text:
            cleaned_text = "Assalomu alaykum, sizga qanday yordam bera olaman?"

        selected_voice = voice
        if not selected_voice or selected_voice == "auto":
            detected_lang = cls.detect_language(cleaned_text)
            if detected_lang == "ru":
                selected_voice = "ru-RU-SvetlanaNeural"
            elif detected_lang == "en":
                selected_voice = "en-US-JennyNeural"
            else:
                selected_voice = "uz-UZ-MadinaNeural"

        try:
            communicate = edge_tts.Communicate(cleaned_text, selected_voice)
            audio_bytes = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes += chunk["data"]
            return audio_bytes
        except Exception as e:
            logger.error(f"TTS generation error with voice {selected_voice}: {e}")
            # Fallback depending on voice type
            try:
                fallback_voice = "ru-RU-DmitryNeural" if "ru-RU" in str(selected_voice) else ("en-US-GuyNeural" if "en-US" in str(selected_voice) else "uz-UZ-SardorNeural")
                communicate = edge_tts.Communicate(cleaned_text, fallback_voice)
                audio_bytes = b""
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_bytes += chunk["data"]
                return audio_bytes
            except Exception as e2:
                logger.error(f"Fallback TTS failed: {e2}")
                return b""

