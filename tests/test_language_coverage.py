from backend.providers.language_support import get_language_coverage


def test_coverage_includes_metadata():
    result = get_language_coverage(["piper"], ["ollama"])
    de = result["languages"]["de"]
    assert de["name"] == "German"
    assert de["native_name"] == "Deutsch"
    assert de["continent"] == "EU"
    assert de["country_code"] == "at"
    assert de["tts_badge"] == "voice"


def test_coverage_includes_text_only_languages():
    result = get_language_coverage(["piper"], ["ollama"])
    th = result["languages"]["th"]
    assert th["tts_badge"] == "text-only"
    assert th["tts_provider"] is None
    assert th["translate_provider"] == "ollama"


def test_coverage_has_continents():
    result = get_language_coverage(["piper"], ["ollama"])
    assert "continents" in result
    assert result["continents"]["EU"] == "Europa"


def test_coverage_totals():
    result = get_language_coverage(["chatterbox", "piper", "elevenlabs"], ["ollama"])
    totals = result["totals"]
    assert totals["voice"] + totals["text_only"] == len(result["languages"])
    assert totals["voice"] > 0
    assert totals["text_only"] > 0


def test_coverage_includes_quality():
    result = get_language_coverage(["piper"], ["ollama"])
    de = result["languages"]["de"]
    assert de["stt_quality"] == 94
    assert de["translate_tier"] == "excellent"
    assert de["resource_level"] == "high"


def test_all_registry_languages_included():
    from backend.providers.language_registry import LANGUAGES
    result = get_language_coverage(["piper"], ["ollama"])
    for code in LANGUAGES:
        assert code in result["languages"], f"Missing {code} from coverage"
