"""
AI Tutor API - Main Application
Full notebook model ported to production FastAPI
"""

import json
import os
import re
import logging
import tempfile
import textwrap
from io import BytesIO
from pathlib import Path
from typing import Optional, List

import fitz  # PyMuPDF
import faiss
import numpy as np
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from gtts import gTTS
from PIL import Image, ImageDraw, ImageFont
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

# Resolve ffmpeg explicitly on Windows when PATH is stale after winget install.
def resolve_ffmpeg_binary() -> Optional[str]:
    candidates = [
        os.getenv("IMAGEIO_FFMPEG_EXE"),
        os.getenv("FFMPEG_BINARY"),
        r"C:\Users\LENOVO\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe",
    ]

    local_app_data = os.getenv("LOCALAPPDATA")
    if local_app_data:
        winget_root = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
        if winget_root.exists():
            for package_dir in winget_root.glob("Gyan.FFmpeg*"):
                matches = list(package_dir.glob("**/bin/ffmpeg.exe"))
                candidates.extend(str(match) for match in matches)

    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(Path(candidate))
    return None


FFMPEG_BINARY_PATH = resolve_ffmpeg_binary()
if FFMPEG_BINARY_PATH:
    os.environ["IMAGEIO_FFMPEG_EXE"] = FFMPEG_BINARY_PATH
    os.environ["FFMPEG_BINARY"] = FFMPEG_BINARY_PATH

# moviepy v1.x imports (pin moviepy==1.0.3)
from moviepy.editor import AudioFileClip, ImageSequenceClip, concatenate_videoclips

load_dotenv()
from config import LLM_MODEL, OPENROUTER_API_KEY
from pipeline.llm_client import LLMClient, call_llm

# Global LLM client (singleton)
llm_client = LLMClient()

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="AI Tutor Production API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("./files", exist_ok=True)
app.mount("/files", StaticFiles(directory="./files"), name="files")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
if FFMPEG_BINARY_PATH:
    logger.info("Using ffmpeg binary at: %s", FFMPEG_BINARY_PATH)
else:
    logger.warning("ffmpeg binary not found. Video generation may fail until ffmpeg is configured.")

# ── Constants (video) ─────────────────────────────────────────────────────────
VIDEO_W      = 1280
VIDEO_H      = 720
FPS          = 24
BG_COLOR     = (245, 247, 255)
ACCENT_COLOR = (95, 71, 221)
BUBBLE_COLOR = (255, 255, 255)
BORDER_COLOR = (200, 200, 220)
TEXT_COLOR   = (255, 100, 10)   # vibrant orange — easy to read for kids

OUTPUT_DIR   = Path("./files")
OUTPUT_DIR.mkdir(exist_ok=True)

# ── Embedding model (loaded once) ─────────────────────────────────────────────
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

# ── Pydantic models ───────────────────────────────────────────────────────────
class LearnerProfile(BaseModel):
    age: int
    level: str
    language: str = "en"
    condition: Optional[str] = None


class ExplanationRequest(BaseModel):
    courseId: str
    courseTitle: str
    content: str
    courseFileUrl: Optional[str] = None
    learnerProfile: LearnerProfile


class QuizRequest(BaseModel):
    content: str
    difficulty: str = "medium"
    numQuestions: int = 5
    courseTitle: Optional[str] = None
    courseFileUrl: Optional[str] = None


class AudioRequest(BaseModel):
    text: str
    courseFileUrl: Optional[str] = None
    language: str = "en"


class VideoRequest(BaseModel):
    text: str
    courseFileUrl: Optional[str] = None
    language: str = "en"
    avatar_gender: str = "girl"


class ExplanationResponse(BaseModel):
    explanation: str
    keyPoints: List[str]


class QuizResponse(BaseModel):
    quiz: List[dict]


class AudioResponse(BaseModel):
    audioUrl: str


class VideoResponse(BaseModel):
    videoUrl: str


