"""
pipeline/__init__.py — public surface of the pipeline package
"""

from .llm_client   import LLMClient, call_llm
from .embeddings   import embed_texts, build_faiss_index, retrieve
from .pdf_extractor import extract_text
from .text_chunker  import chunk_text

__all__ = [
    "LLMClient",
    "call_llm",
    "embed_texts",
    "build_faiss_index",
    "retrieve",
    "extract_text",
    "chunk_text",
]