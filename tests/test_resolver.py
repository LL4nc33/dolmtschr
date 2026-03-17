"""Unit tests for language_support resolution functions."""

from backend.providers.language_support import (
    resolve_translate_provider,
    resolve_tts_provider,
)


# ---------------------------------------------------------------------------
# resolve_tts_provider
# ---------------------------------------------------------------------------

def test_tts_picks_first_supporting_provider() -> None:
    """German is supported by both chatterbox and piper; chatterbox comes first."""
    result = resolve_tts_provider("de", ["chatterbox", "piper", "elevenlabs"])
    assert result == "chatterbox"


def test_tts_skips_unsupported_provider() -> None:
    """Kazakh (kk) is only in piper, not in chatterbox."""
    result = resolve_tts_provider("kk", ["chatterbox", "piper"])
    assert result == "piper"


def test_tts_returns_none_for_unsupported_lang() -> None:
    """A language not in any provider set should return None."""
    result = resolve_tts_provider("xx", ["chatterbox", "piper", "elevenlabs"])
    assert result is None


def test_tts_empty_chain_returns_none() -> None:
    result = resolve_tts_provider("de", [])
    assert result is None


def test_tts_elevenlabs_covers_many_languages() -> None:
    """ElevenLabs v3 covers Afrikaans; others don't."""
    result = resolve_tts_provider("af", ["chatterbox", "piper", "elevenlabs"])
    assert result == "elevenlabs"


# ---------------------------------------------------------------------------
# resolve_translate_provider
# ---------------------------------------------------------------------------

def test_translate_ollama_is_universal() -> None:
    """Ollama supports all languages (None means universal)."""
    result = resolve_translate_provider("xx", ["ollama", "deepl"])
    assert result == "ollama"


def test_translate_deepl_supports_known_lang() -> None:
    """DeepL should be picked for German when it comes first."""
    result = resolve_translate_provider("de", ["deepl", "ollama"])
    assert result == "deepl"


def test_translate_deepl_falls_through_for_unsupported() -> None:
    """DeepL doesn't support Swahili (sw is not in DEEPL_LANGUAGES)."""
    from backend.providers.language_support import DEEPL_LANGUAGES
    # Pick a language NOT in DeepL
    unsupported = "sw" if "sw" not in DEEPL_LANGUAGES else "xx"
    result = resolve_translate_provider(unsupported, ["deepl", "ollama"])
    assert result == "ollama"


def test_translate_empty_chain_returns_none() -> None:
    result = resolve_translate_provider("de", [])
    assert result is None


# ---------------------------------------------------------------------------
# get_recommended_model
# ---------------------------------------------------------------------------

def test_get_recommended_model_known_lang() -> None:
    """German should have a recommended model from the registry."""
    from backend.providers.language_support import get_recommended_model
    model = get_recommended_model("de")
    # The registry defines recommended_model (may be the default translategemma:4b or custom)
    assert model is not None
    assert isinstance(model, str)


def test_get_recommended_model_unknown_lang_returns_none() -> None:
    from backend.providers.language_support import get_recommended_model
    model = get_recommended_model("xx_FAKE")
    assert model is None
