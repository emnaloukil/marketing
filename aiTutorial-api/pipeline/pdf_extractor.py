"""
pipeline/pdf_extractor.py — PDF text extraction via PyMuPDF (fitz)

Exposes:
  • extract_text(pdf_path)          → str   (all pages concatenated)
  • extract_text_by_page(pdf_path)  → list[str]  (one entry per page)
  • extract_from_bytes(data)        → str   (in-memory PDF bytes)
"""

import logging
from pathlib import Path
from typing import List, Union

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


def extract_text(pdf_path: Union[str, Path]) -> str:
    """
    Open a PDF file and return all page text concatenated into one string.

    Args:
        pdf_path: Path to the PDF file on disk.

    Returns:
        Full document text as a single string.

    Raises:
        FileNotFoundError: If *pdf_path* does not exist.
        fitz.FitzError:    If the file cannot be opened as a PDF.
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    logger.info("Extracting text from: %s", pdf_path.name)

    text  = ""
    pages = 0
    doc   = fitz.open(str(pdf_path))
    try:
        for page in doc:
            text += page.get_text()
            pages += 1
    finally:
        doc.close()

    logger.info("Extracted %d characters from %d pages.", len(text), pages)
    return text


def extract_text_by_page(pdf_path: Union[str, Path]) -> List[str]:
    """
    Return a list where each element is the extracted text of one PDF page.

    Args:
        pdf_path: Path to the PDF file on disk.

    Returns:
        List of page-text strings (preserves order; empty pages are included).
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    pages_text: List[str] = []
    doc = fitz.open(str(pdf_path))
    try:
        for page in doc:
            pages_text.append(page.get_text())
    finally:
        doc.close()

    return pages_text


def extract_from_bytes(data: bytes) -> str:
    """
    Extract text from an in-memory PDF (e.g. fetched via HTTP).

    Args:
        data: Raw PDF bytes.

    Returns:
        Full document text as a single string.
    """
    logger.info("Extracting text from in-memory PDF (%d bytes).", len(data))

    text = ""
    doc  = fitz.open(stream=data, filetype="pdf")
    try:
        for page in doc:
            text += page.get_text()
    finally:
        doc.close()

    return text