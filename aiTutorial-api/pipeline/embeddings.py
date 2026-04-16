"""
pipeline/embeddings.py — text embedding and semantic retrieval

Exposes:
  • embed_texts(texts)          → np.ndarray  (float32, shape [N, dim])
  • build_faiss_index(embeddings) → faiss.IndexFlatL2
  • retrieve(query, chunks, k)  → list[str]
"""

import logging
from functools import lru_cache
from typing import List

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from config import EMBED_MODEL_NAME, RETRIEVAL_K

logger = logging.getLogger(__name__)


# ── Model singleton (loaded once per process) ─────────────────────────────────

@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    logger.info("Loading embedding model: %s", EMBED_MODEL_NAME)
    return SentenceTransformer(EMBED_MODEL_NAME)


# ── Core helpers ──────────────────────────────────────────────────────────────

def embed_texts(texts: List[str]) -> np.ndarray:
    """
    Encode a list of strings into a float32 embedding matrix.

    Args:
        texts: List of text strings to embed.

    Returns:
        numpy array of shape (len(texts), embedding_dim), dtype float32.
    """
    if not texts:
        return np.empty((0, 384), dtype="float32")

    model = _get_model()
    embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.astype("float32")


def build_faiss_index(embeddings: np.ndarray) -> faiss.IndexFlatL2:
    """
    Build a flat L2 FAISS index from a pre-computed embedding matrix.

    Args:
        embeddings: float32 array of shape (N, dim).

    Returns:
        A populated faiss.IndexFlatL2 ready for .search().
    """
    dim   = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    return index


def retrieve(query: str, chunks: List[str], k: int = RETRIEVAL_K) -> List[str]:
    """
    Return the *k* most semantically similar chunks to *query*.

    Args:
        query:  The search query string.
        chunks: Corpus of text chunks to search over.
        k:      Number of results to return.

    Returns:
        Ordered list of the top-k matching chunks (most similar first).
    """
    if not chunks:
        logger.warning("retrieve() called with an empty chunk list.")
        return []

    k = min(k, len(chunks))

    query_emb  = embed_texts([query])           # shape (1, dim)
    corpus_emb = embed_texts(chunks)            # shape (N, dim)
    index      = build_faiss_index(corpus_emb)

    _, indices = index.search(query_emb, k)

    results = []
    for idx in indices[0]:
        if 0 <= idx < len(chunks):
            results.append(chunks[idx])

    return results