"""Shared provider resolvers for runtime switching.

Routers use these to create ad-hoc providers when the frontend requests
a different provider/URL than the startup singleton.  Ad-hoc providers
must always be cleaned up in a ``finally`` block.
"""

import logging

from backend.dependencies import get_settings, get_tts, get_translate
from backend.providers.base import TTSProvider, TranslateProvider
from backend.providers.language_support import (
    resolve_tts_provider as _pick_tts,
    resolve_translate_provider as _pick_translate,
)

logger = logging.getLogger(__name__)


def resolve_tts(
    tts_provider: str | None,
    voice: str | None,
    chatterbox_url: str | None = None,
    elevenlabs_key: str | None = None,
    elevenlabs_voice_id: str | None = None,
    elevenlabs_model: str | None = None,
    elevenlabs_stability: float | None = None,
    elevenlabs_similarity: float | None = None,
) -> tuple[TTSProvider, bool]:
    """Return (provider_instance, is_ad_hoc). Ad-hoc providers must be cleaned up."""
    if tts_provider == "chatterbox":
        from backend.providers.tts.chatterbox_remote import ChatterboxRemoteProvider

        s = get_settings()
        return ChatterboxRemoteProvider(
            base_url=chatterbox_url or s.chatterbox_url,
            voice=voice or s.chatterbox_voice,
        ), True
    if tts_provider == "elevenlabs":
        from backend.providers.tts.elevenlabs_remote import ElevenLabsRemoteProvider

        s = get_settings()
        return ElevenLabsRemoteProvider(
            api_key=elevenlabs_key or s.elevenlabs_api_key or "",
            model=elevenlabs_model or s.elevenlabs_model,
            voice_id=elevenlabs_voice_id or s.elevenlabs_voice_id,
        ), True
    singleton = get_tts()
    if singleton is None:
        raise RuntimeError("No TTS provider available")
    return singleton, False


def resolve_translate(
    provider: str | None,
    api_url: str | None,
    api_key: str | None,
    model: str | None,
    ollama_url: str | None = None,
    deepl_free: bool = True,
) -> tuple[TranslateProvider, bool]:
    """Return (provider_instance, is_ad_hoc). Ad-hoc providers must be cleaned up."""
    if provider == "openai" and api_url:
        from backend.providers.translate.openai_compat import OpenAICompatProvider

        return OpenAICompatProvider(
            model=model or "", base_url=api_url, api_key=api_key or "",
        ), True
    if provider == "deepl" and api_key:
        from backend.providers.translate.deepl_remote import DeepLRemoteProvider

        return DeepLRemoteProvider(api_key=api_key, free=deepl_free), True
    if ollama_url:
        from backend.providers.translate.ollama_local import OllamaLocalProvider

        s = get_settings()
        return OllamaLocalProvider(
            model=model or s.ollama_model, base_url=ollama_url,
        ), True
    return get_translate(), False


# ---------------------------------------------------------------------------
# Chain-based resolution (iterates providers in priority order)
# ---------------------------------------------------------------------------

def _create_tts_provider(
    provider: str,
    voice: str | None,
    chatterbox_url: str | None,
    elevenlabs_key: str | None,
    elevenlabs_voice_id: str | None,
    elevenlabs_model: str | None,
) -> tuple[TTSProvider, bool]:
    """Instantiate a specific TTS provider. Returns (instance, is_ad_hoc)."""
    s = get_settings()
    if provider == "chatterbox":
        from backend.providers.tts.chatterbox_remote import ChatterboxRemoteProvider
        return ChatterboxRemoteProvider(
            base_url=chatterbox_url or s.chatterbox_url,
            voice=voice or s.chatterbox_voice,
        ), True
    if provider == "elevenlabs":
        from backend.providers.tts.elevenlabs_remote import ElevenLabsRemoteProvider
        return ElevenLabsRemoteProvider(
            api_key=elevenlabs_key or s.elevenlabs_api_key or "",
            model=elevenlabs_model or s.elevenlabs_model,
            voice_id=elevenlabs_voice_id or s.elevenlabs_voice_id,
        ), True
    if provider == "piper":
        from backend.providers.tts.piper_local import PiperLocalProvider
        return PiperLocalProvider(voice=voice or s.piper_voice), True
    raise ValueError(f"Unknown TTS provider: {provider}")


