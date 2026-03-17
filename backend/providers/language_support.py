"""Language support registry for TTS and Translate providers.

Maps each provider to its supported language codes and provides
chain-resolution helpers that pick the first capable provider.
"""

CHATTERBOX_LANGUAGES: set[str] = {
    "ar", "zh", "da", "de", "en", "fi", "fr", "el", "he", "hi",
    "it", "ja", "ko", "ms", "nl", "no", "pl", "pt", "ru", "sv",
    "es", "sw", "tr",
}

PIPER_LANGUAGES: set[str] = {
    "ar", "ca", "cs", "cy", "da", "de", "el", "en", "es", "fa",
    "fi", "fr", "hi", "hu", "is", "it", "ka", "kk", "lb", "lv",
    "ne", "nl", "no", "pl", "pt", "ro", "ru", "sk", "sl", "sr",
    "sv", "sw", "te", "tr", "uk", "vi", "zh",
}

ELEVENLABS_V2_LANGUAGES: set[str] = {
    "en", "pl", "de", "es", "fr", "it", "hi", "pt", "zh", "ko",
    "ru", "nl", "tr", "sv", "id", "fil", "ja", "uk", "el", "cs",
    "fi", "ro", "da", "bg", "ms", "sk", "hr", "ar", "ta", "vi",
    "hu", "no",
}

ELEVENLABS_V3_LANGUAGES: set[str] = {
    "af", "ar", "hy", "as", "az", "be", "bn", "bs", "bg", "ceb",
    "ny", "zh", "da", "de", "en", "et", "fil", "fi", "fr", "gl",
    "ka", "el", "gu", "ha", "he", "hi", "id", "ga", "is", "it",
    "ja", "jv", "kn", "kk", "ca", "ky", "ko", "hr", "lv", "ln",
    "lt", "lb", "ms", "ml", "mk", "nl", "no", "pl", "pt", "ro",
    "ru", "sv", "sr", "sk", "es", "sw", "ta", "cs", "tr", "uk",
    "hu", "vi",
}

DEEPL_LANGUAGES: set[str] = {
    "ar", "bg", "cs", "da", "de", "el", "en", "es", "et", "fi",
    "fr", "hu", "id", "it", "ja", "ko", "lt", "lv", "nb", "nl",
    "no", "pl", "pt", "ro", "ru", "sk", "sl", "sv", "tr", "uk",
    "zh",
}

# Provider name -> language set mapping
_TTS_PROVIDERS: dict[str, set[str]] = {
    "chatterbox": CHATTERBOX_LANGUAGES,
    "piper": PIPER_LANGUAGES,
    "elevenlabs": ELEVENLABS_V2_LANGUAGES | ELEVENLABS_V3_LANGUAGES,
}

_TRANSLATE_PROVIDERS: dict[str, set[str] | None] = {
    "ollama": None,    # universal — supports all languages
    "openai": None,    # universal
    "deepl": DEEPL_LANGUAGES,
}


def get_recommended_model(lang: str) -> str | None:
    """Return the recommended Ollama model for a language, or None."""
    from backend.providers.language_registry import LANGUAGES
    meta = LANGUAGES.get(lang)
    return meta.recommended_model if meta else None


def get_supported_languages(provider: str) -> set[str] | None:
    """Return supported language codes for a provider, or None if universal."""
    if provider in _TTS_PROVIDERS:
        return _TTS_PROVIDERS[provider]
    if provider in _TRANSLATE_PROVIDERS:
        return _TRANSLATE_PROVIDERS[provider]
    return set()


def resolve_tts_provider(lang: str, chain: list[str]) -> str | None:
    """Return the first TTS provider in chain that supports the given language."""
    for provider in chain:
        langs = _TTS_PROVIDERS.get(provider)
        if langs is not None and lang in langs:
            return provider
    return None


def resolve_translate_provider(lang: str, chain: list[str]) -> str | None:
    """Return the first Translate provider in chain that supports the given language."""
    for provider in chain:
        langs = _TRANSLATE_PROVIDERS.get(provider)
        if langs is None:
            # Universal provider — supports everything
            return provider
        if lang in langs:
            return provider
    return None


def get_language_coverage(
    tts_chain: list[str],
    translate_chain: list[str],
) -> dict:
    """Compute per-language coverage dict based on the language registry.

    Iterates over ALL languages in the registry and resolves TTS/Translate
    providers via the active chains. Each entry includes metadata from the
    registry (name, native_name, continent, country_code).

    Returns::

        {
            "languages": {
                "de": {
                    "name": "German", "native_name": "Deutsch",
                    "continent": "EU", "country_code": "at",
                    "tts_provider": "chatterbox", "translate_provider": "ollama",
                    "tts_badge": "voice",
                },
                ...
            },
            "continents": {"EU": "Europa", ...},
            "tts_chain": ["chatterbox", "piper", "elevenlabs"],
            "translate_chain": ["ollama", "deepl"],
            "totals": {"voice": 41, "text_only": 58}
        }
    """
    from backend.providers.language_registry import CONTINENTS
    from backend.providers.language_registry import LANGUAGES as REGISTRY

    languages: dict[str, dict] = {}
    voice_count = 0
    text_only_count = 0

    for code, meta in sorted(REGISTRY.items()):
        tts_prov = resolve_tts_provider(code, tts_chain)
        trans_prov = resolve_translate_provider(code, translate_chain)
        badge = "voice" if tts_prov else "text-only"

        if badge == "voice":
            voice_count += 1
        else:
            text_only_count += 1

        languages[code] = {
            "name": meta.name,
            "native_name": meta.native_name,
            "continent": meta.continent,
            "country_code": meta.country_code,
            "stt_quality": meta.stt_quality,
            "translate_tier": meta.translate_tier,
            "resource_level": meta.resource_level,
            "tts_provider": tts_prov,
            "translate_provider": trans_prov,
            "tts_badge": badge,
            "recommended_model": meta.recommended_model,
        }

    return {
        "languages": languages,
        "continents": CONTINENTS,
        "tts_chain": tts_chain,
        "translate_chain": translate_chain,
        "totals": {"voice": voice_count, "text_only": text_only_count},
    }
