"""Tests für profile_id in Pipeline — System-Prompt-Injection."""
from backend.profiles import get_system_prompt, get_all_profiles


def test_medical_system_prompt_contains_terminology():
    """Medical-Prompt muss auf medizinische Terminologie hinweisen."""
    prompt = get_system_prompt("medical", "de", "ar")
    assert "medical" in prompt.lower() or "terminology" in prompt.lower()
    assert "{source}" not in prompt
    assert "{target}" not in prompt


def test_system_prompt_includes_source_target():
    """Source und Target müssen im formatierten Prompt enthalten sein."""
    prompt = get_system_prompt("medical", "de", "tr")
    assert "de" in prompt
    assert "tr" in prompt


def test_unknown_profile_returns_generic_prompt():
    """Unbekanntes Profil → generischer Fallback-Prompt."""
    prompt = get_system_prompt("unknown_profile", "de", "en")
    assert "translator" in prompt.lower()
    assert "{source}" not in prompt
    assert "{target}" not in prompt


def test_all_profiles_have_valid_system_prompts():
    """Alle 6 Profile müssen valide System-Prompts zurückliefern."""
    for profile in get_all_profiles():
        prompt = get_system_prompt(profile.id, "de", "ar")
        assert len(prompt) > 50
        assert "{source}" not in prompt
        assert "{target}" not in prompt