async def resolve_tts_chain(
    text: str,
    lang: str,
    chain: list[str],
    voice: str | None = None,
    chatterbox_url: str | None = None,
    elevenlabs_key: str | None = None,
    elevenlabs_voice_id: str | None = None,
    elevenlabs_model: str | None = None,
) -> tuple[bytes | None, str | None]:
    """Iterate chain, check language support, try synthesize(), catch errors -> next.

    Returns (audio_bytes, provider_name) or (None, None) if all fail.
    """
    picked = _pick_tts(lang, chain)
    if picked is None:
        return None, None

    # Try the picked provider first, then remaining chain members that support the lang
    order = [picked] + [p for p in chain if p != picked and _pick_tts(lang, [p])]

    for provider_name in order:
        prov: TTSProvider | None = None
        try:
            prov, _ = _create_tts_provider(
                provider_name, voice, chatterbox_url,
                elevenlabs_key, elevenlabs_voice_id, elevenlabs_model,
            )
            audio = await prov.synthesize(text, lang)
            return audio, provider_name
        except Exception as exc:
            logger.warning("TTS chain: %s failed for lang=%s: %s", provider_name, lang, exc)
        finally:
            if prov is not None:
                await prov.cleanup()

    return None, None


def _create_translate_provider(
    provider: str,
    model: str | None,
    api_url: str | None,
    api_key: str | None,
    ollama_url: str | None,
    deepl_free: bool,
) -> tuple[TranslateProvider, bool]:
    """Instantiate a specific Translate provider. Returns (instance, is_ad_hoc)."""
    s = get_settings()
    if provider == "ollama":
        from backend.providers.translate.ollama_local import OllamaLocalProvider
        return OllamaLocalProvider(
            model=model or s.ollama_model,
            base_url=ollama_url or s.ollama_url,
        ), True
    if provider == "openai":
        from backend.providers.translate.openai_compat import OpenAICompatProvider
        return OpenAICompatProvider(
            model=model or s.openai_compat_model,
            base_url=api_url or s.openai_compat_url,
            api_key=api_key or s.openai_api_key or "",
        ), True
    if provider == "deepl":
        from backend.providers.translate.deepl_remote import DeepLRemoteProvider
        return DeepLRemoteProvider(
            api_key=api_key or s.deepl_api_key or "",
            free=deepl_free,
        ), True
    raise ValueError(f"Unknown translate provider: {provider}")


async def resolve_translate_chain(
    text: str,
    source: str,
    target: str,
    chain: list[str],
    model: str | None = None,
    api_url: str | None = None,
    api_key: str | None = None,
    ollama_url: str | None = None,
    deepl_free: bool = True,
) -> tuple[str | None, str | None]:
    """Iterate chain, check language support, try translate(), catch errors -> next.

    Returns (translated_text, provider_name) or (None, None) if all fail.
    """
    picked = _pick_translate(target, chain)
    if picked is None:
        return None, None

    order = [picked] + [p for p in chain if p != picked and _pick_translate(target, [p])]

    for provider_name in order:
        prov: TranslateProvider | None = None
        try:
            prov, _ = _create_translate_provider(
                provider_name, model, api_url, api_key, ollama_url, deepl_free,
            )
            result = await prov.translate(text, source, target)
            return result, provider_name
        except Exception as exc:
            logger.warning("Translate chain: %s failed for %s->%s: %s", provider_name, source, target, exc)
        finally:
            if prov is not None:
                await prov.cleanup()

    return None, None
