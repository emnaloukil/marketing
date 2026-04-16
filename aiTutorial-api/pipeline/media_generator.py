"""
pipeline/media_generator.py — audio & video micro-lesson generation

Extracted from main.py so the heavy media logic lives in one place.

Public API:
  • generate_audio_file(text, out_path, lang)  → str  (path to .mp3)
  • create_micro_lesson_video(...)             → str  (path to .mp4)
"""

import logging
import re
import textwrap
from io import BytesIO
from pathlib import Path
from typing import Optional

import numpy as np
import requests
from gtts import gTTS
from PIL import Image, ImageDraw, ImageFont

# moviepy v1.x  (pin moviepy==1.0.3)
from moviepy.editor import AudioFileClip, ImageSequenceClip, concatenate_videoclips

logger = logging.getLogger(__name__)

# ── Visual constants ──────────────────────────────────────────────────────────
VIDEO_W      = 1280
VIDEO_H      = 720
FPS          = 24
BG_COLOR     = (245, 247, 255)
ACCENT_COLOR = (95, 71, 221)
BUBBLE_COLOR = (255, 255, 255)
BORDER_COLOR = (200, 200, 220)
TEXT_COLOR   = (255, 100, 10)   # vibrant orange — easy to read for kids

# ── Font paths (DejaVu ships with most Linux distros) ─────────────────────────
_FONT_BOLD   = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
_FONT_NORMAL = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def _load_fonts() -> tuple:
    """Return (font_title, font_body, font_small), falling back to default."""
    try:
        return (
            ImageFont.truetype(_FONT_BOLD,   26),
            ImageFont.truetype(_FONT_NORMAL, 40),
            ImageFont.truetype(_FONT_NORMAL, 18),
        )
    except OSError:
        default = ImageFont.load_default()
        return default, default, default


# ── Avatar ────────────────────────────────────────────────────────────────────

def get_avatar(gender: str = "girl", size: int = 250) -> Image.Image:
    """
    Fetch a DiceBear avatar PNG.  Falls back to a solid-colour placeholder
    if the request fails (e.g. offline / rate-limited).
    """
    seed  = "MayaTutor"          if gender == "girl" else "MaxTutor"
    bg    = "b6e3f4"             if gender == "girl" else "c0aede"
    style = "adventurer"         if gender == "girl" else "adventurer-neutral"
    url   = (
        f"https://api.dicebear.com/7.x/{style}/png"
        f"?seed={seed}&size={size}&backgroundColor={bg}"
    )
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        return Image.open(BytesIO(r.content)).convert("RGBA")
    except Exception as exc:
        logger.warning("Avatar download failed (%s) — using placeholder.", exc)
        placeholder_color = (182, 227, 244, 255) if gender == "girl" else (192, 174, 222, 255)
        return Image.new("RGBA", (size, size), placeholder_color)


# ── Frame builder ─────────────────────────────────────────────────────────────

