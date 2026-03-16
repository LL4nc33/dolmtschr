import logging

import httpx

from backend.providers.base import TranslateProvider

logger = logging.getLogger(__name__)

FREE_URL = "https://api-free.deepl.com/v2/translate"
PRO_URL = "https://api.deepl.com/v2/translate"


class DeepLRemoteProvider(TranslateProvider):
    def __init__(self, api_key: str, free: bool = True) -> None:
        self._url = FREE_URL if free else PRO_URL
        self._client = httpx.AsyncClient(
            timeout=30.0,
            headers={"Authorization": f"DeepL-Auth-Key {api_key}"},
        )

    async def translate(
        self, text: str, source: str, target: str,
        model: str | None = None, **kwargs: object,
    ) -> str:
        try:
            resp = await self._client.post(
                self._url,
                json={
                    "text": [text],
                    "target_lang": target.upper(),
                    "source_lang": source.upper(),
                },
            )
        except httpx.ConnectError as e:
            logger.error("Cannot reach DeepL API at %s", self._url)
            raise RuntimeError(f"Provider unreachable: cannot reach DeepL at {self._url}") from e
        except httpx.TimeoutException as e:
            logger.error("DeepL request timed out at %s", self._url)
            raise RuntimeError(f"Provider timeout: DeepL at {self._url}") from e

        if resp.status_code == 403:
            raise RuntimeError("DeepL 403: invalid API key")
        if resp.status_code == 456:
            raise RuntimeError("DeepL 456: quota exceeded")
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error("DeepL returned %s: %s", e.response.status_code, e.response.text[:200])
            raise RuntimeError(f"Translation failed: DeepL {e.response.status_code}") from e
        data = resp.json()
        return data["translations"][0]["text"]

    async def cleanup(self) -> None:
        await self._client.aclose()
