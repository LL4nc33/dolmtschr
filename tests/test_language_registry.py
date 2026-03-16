from backend.providers.language_registry import LANGUAGES, CONTINENTS, get_all_language_codes


def test_registry_has_whisper_core_languages():
    core = {"de", "en", "fr", "es", "it", "ja", "zh", "ko", "ar", "ru", "tr"}
    for code in core:
        assert code in LANGUAGES, f"Missing core language: {code}"


def test_language_fields_complete():
    for code, lang in LANGUAGES.items():
        assert lang.code == code
        assert lang.name, f"{code} missing name"
        assert lang.native_name, f"{code} missing native_name"
        assert lang.continent in CONTINENTS, f"{code} invalid continent: {lang.continent}"
        assert lang.country_code, f"{code} missing country_code"


def test_get_all_language_codes():
    codes = get_all_language_codes()
    assert len(codes) > 90
    assert "de" in codes
    assert "th" in codes


def test_no_duplicate_entries():
    codes = list(LANGUAGES.keys())
    assert len(codes) == len(set(codes))


def test_quality_fields_valid():
    for code, lang in LANGUAGES.items():
        assert 0 <= lang.stt_quality <= 100, f"{code} stt_quality out of range: {lang.stt_quality}"
        assert lang.translate_tier in ("excellent", "good", "fair", "poor", "experimental"), f"{code} invalid tier: {lang.translate_tier}"
        assert lang.resource_level in ("high", "mid", "low", "very-low"), f"{code} invalid resource_level: {lang.resource_level}"
