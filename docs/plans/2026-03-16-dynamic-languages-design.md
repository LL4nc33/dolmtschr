# Dynamic Language System — Design

## Goal

Replace the hardcoded 21-language frontend dropdown with a dynamic, backend-driven
language system that exposes all ~100 Whisper-supported languages. Languages without
TTS coverage work as text-only translators (STT-only mode).

## Architecture

### Data Flow

```
Backend                              Frontend
───────────────────                  ───────────────────
/api/languages                       useLanguages() hook
  Whisper language registry            cached in state
  + TTS coverage (per chain)           grouped by continent
  + Translate coverage                 searchable dropdown
  + Continent tags                     flag spritesheet
  + Native names                       voice/text-only badge
  + Country codes (for flags)
```

### Backend: Language Registry

Single source of truth in `backend/providers/language_registry.py`:

```python
@dataclass(frozen=True)
class Language:
    code: str           # ISO 639-1 (e.g. "de")
    name: str           # English name (e.g. "German")
    native_name: str    # Native name (e.g. "Deutsch")
    continent: str      # EU, AS, ME, AF, AM, OC
    country_code: str   # ISO 3166-1 alpha-2 for flag (e.g. "at")

LANGUAGES: dict[str, Language] = { ... }  # ~100 entries
```

This registry is:
- Static data, not config — it changes only when Whisper adds languages
- Decoupled from provider support — providers reference language codes
- The single place to add a new language

### Backend: Enhanced `/api/languages` Response

```json
{
  "languages": {
    "de": {
      "name": "German",
      "native_name": "Deutsch",
      "continent": "EU",
      "country_code": "at",
      "tts_provider": "chatterbox",
      "translate_provider": "ollama",
      "tts_badge": "voice"
    },
    "th": {
      "name": "Thai",
      "native_name": "ไทย",
      "continent": "AS",
      "country_code": "th",
      "tts_provider": null,
      "translate_provider": "ollama",
      "tts_badge": "text-only"
    }
  },
  "continents": {
    "EU": "Europa",
    "AS": "Asien",
    "ME": "Naher Osten",
    "AF": "Afrika",
    "AM": "Amerika",
    "OC": "Ozeanien"
  },
  "tts_chain": ["chatterbox", "piper", "elevenlabs"],
  "translate_chain": ["ollama", "deepl"],
  "totals": { "voice": 41, "text_only": 59 }
}
```

### Frontend: SVG Flag Spritesheet

File: `frontend/public/flags.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="flag-at" viewBox="0 0 30 20">
    <rect width="30" height="7" fill="#ed2939"/>
    <rect y="7" width="30" height="6" fill="#fff"/>
    <rect y="13" width="30" height="7" fill="#ed2939"/>
  </symbol>
  <symbol id="flag-gb" viewBox="0 0 60 30">...</symbol>
  <!-- ~70 flags -->
</svg>
```

Usage in React:
```tsx
function Flag({ code, size = 24 }: { code: string; size?: number }) {
  const h = Math.round(size * 0.7)
  return (
    <svg width={size} height={h}>
      <use href={`/flags.svg#flag-${code}`} />
    </svg>
  )
}
```

Fallback when no `<symbol>` exists: render a monospace text label.

### Frontend: LanguageSelector Redesign

```
┌─────────────────────────────┐
│ 🔍 Search...                │
├─────────────────────────────┤
│ ── Europa ──                │
│ 🇦🇹 Deutsch    [voice] EU  │
│ 🇬🇧 English    [voice] EU  │
│ 🇫🇷 Francais   [voice] EU  │
│ ...                         │
│ ── Asien ──                 │
│ 🇹🇭 ไทย      [text]   AS  │
│ ...                         │
└─────────────────────────────┘

When searching "deu":
┌─────────────────────────────┐
│ 🔍 deu                      │
├─────────────────────────────┤
│ 🇦🇹 Deutsch    [voice] EU  │
└─────────────────────────────┘
```

- Search matches: code, name, native_name
- Grouped by continent (headers hidden during search)
- Continent label (EU/AS/ME) shown on each item during search
- voice/text-only badge from backend
- No hardcoded language list in frontend

### Frontend: useLanguages Hook

```tsx
function useLanguages(ttsChain: string[], translateChain: string[]) {
  // Fetches /api/languages with chain params
  // Returns: { languages, continents, loading, error }
  // Caches in state, refetches when chains change
}
```

Replaces the current inline `LANGUAGES` array and `getLanguageCoverage()` call.

## Files Changed

### New Files
- `backend/providers/language_registry.py` — Language dataclass + full registry
- `frontend/public/flags.svg` — SVG spritesheet
- `frontend/src/components/Flag.tsx` — Flag component using spritesheet
- `frontend/src/hooks/useLanguages.ts` — Data hook

### Modified Files
- `backend/providers/language_support.py` — Import registry, use for coverage
- `backend/routers/languages.py` — Enhanced response with metadata
- `frontend/src/components/LanguageSelector.tsx` — Rewrite: search + continent groups
- `frontend/src/App.tsx` — Use useLanguages instead of getLanguageCoverage

### Deleted Files
- `frontend/src/components/FlagSvg.tsx` — Replaced by Flag.tsx + spritesheet

## What Does NOT Change

- Pipeline logic (TTS skip already works)
- Provider chain system
- Settings page
- Backend provider implementations
- API contracts for /api/pipeline, /api/stt, /api/tts
