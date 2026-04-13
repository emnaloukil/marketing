from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from openai import OpenAI
import whisper
import tempfile
import os
from gtts import gTTS
from dotenv import load_dotenv
load_dotenv()
import uuid
from fastapi.responses import FileResponse

AUDIO_DIR = "audio"

app = FastAPI(
    title="Trilingual Chatbot API",
    description="Arabic / French / English — text + voice — powered by Groq (free) + Whisper local (free)",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Groq client (uses OpenAI-compatible SDK) ──────────────────────────────────
groq_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

# ── Whisper local (free, no API key needed) ───────────────────────────────────
print("Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("Whisper ready ✓")

SUPPORTED_LANGUAGES = {"ar", "fr", "en", "auto"}

"""SYSTEM_PROMPTS = {
    "ar": "أنت مساعد ذكي ومفيد. تحدث دائماً باللغة العربية الفصحى. كن واضحاً وموجزاً.",
    "fr": "Tu es un assistant intelligent et utile. Réponds toujours en français. Sois clair et concis.",
    "en": "You are a helpful and intelligent assistant. Always reply in English. Be clear and concise.",
    "auto": (
        "You are a helpful multilingual assistant. "
        "Detect the language of the user's message and always reply in the same language. "
        "You support Arabic, French, and English. If unsure, reply in English."
    ),
}"""
SYSTEM_PROMPTS = {
    "ar": "أنت مساعد لطيف للأطفال ذوي الاحتياجات الخاصة. استعمل كلمات بسيطة جداً وجمل قصيرة. كن داعماً ومشجعاً.",
    "fr": "Tu es un assistant pour enfants avec des besoins spéciaux. Utilise des phrases très simples et sois gentil.",
    "en": "You are a kind assistant for children with special needs. Use very simple words and short sentences.",
    "auto": "You are a kind multilingual assistant for children with special needs. Always use simple words and reply in the same language."
}

WHISPER_LANG_MAP = {"ar": "ar", "fr": "fr", "en": "en", "auto": None}

# ── Groq models (all free) ────────────────────────────────────────────────────
# Options: "llama3-8b-8192" | "llama3-70b-8192" | "mixtral-8x7b-32768" | "gemma2-9b-it"
GROQ_MODEL = "llama-3.1-8b-instant"

# ── Schemas ───────────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str       # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "auto"
    history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    reply: str
    detected_language: Optional[str] = None
    model: Optional[str] = None

class TranscribeResponse(BaseModel):
    transcript: str
    language: Optional[str] = None

# ── Helpers ───────────────────────────────────────────────────────────────────
def map_tts_language(lang: str):
    if lang == "ar":
        return "ar"
    elif lang == "fr":
        return "fr"
    else:
        return "en"
    
def detect_language(text: str) -> str:
    arabic_chars = sum(1 for c in text if "\u0600" <= c <= "\u06FF")
    if arabic_chars / max(len(text), 1) > 0.2:
        return "ar"
    french_markers = ["je", "tu", "il", "nous", "vous", "ils", "est", "et",
                      "le", "la", "les", "de", "du", "bonjour", "merci", "oui", "non","que"
                      ,"ce","ca","ici"]
    lower = text.lower()
    if any(f" {w} " in f" {lower} " for w in french_markers):
        return "fr"
    return "en"

def build_messages(system: str, history: List[Message], user_message: str) -> list:
    messages = [{"role": "system", "content": system}]
    for m in history:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": user_message})
    return messages

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "ok",
        "llm": f"Groq — {GROQ_MODEL} (free)",
        "stt": "Whisper local (free)",
        "endpoints": ["/chat", "/transcribe", "/languages", "/health", "/models"]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "groq_model": GROQ_MODEL, "whisper": "base"}

@app.get("/languages")
def languages():
    return {"supported": [
        {"code": "ar", "name": "Arabic",  "native": "العربية"},
        {"code": "fr", "name": "French",  "native": "Français"},
        {"code": "en", "name": "English", "native": "English"},
        {"code": "auto", "name": "Auto-detect", "native": "Auto"},
    ]}

@app.get("/models")
def models():
    """List of free Groq models you can use."""
    return {"models": [
        {"id": "llama3-8b-8192",      "description": "Fast, lightweight"},
        {"id": "llama3-70b-8192",     "description": "Best quality ← default"},
        {"id": "mixtral-8x7b-32768",  "description": "Long context (32k tokens)"},
        {"id": "gemma2-9b-it",        "description": "Google Gemma 2"},
    ]}

@app.post("/chat", response_model=ChatResponse)
@app.post("/chat")
def chat(request: ChatRequest):

    lang = request.language if request.language in SUPPORTED_LANGUAGES else "auto"
    detected = detect_language(request.message) if lang == "auto" else lang

    messages = build_messages(SYSTEM_PROMPTS[lang], request.history or [], request.message)

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            max_tokens=150,
            temperature=0.7,
        )

        reply = response.choices[0].message.content

        # 🔊 Generate voice
        audio_file = text_to_speech(reply, detected)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "reply": reply,
        "detected_language": detected,
        "model": GROQ_MODEL,
        "audio": audio_file   
    }

@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    file: UploadFile = File(...),
    language: Optional[str] = "auto"
):
    """
    Upload mic audio → get transcript (Whisper local, 100% free).
    Supported: wav, mp3, webm, ogg, m4a, flac
    """
    allowed = {".wav", ".mp3", ".webm", ".ogg", ".m4a", ".flac"}
    ext = os.path.splitext(file.filename or "audio.wav")[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400,
            detail=f"Format '{ext}' not supported. Use: wav, mp3, webm, ogg, m4a, flac")

    audio_bytes = await file.read()
    whisper_lang = WHISPER_LANG_MAP.get(language, None)

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    try:
        result = whisper_model.transcribe(tmp_path, language=whisper_lang)
        text = result["text"].strip()
        detected = result.get("language") or detect_language(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        os.unlink(tmp_path)

    return TranscribeResponse(transcript=text, language=detected)



@app.get("/audio/{filename}")
def get_audio(filename: str):
    file_path = os.path.join(AUDIO_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(file_path, media_type="audio/mpeg")




def text_to_speech(text: str, lang: str):
    try:
        tts_lang = map_tts_language(lang)
        
        filename = f"{uuid.uuid4()}.mp3"
        file_path = os.path.join(AUDIO_DIR, filename)

        tts = gTTS(text=text, lang=tts_lang)
        tts.save(file_path)

        return filename  

    except Exception as e:
        print("TTS error:", e)
        return None