class UploadPdfResponse(BaseModel):
    filename: str
    pages: int
    extractedText: str


# ═════════════════════════════════════════════════════════════════════════════
# CORE PIPELINE HELPERS
# ═════════════════════════════════════════════════════════════════════════════

def extract_text(pdf_path: str) -> str:
    """Open a PDF and concatenate all page text into a single string."""
    doc  = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def chunk_text(text: str, size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping fixed-size windows."""
    chunks = []
    step   = size - overlap
    for start in range(0, len(text), step):
        chunk = text[start: start + size]
        if len(chunk) > 20:
            chunks.append(chunk)
    return chunks


def retrieve(query: str, chunks: List[str], k: int = 4) -> List[str]:
    """Semantic nearest-neighbour retrieval with FAISS."""
    if not chunks:
        return []
    query_emb = np.array(embed_model.encode([query])).astype("float32")
    text_embs = np.array(embed_model.encode(chunks)).astype("float32")
    index     = faiss.IndexFlatL2(text_embs.shape[1])
    index.add(text_embs)
    _, indices = index.search(query_emb, min(k, len(chunks)))
    return [chunks[i] for i in indices[0] if i < len(chunks)]


def build_prompt(profile: dict, context: str, question: str) -> str:
    """Construct a style-adapted prompt from a learner profile."""
    condition = (profile.get("condition") or "default").lower()

    if condition == "adhd":
        style = "Explain in short, punchy sentences. Use bullet points — maximum 3 bullets per idea."
    elif condition == "autism":
        style = "Explain with numbered steps. Be literal and precise."
    elif condition == "dyslexia":
        style = "Use very short sentences. One idea per sentence only."
    else:
        style = "Explain clearly and naturally."

    age_note = f"The learner is {profile.get('age', 10)} years old."

    return f"""You are a patient AI tutor.

STYLE: {style}

{age_note}

Use ONLY the context below to answer. Do not add outside knowledge.

CONTEXT:
{context}

QUESTION:
{question}"""


# call_llm() removed - use llm_client methods instead
logger.info(f"AI Tutor API ready! LLM Key status: {'LOADED' if OPENROUTER_API_KEY else 'MISSING (using mocks)'} | Model: {LLM_MODEL}")


def clean_text_for_tts(text: str) -> str:
    """Strip markdown / special characters that confuse gTTS."""
    text = re.sub(r"\*+", "", text)
    text = re.sub(r"#+\s*", "", text)
    text = re.sub(r"\[.*?\]\(.*?\)", "", text)
    text = re.sub(r"[^\w\s.,!?;:\-'\"]", " ", text)
    return re.sub(r"\s{2,}", " ", text).strip()


def build_mock_quiz(topic: str, num_questions: int) -> List[dict]:
    topic_label = topic or "this lesson"
    total = max(1, num_questions)
    return [
        {
            "question": f"What is the main idea of {topic_label}?",
            "options": [
                "The lesson explains the core topic.",
                "The lesson is about an unrelated game.",
                "The lesson contains no useful information.",
                "The lesson is only a picture gallery.",
            ],
            "answer": "A",
            "explanation": "The PDF content is being summarized to explain the core topic clearly.",
        }
        for _ in range(total)
    ]


def resolve_content(text: str, file_url: Optional[str]) -> str:
    """
    Return the text to embed.
    If a PDF URL is provided, download it, extract its text, and prepend.
    """
    extra = ""
    if file_url and isinstance(file_url, str) and re.match(r"^https?://", file_url.strip(), re.IGNORECASE):
        try:
            r = requests.get(file_url, timeout=30)
            r.raise_for_status()
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
                f.write(r.content)
                tmp_path = f.name
            extra = extract_text(tmp_path)
            os.unlink(tmp_path)
        except Exception as e:
            logger.warning(f"Could not download/extract PDF from {file_url}: {e}")
    return (extra + "\n\n" + text).strip() if extra else text


# ═════════════════════════════════════════════════════════════════════════════
# VIDEO HELPERS  (ported from notebook cells 12-B → 12-I)
# ═════════════════════════════════════════════════════════════════════════════

def get_avatar(gender: str = "girl", size: int = 250) -> Image.Image:
    seed  = "MayaTutor"      if gender == "girl" else "MaxTutor"
    bg    = "b6e3f4"         if gender == "girl" else "c0aede"
    style = "adventurer"     if gender == "girl" else "adventurer-neutral"
    url   = (
        f"https://api.dicebear.com/7.x/{style}/png"
        f"?seed={seed}&size={size}&backgroundColor={bg}"
    )
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        return Image.open(BytesIO(r.content)).convert("RGBA")
    except Exception as e:
        logger.warning(f"Avatar download failed ({e}) — using placeholder")
        return Image.new("RGBA", (size, size), (180, 210, 240, 255))


def build_frame(
    topic: str,
    avatar_img: Image.Image,
    slide_num: int,
    total_slides: int,
    current_display_text: str,
    full_text: str,
    phase: str = "content",
) -> Image.Image:
    canvas = Image.new("RGB", (VIDEO_W, VIDEO_H), BG_COLOR)
    draw   = ImageDraw.Draw(canvas)

    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
        font_body  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except OSError:
        font_title = font_body = font_small = ImageFont.load_default()

    # Title bar
    draw.rectangle([0, 0, VIDEO_W, 64], fill=ACCENT_COLOR)
    topic_display = topic.replace("_", " ")[:40]
    draw.text((20, 18), f"🎓 {topic_display}", font=font_title, fill=(255, 255, 255))
    draw.text((VIDEO_W - 160, 18), f"Slide {slide_num}/{total_slides}", font=font_small, fill=(220, 220, 255))

    if phase in ("intro", "outro"):
        av_size = 320
        av_big  = avatar_img.resize((av_size, av_size), Image.LANCZOS)
        av_x    = (VIDEO_W - av_size) // 2
        av_y    = 100
        canvas.paste(av_big, (av_x, av_y), av_big)
        msg  = f"🌟 Topic: {topic_display}" if phase == "intro" else "✅ Great job! Keep it up!"
        bbox = draw.textbbox((0, 0), msg, font=font_title)
        draw.text(((VIDEO_W - (bbox[2] - bbox[0])) // 2, av_y + av_size + 20), msg, font=font_title, fill=TEXT_COLOR)
        return canvas

    # Content phase — avatar left, speech bubble right
    av_size  = 250
    av       = avatar_img.resize((av_size, av_size), Image.LANCZOS)
    av_x, av_y = 50, 150
    canvas.paste(av, (av_x, av_y), av)

    bx = av_x + av_size + 40
    by = 80
    bw = VIDEO_W - bx - 50
    bh = VIDEO_H - by - 80

    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=22, fill=BUBBLE_COLOR, outline=BORDER_COLOR, width=2)
    tail = [(bx, av_y + av_size // 2 - 20), (bx - 28, av_y + av_size // 2), (bx, av_y + av_size // 2 + 20)]
    draw.polygon(tail, fill=BUBBLE_COLOR, outline=BORDER_COLOR)

    wrapped = textwrap.fill(current_display_text, width=30)
    draw.multiline_text((bx + 20, by + 18), wrapped, font=font_body, fill=TEXT_COLOR, spacing=15)

    # Progress dots
    progress_ratio = len(current_display_text) / max(len(full_text), 1)
    dot_area_w     = bw - 40
    filled_dots    = int(progress_ratio * 20)
    for d in range(20):
        dot_color = ACCENT_COLOR if d < filled_dots else (210, 210, 220)
        draw.ellipse(
            [bx + 20 + d * (dot_area_w // 20), by + bh - 24,
             bx + 20 + d * (dot_area_w // 20) + 10, by + bh - 14],
            fill=dot_color,
        )

    return canvas


def para_to_audio(text: str, path: str, lang: str = "en") -> str:
    gTTS(text=text, lang=lang, slow=False).save(path)
    return path


def merge_audio_video(video_clip, audio_path: str, output_path: str) -> str:
    audio_clip = AudioFileClip(audio_path)
    video_dur  = video_clip.duration
    audio_dur  = audio_clip.duration

    if audio_dur > video_dur:
        repeats    = int(audio_dur // video_dur) + 1
        video_clip = concatenate_videoclips([video_clip] * repeats)
        video_clip = video_clip.subclip(0, audio_dur)
    else:
        video_clip = video_clip.subclip(0, min(audio_dur + 0.5, video_dur))

    final = video_clip.set_audio(audio_clip)
    final.write_videofile(output_path, fps=FPS, codec="libx264", audio_codec="aac", logger=None)
    audio_clip.close()
    return output_path


def create_micro_lesson_video(
    topic: str,
    explanation_text: str,
    lesson_id: int,
    total_lessons: int,
    avatar_gender: str = "girl",
    language: str = "en",
) -> str:
    safe_topic   = re.sub(r"[^\w]", "_", topic)[:40]
    audio_path   = str(OUTPUT_DIR / f"lesson_{lesson_id}_{safe_topic}_audio.mp3")

    para_to_audio(explanation_text, audio_path, lang=language)

    audio_temp   = AudioFileClip(audio_path)
    audio_dur    = audio_temp.duration
    audio_temp.close()
    total_frames = int((audio_dur + 1.0) * FPS)

    avatar_img   = get_avatar(gender=avatar_gender, size=250)

    INTRO_FRAMES   = min(int(1.5 * FPS), total_frames // 5)
    OUTRO_FRAMES   = min(int(0.8 * FPS), total_frames // 6)
    CONTENT_FRAMES = total_frames - INTRO_FRAMES - OUTRO_FRAMES
    chars_per_frame = max(1, len(explanation_text) // max(CONTENT_FRAMES, 1))

    frames  = []
    char_idx = 0

    for f in range(total_frames):
        if f < INTRO_FRAMES:
            phase        = "intro"
            display_text = ""
        elif f >= total_frames - OUTRO_FRAMES:
            phase        = "outro"
            display_text = explanation_text
        else:
            phase    = "content"
            char_idx = min(char_idx + chars_per_frame, len(explanation_text))
            display_text = explanation_text[:char_idx]

        frame_img = build_frame(
            topic=topic,
            avatar_img=avatar_img,
            slide_num=lesson_id,
            total_slides=total_lessons,
            current_display_text=display_text,
            full_text=explanation_text,
            phase=phase,
        )
        frames.append(np.array(frame_img))

    video_clip  = ImageSequenceClip(frames, fps=FPS)
    output_path = str(OUTPUT_DIR / f"lesson_{lesson_id}_{safe_topic}.mp4")
    merge_audio_video(video_clip, audio_path, output_path)
    return output_path


# ═════════════════════════════════════════════════════════════════════════════
# API ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@app.post("/api/explain", response_model=ExplanationResponse)
async def generate_explanation(request: ExplanationRequest):
    try:
        content = resolve_content(request.content, request.courseFileUrl)
        chunks  = chunk_text(content)
        profile = request.learnerProfile.dict()

        question = f"Explain the main concepts of: {request.courseTitle}"
        relevant = retrieve(question, chunks, k=4)
        context  = "\n\n".join(relevant)
        prompt   = build_prompt(profile, context, question)

        explanation = call_llm(prompt, max_tokens=600)

        # Extract bullet-style key points from the explanation
        lines = [ln.strip(" -•*") for ln in explanation.split("\n") if ln.strip()]
        key_points = [ln for ln in lines if len(ln) > 20][:5]

        return ExplanationResponse(explanation=explanation, keyPoints=key_points)

    except Exception as e:
        logger.exception("Explanation generation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/explain", response_model=ExplanationResponse)
async def generate_explanation_alias(request: ExplanationRequest):
    return await generate_explanation(request)


@app.post("/api/quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    try:
        content = resolve_content(request.content, request.courseFileUrl)
        chunks  = chunk_text(content)
        topic   = request.courseTitle or "the document"

        if not OPENROUTER_API_KEY:
            return QuizResponse(quiz=build_mock_quiz(topic, request.numQuestions))

        relevant = retrieve(topic, chunks, k=5)
        context  = "\n\n".join(relevant)

        prompt = f"""Create {request.numQuestions} multiple-choice quiz questions about: "{topic}"
Difficulty: {request.difficulty}

Use ONLY the context below.

CONTEXT:
{context}

Return ONLY valid JSON in exactly this format (no extra text):
{{
  "quiz": [
    {{
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "Brief reason why the correct answer is right"
    }}
  ]
}}"""

        system_msg = "You are a quiz generator. Reply ONLY with valid JSON, no extra text or markdown."
        raw = call_llm(prompt, max_tokens=1000, system_message=system_msg)

        # Strip possible markdown fences
        raw = re.sub(r"```json|```", "", raw).strip()
        data = json.loads(raw)
        return QuizResponse(quiz=data["quiz"])

    except json.JSONDecodeError as e:
        logger.error(f"Quiz JSON parse error: {e}")
        raise HTTPException(status_code=500, detail="LLM returned invalid JSON for quiz.")
    except Exception as e:
        logger.exception("Quiz generation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio", response_model=AudioResponse)
async def generate_audio(request: AudioRequest):
    try:
        content  = resolve_content(request.text, request.courseFileUrl)
        chunks   = chunk_text(content)
        relevant = retrieve("explain", chunks, k=4)
        context  = "\n\n".join(relevant)

        prompt = build_prompt(
            {"age": 10, "condition": "default"},
            context,
            "Give a clear spoken explanation of the main topic.",
        )
        script = call_llm(prompt, max_tokens=400)
        script = clean_text_for_tts(script)

        filename   = f"audio_{abs(hash(script)) % 100000}.mp3"
        audio_path = f"./files/{filename}"
        gTTS(text=script, lang=request.language, slow=False).save(audio_path)

        return AudioResponse(audioUrl=f"/files/{filename}")

    except Exception as e:
        logger.exception("Audio generation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/video", response_model=VideoResponse)
async def generate_video(request: VideoRequest):
    try:
        content  = resolve_content(request.text, request.courseFileUrl)
        chunks   = chunk_text(content)
        relevant = retrieve("explain", chunks, k=4)
        context  = "\n\n".join(relevant)

        prompt = build_prompt(
            {"age": 10, "condition": "default"},
            context,
            "Give a short, clear explanation suitable for a 30–60 second educational video.",
        )
        explanation = call_llm(prompt, max_tokens=300)
        explanation = clean_text_for_tts(explanation)

        video_path = create_micro_lesson_video(
            topic=explanation[:40],
            explanation_text=explanation,
            lesson_id=1,
            total_lessons=1,
            avatar_gender=request.avatar_gender,
            language=request.language,
        )

        filename = os.path.basename(video_path)
        return VideoResponse(videoUrl=f"/files/{filename}")

    except Exception as e:
        logger.exception("Video generation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ai-tutor-api",
        "llmConfigured": bool(OPENROUTER_API_KEY),
        "model": LLM_MODEL,
    }


@app.post("/api/upload-pdf", response_model=UploadPdfResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")

    try:
        doc = fitz.open(stream=data, filetype="pdf")
        try:
            extracted_text = "".join(page.get_text() for page in doc)
            pages = len(doc)
        finally:
            doc.close()

        return UploadPdfResponse(
            filename=file.filename,
            pages=pages,
            extractedText=extracted_text,
        )
    except Exception as e:
        logger.exception("PDF upload processing failed")
        raise HTTPException(status_code=500, detail=str(e))
