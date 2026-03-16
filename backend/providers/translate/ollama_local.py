import logging

import httpx

from backend.providers.base import TranslateProvider

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a professional translator. "
    "Translate the following text from {source} to {target}. "
    "Output ONLY the translation, nothing else."
)


class OllamaLocalProvider(TranslateProvider):
    def __init__(self, model: str, base_url: str) -> None:
        self._model = model
        self._base_url = base_url.rstrip("/")
        self._client = httpx.AsyncClient(timeout=120.0)

    async def translate(
        self, text: str, source: str, target: str,
        model: str | None = None, **kwargs: object,
    ) -> str:
        if not text.strip():
            return ""

        raw_prompt = kwargs.get("system_prompt")
        custom_prompt: str | None = raw_prompt if isinstance(raw_prompt, str) else None
        system = custom_prompt if custom_prompt else SYSTEM_PROMPT.format(source=source, target=target)

        keep_alive = str(kwargs.get("keep_alive") or "3m")
        num_ctx = kwargs.get("num_ctx")

        body: dict = {
            "model": model or self._model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": text},
            ],
            "temperature": 0.3,
            "keep_alive": keep_alive,  # Ollama-specific, ignored by other servers
        }
        if num_ctx is not None:
            body["num_ctx"] = int(str(num_ctx))  # Ollama-specific

        try:
            response = await self._client.post(
                f"{self._base_url}/v1/chat/completions",
                json=body,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error("LLM returned %s: %s", e.response.status_code, e.response.text[:200])
            raise RuntimeError(f"Translation failed: LLM server {e.response.status_code}") from e
        except httpx.ConnectError as e:
            logger.error("Cannot reach LLM at %s", self._base_url)
            raise RuntimeError(f"Provider unreachable: cannot reach LLM at {self._base_url}") from e
        except httpx.TimeoutException as e:
            logger.error("LLM request timed out at %s", self._base_url)
            raise RuntimeError(f"Provider timeout: LLM at {self._base_url}") from e

        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

    async def cleanup(self) -> None:
        await self._client.aclose()
