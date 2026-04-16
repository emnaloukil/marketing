"""
pipeline/llm_client.py — OpenRouter API wrapper

Provides:
  • LLMClient  — class-based client (used as a singleton in main.py)
  • call_llm() — module-level convenience function that delegates to the singleton
                 (add `from pipeline.llm_client import call_llm` to main.py imports)
"""

import logging
from typing import Optional

import requests

from config import (
    OPENROUTER_API_KEY,
    LLM_MODEL,
    OPENROUTER_BASE_URL,
    DEFAULT_MAX_TOKENS,
    DEFAULT_TEMPERATURE,
    REQUEST_TIMEOUT,
)

logger = logging.getLogger(__name__)


def _extract_text_from_message_content(content) -> str:
    """Normalize OpenRouter/OpenAI-style message content into plain text."""
    if isinstance(content, str):
        return content.strip()

    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                text = item.get("text")
                if isinstance(text, str):
                    parts.append(text)
        return "\n".join(part.strip() for part in parts if isinstance(part, str) and part.strip())

    return ""


class LLMClient:
    """Thin wrapper around the OpenRouter /chat/completions endpoint."""

    def __init__(
        self,
        api_key:     Optional[str] = None,
        model:       Optional[str] = None,
        temperature: float         = DEFAULT_TEMPERATURE,
        timeout:     int           = REQUEST_TIMEOUT,
    ):
        self.api_key     = api_key or OPENROUTER_API_KEY
        self.model       = model   or LLM_MODEL
        self.temperature = temperature
        self.timeout     = timeout

        if not self.api_key:
            logger.warning("OPENROUTER_API_KEY is not set — LLM calls will use mock responses.")

    # ── Internal HTTP call ────────────────────────────────────────────────────

    def _post(self, messages: list[dict], max_tokens: int) -> str:
        """
        Send a chat-completion request and return the assistant text.
        Falls back to a mock string when no API key is available.
        """
        if not self.api_key:
            return self._mock_response(messages[-1]["content"])

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type":  "application/json",
            "HTTP-Referer":  "https://edukids.ai",   # optional — shown in OR dashboard
            "X-Title":       "EduKids AI Tutor",
        }
        payload = {
            "model":       self.model,
            "max_tokens":  max_tokens,
            "temperature": self.temperature,
            "messages":    messages,
        }

        try:
            resp = requests.post(
                OPENROUTER_BASE_URL,
                headers=headers,
                json=payload,
                timeout=self.timeout,
            )
            resp.raise_for_status()
            data = resp.json()
            message = data["choices"][0]["message"]
            text = _extract_text_from_message_content(message.get("content"))

            if not text:
                logger.error("LLM returned no text content. Full response: %s", data)
                raise RuntimeError("LLM returned no text content.")

            return text
        except requests.exceptions.Timeout:
            logger.error("LLM request timed out after %ds", self.timeout)
            raise
        except requests.exceptions.HTTPError as exc:
            logger.error("LLM HTTP error %s: %s", exc.response.status_code, exc.response.text)
            raise
        except (KeyError, IndexError) as exc:
            logger.error("Unexpected LLM response shape: %s", exc)
            raise RuntimeError("LLM returned an unexpected response format.") from exc

    # ── Public API ────────────────────────────────────────────────────────────

    def call_llm(
        self,
        prompt:         str,
        max_tokens:     int           = DEFAULT_MAX_TOKENS,
        system_message: Optional[str] = None,
    ) -> str:
        """
        Generate a completion for *prompt*.

        Args:
            prompt:         User-turn text sent to the model.
            max_tokens:     Maximum tokens in the completion.
            system_message: Optional system prompt prepended to the conversation.

        Returns:
            The assistant's reply as a plain string.
        """
        messages: list[dict] = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        return self._post(messages, max_tokens=max_tokens)

    def complete(self, prompt: str, **kwargs) -> str:
        """Alias for call_llm — kept for backwards compatibility."""
        return self.call_llm(prompt, **kwargs)

    # ── Mock (no-key) fallback ────────────────────────────────────────────────

    @staticmethod
    def _mock_response(prompt: str) -> str:
        """
        Deterministic placeholder returned when OPENROUTER_API_KEY is absent.
        Useful for local development / CI without credentials.
        """
        logger.info("Using mock LLM response (no API key configured).")
        snippet = prompt[:80].replace("\n", " ")
        return (
            f"[MOCK RESPONSE] This is a placeholder answer for the prompt: \"{snippet}...\"\n"
            "• Key point one — configure OPENROUTER_API_KEY for real responses.\n"
            "• Key point two — the pipeline is otherwise fully functional.\n"
            "• Key point three — all downstream steps (audio, video) will still run."
        )


# ── Module-level singleton & convenience function ─────────────────────────────

_default_client: Optional[LLMClient] = None


def _get_default_client() -> LLMClient:
    global _default_client
    if _default_client is None:
        _default_client = LLMClient()
    return _default_client


def call_llm(
    prompt:         str,
    max_tokens:     int           = DEFAULT_MAX_TOKENS,
    system_message: Optional[str] = None,
) -> str:
    """
    Module-level convenience wrapper around the default LLMClient singleton.

    Usage in main.py — add this import:
        from pipeline.llm_client import call_llm
    """
    return _get_default_client().call_llm(
        prompt,
        max_tokens=max_tokens,
        system_message=system_message,
    )
