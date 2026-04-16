"""
config.py — centralised settings loaded from .env
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── LLM / OpenRouter ──────────────────────────────────────────────────────────
OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
LLM_MODEL: str          = os.getenv("LLM_MODEL", "openai/gpt-4o-mini")

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

# ── Request defaults ──────────────────────────────────────────────────────────
DEFAULT_MAX_TOKENS:   int   = 600
DEFAULT_TEMPERATURE:  float = 0.7
REQUEST_TIMEOUT:      int   = 60      # seconds

# ── Embedding model ───────────────────────────────────────────────────────────
EMBED_MODEL_NAME: str = os.getenv("EMBED_MODEL_NAME", "all-MiniLM-L6-v2")

# ── Chunking ──────────────────────────────────────────────────────────────────
CHUNK_SIZE:    int = int(os.getenv("CHUNK_SIZE",    "500"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "50"))
RETRIEVAL_K:   int = int(os.getenv("RETRIEVAL_K",  "4"))

# ── Storage ───────────────────────────────────────────────────────────────────
FILES_DIR: str = os.getenv("FILES_DIR", "./files")

# ── Video ─────────────────────────────────────────────────────────────────────
VIDEO_FPS: int = int(os.getenv("VIDEO_FPS", "24"))