def build_frame(
    topic:                str,
    avatar_img:           Image.Image,
    slide_num:            int,
    total_slides:         int,
    current_display_text: str,
    full_text:            str,
    phase:                str = "content",
) -> Image.Image:
    """
    Render a single 1280×720 video frame.

    Phases:
      "intro"   — full-screen avatar with topic title
      "content" — avatar left, speech bubble right with typewriter text
      "outro"   — full-screen avatar with completion message
    """
    canvas = Image.new("RGB", (VIDEO_W, VIDEO_H), BG_COLOR)
    draw   = ImageDraw.Draw(canvas)

    font_title, font_body, font_small = _load_fonts()

    # Title bar
    draw.rectangle([0, 0, VIDEO_W, 64], fill=ACCENT_COLOR)
    topic_display = topic.replace("_", " ")[:40]
    draw.text((20, 18), f"🎓 {topic_display}", font=font_title, fill=(255, 255, 255))
    draw.text(
        (VIDEO_W - 160, 18),
        f"Slide {slide_num}/{total_slides}",
        font=font_small,
        fill=(220, 220, 255),
    )

    if phase in ("intro", "outro"):
        av_size = 320
        av_big  = avatar_img.resize((av_size, av_size), Image.LANCZOS)
        av_x    = (VIDEO_W - av_size) // 2
        av_y    = 100
        canvas.paste(av_big, (av_x, av_y), av_big)
        msg  = f"🌟 Topic: {topic_display}" if phase == "intro" else "✅ Great job! Keep it up!"
        bbox = draw.textbbox((0, 0), msg, font=font_title)
        draw.text(
            ((VIDEO_W - (bbox[2] - bbox[0])) // 2, av_y + av_size + 20),
            msg,
            font=font_title,
            fill=TEXT_COLOR,
        )
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

    draw.rounded_rectangle(
        [bx, by, bx + bw, by + bh],
        radius=22,
        fill=BUBBLE_COLOR,
        outline=BORDER_COLOR,
        width=2,
    )
    # Speech-bubble tail
    tail = [
        (bx,      av_y + av_size // 2 - 20),
        (bx - 28, av_y + av_size // 2),
        (bx,      av_y + av_size // 2 + 20),
    ]
    draw.polygon(tail, fill=BUBBLE_COLOR, outline=BORDER_COLOR)

    wrapped = textwrap.fill(current_display_text, width=30)
    draw.multiline_text(
        (bx + 20, by + 18),
        wrapped,
        font=font_body,
        fill=TEXT_COLOR,
        spacing=15,
    )

    # Progress dots
    progress_ratio = len(current_display_text) / max(len(full_text), 1)
    dot_area_w     = bw - 40
    filled_dots    = int(progress_ratio * 20)
    for d in range(20):
        dot_color = ACCENT_COLOR if d < filled_dots else (210, 210, 220)
        draw.ellipse(
            [
                bx + 20 + d * (dot_area_w // 20),
                by + bh - 24,
                bx + 20 + d * (dot_area_w // 20) + 10,
                by + bh - 14,
            ],
            fill=dot_color,
        )

    return canvas


# ── Audio generation ──────────────────────────────────────────────────────────

def generate_audio_file(text: str, out_path: str, lang: str = "en") -> str:
    """
    Convert *text* to speech with gTTS and save as MP3.

    Args:
        text:     Plain text to synthesise.
        out_path: Destination file path (including .mp3 extension).
        lang:     BCP-47 language code accepted by gTTS (e.g. "en", "fr", "ar").

    Returns:
        *out_path* after the file has been written.
    """
    gTTS(text=text, lang=lang, slow=False).save(out_path)
    logger.info("Audio saved: %s", out_path)
    return out_path


# ── Audio + video merge ───────────────────────────────────────────────────────

def _merge_audio_video(video_clip, audio_path: str, output_path: str) -> str:
    """
    Attach *audio_path* to *video_clip*, looping video if audio is longer,
    then write the result to *output_path*.
    """
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
    final.write_videofile(
        output_path,
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        logger=None,
    )
    audio_clip.close()
    logger.info("Video saved: %s", output_path)
    return output_path


# ── Main public function ──────────────────────────────────────────────────────

def create_micro_lesson_video(
    topic:            str,
    explanation_text: str,
    lesson_id:        int,
    total_lessons:    int,
    output_dir:       str           = "./files",
    avatar_gender:    str           = "girl",
    language:         str           = "en",
) -> str:
    """
    Render a micro-lesson MP4 for *explanation_text*.

    The video consists of:
      1. Intro frame  (~1.5 s) — full avatar + topic title
      2. Content frames        — typewriter-style text reveal synced to TTS audio
      3. Outro frame  (~0.8 s) — completion message

    Args:
        topic:            Display title (used in the title bar and file name).
        explanation_text: Text to read aloud and animate.
        lesson_id:        1-based index of this lesson (shown as slide number).
        total_lessons:    Total number of lessons in the course.
        output_dir:       Directory where audio and video files are saved.
        avatar_gender:    "girl" or "boy" — selects the DiceBear avatar.
        language:         BCP-47 language code for gTTS.

    Returns:
        Absolute path to the generated .mp4 file.
    """
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    safe_topic   = re.sub(r"[^\w]", "_", topic)[:40]
    audio_path   = str(out / f"lesson_{lesson_id}_{safe_topic}_audio.mp3")
    video_path   = str(out / f"lesson_{lesson_id}_{safe_topic}.mp4")

    # 1. Generate TTS audio and measure its duration
    generate_audio_file(explanation_text, audio_path, lang=language)
    audio_temp = AudioFileClip(audio_path)
    audio_dur  = audio_temp.duration
    audio_temp.close()

    total_frames = int((audio_dur + 1.0) * FPS)

    # 2. Pre-fetch avatar
    avatar_img = get_avatar(gender=avatar_gender, size=250)

    # 3. Compute frame budget
    INTRO_FRAMES   = min(int(1.5 * FPS), total_frames // 5)
    OUTRO_FRAMES   = min(int(0.8 * FPS), total_frames // 6)
    CONTENT_FRAMES = total_frames - INTRO_FRAMES - OUTRO_FRAMES
    chars_per_frame = max(1, len(explanation_text) // max(CONTENT_FRAMES, 1))

    # 4. Render frames
    frames   = []
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

    # 5. Compose video clip and merge with audio
    video_clip = ImageSequenceClip(frames, fps=FPS)
    return _merge_audio_video(video_clip, audio_path, video_path)