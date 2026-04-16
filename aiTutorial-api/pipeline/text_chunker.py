"""
pipeline/text_chunker.py — sliding-window text chunker

Exposes:
  • chunk_text(text, size, overlap) → list[str]
  • chunk_by_sentence(text, max_chars) → list[str]
  • chunk_by_paragraph(text, max_chars) → list[str]
"""

import re
import logging
from typing import List

from config import CHUNK_SIZE, CHUNK_OVERLAP

logger = logging.getLogger(__name__)


def chunk_text(
    text:    str,
    size:    int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> List[str]:
    """
    Split *text* into fixed-size overlapping character windows.

    Args:
        text:    Input text string.
        size:    Maximum number of characters per chunk.
        overlap: Number of characters shared between consecutive chunks.

    Returns:
        List of non-trivial chunks (each longer than 20 characters).
    """
    if not text or not text.strip():
        logger.warning("chunk_text() called with empty or blank text.")
        return []

    step   = max(1, size - overlap)
    chunks = []

    for start in range(0, len(text), step):
        chunk = text[start: start + size]
        if len(chunk.strip()) > 20:
            chunks.append(chunk)

    logger.debug("chunk_text produced %d chunks (size=%d, overlap=%d).", len(chunks), size, overlap)
    return chunks


def chunk_by_sentence(text: str, max_chars: int = CHUNK_SIZE) -> List[str]:
    """
    Split *text* into chunks that never break mid-sentence.
    Sentences are accumulated until adding one more would exceed *max_chars*.

    Args:
        text:      Input text string.
        max_chars: Soft maximum characters per chunk.

    Returns:
        List of sentence-aligned chunks.
    """
    if not text or not text.strip():
        return []

    # Rough sentence tokenisation (handles ". ", "! ", "? ", ".\n", etc.)
    sentence_pattern = re.compile(r'(?<=[.!?])\s+')
    sentences = sentence_pattern.split(text.strip())

    chunks:  List[str] = []
    current: List[str] = []
    current_len = 0

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if current_len + len(sentence) > max_chars and current:
            chunks.append(" ".join(current))
            current     = []
            current_len = 0
        current.append(sentence)
        current_len += len(sentence) + 1

    if current:
        chunks.append(" ".join(current))

    return chunks


def chunk_by_paragraph(text: str, max_chars: int = CHUNK_SIZE * 3) -> List[str]:
    """
    Split *text* on blank lines (paragraph boundaries).
    Paragraphs that exceed *max_chars* are further split using chunk_text.

    Args:
        text:      Input text string.
        max_chars: Paragraphs larger than this are sub-split.

    Returns:
        List of paragraph-aligned chunks.
    """
    if not text or not text.strip():
        return []

    raw_paragraphs = re.split(r'\n\s*\n', text.strip())
    chunks: List[str] = []

    for para in raw_paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(para) > max_chars:
            chunks.extend(chunk_text(para, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP))
        else:
            chunks.append(para)

    return chunks