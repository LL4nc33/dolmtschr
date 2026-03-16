# Language Quality Scores + Hover-Modal — Design

## Goal

Show per-language quality transparency via hover/tap modal in the language
dropdown. Three quality bars (STT, Translate, TTS) plus overall star rating.

## Data Sources

- **STT Quality**: Whisper WER data (Radford et al. 2022, various benchmarks)
- **Translate Tier**: NLP resource-level classification + DeepL availability
- **TTS Quality**: Dynamic from provider chain (already in system)

## Backend: Extended Language Registry

```python
@dataclass(frozen=True)
class Language:
    code: str
    name: str
    native_name: str
    continent: str
    country_code: str
    stt_quality: int       # 0-100 (100 - WER)
    translate_tier: str    # excellent/good/fair/poor/experimental
    resource_level: str    # high/mid/low/very-low
```

## API Response (per language)

```json
{
  "stt_quality": 94,
  "translate_tier": "excellent",
  "resource_level": "high",
  "tts_provider": "chatterbox",
  "translate_provider": "ollama",
  "tts_badge": "voice"
}
```

## Frontend: Hover-Modal

On hover/long-press on a language in the dropdown, show overlay with:
- Language name + flag
- STT bar (0-100%) + provider name
- Translate bar (mapped from tier) + provider names
- TTS bar (mapped from provider count) + provider names
- Overall star rating (1-5)

## Overall Rating Formula

```
overall = (stt_quality * 0.4) + (translate_score * 0.4) + (tts_score * 0.2)

translate_score: excellent=100, good=75, fair=50, poor=25, experimental=10
tts_score: 3+ providers=100, 2=80, 1=60, 0=0

Stars: 90+=5, 70+=4, 50+=3, 30+=2, <30=1
```

## Files

- Modify: `backend/providers/language_registry.py`
- Modify: `backend/providers/language_support.py`
- Modify: `frontend/src/api/dolmtschr.ts`
- Modify: `frontend/src/hooks/useLanguages.ts`
- Create: `frontend/src/components/LanguageQualityModal.tsx`
- Modify: `frontend/src/components/LanguageSelector.tsx`
