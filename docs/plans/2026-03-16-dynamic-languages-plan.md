# Dynamic Language System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hardcoded 21-language dropdown with a dynamic, backend-driven system exposing all ~100 Whisper languages, grouped by continent with search, SVG flag spritesheet, and voice/text-only badges.

**Architecture:** Backend language registry as single source of truth. Enhanced `/api/languages` endpoint returns metadata (name, native_name, continent, country_code) alongside existing TTS/Translate coverage. Frontend fetches dynamically, renders grouped searchable dropdown with SVG spritesheet flags.

**Tech Stack:** Python dataclasses (registry), FastAPI (API), React + TypeScript (frontend), SVG spritesheet (flags)

---

### Task 1: Backend Language Registry

**Files:**
- Create: `backend/providers/language_registry.py`
- Test: `tests/test_language_registry.py`

**Step 1: Create the registry module**

Create `backend/providers/language_registry.py` with a frozen dataclass and a dict of all Whisper-supported languages (~100). Each entry has: `code`, `name`, `native_name`, `continent` (EU/AS/ME/AF/AM/OC), `country_code` (for flag mapping).

```python
"""Whisper-supported language registry.

Single source of truth for language metadata. Provider support sets
remain in language_support.py — this module only holds static metadata.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Language:
    code: str          # ISO 639-1 / Whisper code
    name: str          # English name
    native_name: str   # Native script name
    continent: str     # EU, AS, ME, AF, AM, OC
    country_code: str  # ISO 3166-1 alpha-2 for flag


# Continent display names
CONTINENTS: dict[str, str] = {
    "EU": "Europa",
    "AS": "Asien",
    "ME": "Naher Osten",
    "AF": "Afrika",
    "AM": "Amerika",
    "OC": "Ozeanien",
}


LANGUAGES: dict[str, Language] = {
    # ── Europa ──
    "de": Language("de", "German", "Deutsch", "EU", "at"),
    "en": Language("en", "English", "English", "EU", "gb"),
    "fr": Language("fr", "French", "Français", "EU", "fr"),
    "es": Language("es", "Spanish", "Español", "EU", "es"),
    "it": Language("it", "Italian", "Italiano", "EU", "it"),
    "pt": Language("pt", "Portuguese", "Português", "EU", "pt"),
    "nl": Language("nl", "Dutch", "Nederlands", "EU", "nl"),
    "pl": Language("pl", "Polish", "Polski", "EU", "pl"),
    "ru": Language("ru", "Russian", "Русский", "EU", "ru"),
    "uk": Language("uk", "Ukrainian", "Українська", "EU", "ua"),
    "cs": Language("cs", "Czech", "Čeština", "EU", "cz"),
    "sk": Language("sk", "Slovak", "Slovenčina", "EU", "sk"),
    "ro": Language("ro", "Romanian", "Română", "EU", "ro"),
    "hu": Language("hu", "Hungarian", "Magyar", "EU", "hu"),
    "sr": Language("sr", "Serbian", "Srpski", "EU", "rs"),
    "hr": Language("hr", "Croatian", "Hrvatski", "EU", "hr"),
    "bs": Language("bs", "Bosnian", "Bosanski", "EU", "ba"),
    "bg": Language("bg", "Bulgarian", "Български", "EU", "bg"),
    "el": Language("el", "Greek", "Ελληνικά", "EU", "gr"),
    "da": Language("da", "Danish", "Dansk", "EU", "dk"),
    "sv": Language("sv", "Swedish", "Svenska", "EU", "se"),
    "no": Language("no", "Norwegian", "Norsk", "EU", "no"),
    "fi": Language("fi", "Finnish", "Suomi", "EU", "fi"),
    "et": Language("et", "Estonian", "Eesti", "EU", "ee"),
    "lv": Language("lv", "Latvian", "Latviešu", "EU", "lv"),
    "lt": Language("lt", "Lithuanian", "Lietuvių", "EU", "lt"),
    "sl": Language("sl", "Slovenian", "Slovenščina", "EU", "si"),
    "mk": Language("mk", "Macedonian", "Македонски", "EU", "mk"),
    "sq": Language("sq", "Albanian", "Shqip", "EU", "al"),
    "is": Language("is", "Icelandic", "Íslenska", "EU", "is"),
    "ga": Language("ga", "Irish", "Gaeilge", "EU", "ie"),
    "cy": Language("cy", "Welsh", "Cymraeg", "EU", "gb"),
    "ca": Language("ca", "Catalan", "Català", "EU", "es"),
    "eu": Language("eu", "Basque", "Euskara", "EU", "es"),
    "gl": Language("gl", "Galician", "Galego", "EU", "es"),
    "lb": Language("lb", "Luxembourgish", "Lëtzebuergesch", "EU", "lu"),
    "mt": Language("mt", "Maltese", "Malti", "EU", "mt"),
    "be": Language("be", "Belarusian", "Беларуская", "EU", "by"),
    "hy": Language("hy", "Armenian", "Հայերեն", "EU", "am"),
    "ka": Language("ka", "Georgian", "ქართული", "EU", "ge"),
    "nn": Language("nn", "Nynorsk", "Nynorsk", "EU", "no"),
    "oc": Language("oc", "Occitan", "Occitan", "EU", "fr"),
    "br": Language("br", "Breton", "Brezhoneg", "EU", "fr"),
    "fo": Language("fo", "Faroese", "Føroyskt", "EU", "fo"),
    # ── Asien ──
    "zh": Language("zh", "Chinese", "中文", "AS", "cn"),
    "ja": Language("ja", "Japanese", "日本語", "AS", "jp"),
    "ko": Language("ko", "Korean", "한국어", "AS", "kr"),
    "hi": Language("hi", "Hindi", "हिन्दी", "AS", "in"),
    "bn": Language("bn", "Bengali", "বাংলা", "AS", "bd"),
    "th": Language("th", "Thai", "ไทย", "AS", "th"),
    "vi": Language("vi", "Vietnamese", "Tiếng Việt", "AS", "vn"),
    "id": Language("id", "Indonesian", "Bahasa Indonesia", "AS", "id"),
    "ms": Language("ms", "Malay", "Bahasa Melayu", "AS", "my"),
    "tl": Language("tl", "Tagalog", "Tagalog", "AS", "ph"),
    "ta": Language("ta", "Tamil", "தமிழ்", "AS", "in"),
    "te": Language("te", "Telugu", "తెలుగు", "AS", "in"),
    "kn": Language("kn", "Kannada", "ಕನ್ನಡ", "AS", "in"),
    "ml": Language("ml", "Malayalam", "മലയാളം", "AS", "in"),
    "gu": Language("gu", "Gujarati", "ગુજરાતી", "AS", "in"),
    "mr": Language("mr", "Marathi", "मराठी", "AS", "in"),
    "pa": Language("pa", "Punjabi", "ਪੰਜਾਬੀ", "AS", "in"),
    "ne": Language("ne", "Nepali", "नेपाली", "AS", "np"),
    "si": Language("si", "Sinhala", "සිංහල", "AS", "lk"),
    "km": Language("km", "Khmer", "ខ្មែរ", "AS", "kh"),
    "lo": Language("lo", "Lao", "ລາວ", "AS", "la"),
    "my": Language("my", "Myanmar", "မြန်မာ", "AS", "mm"),
    "mn": Language("mn", "Mongolian", "Монгол", "AS", "mn"),
    "kk": Language("kk", "Kazakh", "Қазақ", "AS", "kz"),
    "ky": Language("ky", "Kyrgyz", "Кыргыз", "AS", "kg"),
    "uz": Language("uz", "Uzbek", "Oʻzbek", "AS", "uz"),
    "tg": Language("tg", "Tajik", "Тоҷикӣ", "AS", "tj"),
    "tk": Language("tk", "Turkmen", "Türkmen", "AS", "tm"),
    "az": Language("az", "Azerbaijani", "Azərbaycan", "AS", "az"),
    "jv": Language("jv", "Javanese", "Basa Jawa", "AS", "id"),
    "su": Language("su", "Sundanese", "Basa Sunda", "AS", "id"),
    "bo": Language("bo", "Tibetan", "བོད་སྐད", "AS", "cn"),
    "as": Language("as", "Assamese", "অসমীয়া", "AS", "in"),
    "sd": Language("sd", "Sindhi", "سنڌي", "AS", "pk"),
    # ── Naher Osten ──
    "ar": Language("ar", "Arabic", "العربية", "ME", "sa"),
    "fa": Language("fa", "Persian", "فارسی", "ME", "ir"),
    "tr": Language("tr", "Turkish", "Türkçe", "ME", "tr"),
    "he": Language("he", "Hebrew", "עברית", "ME", "il"),
    "ur": Language("ur", "Urdu", "اردو", "ME", "pk"),
    "ps": Language("ps", "Pashto", "پښتو", "ME", "af"),
    "ba": Language("ba", "Bashkir", "Башҡорт", "ME", "ru"),
    "tt": Language("tt", "Tatar", "Татар", "ME", "ru"),
    # ── Afrika ──
    "af": Language("af", "Afrikaans", "Afrikaans", "AF", "za"),
    "sw": Language("sw", "Swahili", "Kiswahili", "AF", "tz"),
    "am": Language("am", "Amharic", "አማርኛ", "AF", "et"),
    "ha": Language("ha", "Hausa", "Hausa", "AF", "ng"),
    "yo": Language("yo", "Yoruba", "Yorùbá", "AF", "ng"),
    "sn": Language("sn", "Shona", "chiShona", "AF", "zw"),
    "so": Language("so", "Somali", "Soomaali", "AF", "so"),
    "mg": Language("mg", "Malagasy", "Malagasy", "AF", "mg"),
    "ny": Language("ny", "Chichewa", "Chichewa", "AF", "mw"),
    "tn": Language("tn", "Tswana", "Setswana", "AF", "bw"),
    "ln": Language("ln", "Lingala", "Lingála", "AF", "cd"),
    "zu": Language("zu", "Zulu", "isiZulu", "AF", "za"),
    # ── Amerika ──
    "la": Language("la", "Latin", "Latina", "AM", "va"),
    "sa": Language("sa", "Sanskrit", "संस्कृतम्", "AS", "in"),
    "haw": Language("haw", "Hawaiian", "ʻŌlelo Hawaiʻi", "OC", "us"),
    "mi": Language("mi", "Maori", "Te Reo Māori", "OC", "nz"),
    "sm": Language("sm", "Samoan", "Gagana Sāmoa", "OC", "ws"),
    # Rare/constructed — included for completeness
    "yi": Language("yi", "Yiddish", "ייִדיש", "EU", "il"),
    "tw": Language("tw", "Twi", "Twi", "AF", "gh"),
    "ty": Language("ty", "Tahitian", "Reo Tahiti", "OC", "pf"),
    "ceb": Language("ceb", "Cebuano", "Cebuano", "AS", "ph"),
    "fil": Language("fil", "Filipino", "Filipino", "AS", "ph"),
}


def get_all_language_codes() -> set[str]:
    """Return all registered language codes."""
    return set(LANGUAGES.keys())
```

**Step 2: Write test**

Create `tests/test_language_registry.py`:

```python
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
```

**Step 3: Run tests**

Run: `cd /mnt/d/repos/dolmtschr && python3 -m pytest tests/test_language_registry.py -v`
Expected: All 4 tests PASS

**Step 4: Commit**

```
feat(languages): add language registry with ~100 Whisper-supported languages
```

---

### Task 2: Enhanced `/api/languages` Endpoint

**Files:**
- Modify: `backend/providers/language_support.py`
- Modify: `backend/routers/languages.py`
- Test: `tests/test_language_coverage.py`

**Step 1: Update `get_language_coverage` to include registry metadata**

In `backend/providers/language_support.py`, modify `get_language_coverage()`:
- Import `LANGUAGES` and `CONTINENTS` from `language_registry`
- Use all registered languages as the base set (not just provider languages)
- Include `name`, `native_name`, `continent`, `country_code` in each language entry
- Add `continents` dict to the response

```python
from backend.providers.language_registry import LANGUAGES as REGISTRY, CONTINENTS

def get_language_coverage(tts_chain: list[str], translate_chain: list[str]) -> dict:
    languages: dict[str, dict] = {}
    voice_count = 0
    text_only_count = 0

    for code, meta in sorted(REGISTRY.items(), key=lambda x: x[0]):
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
            "tts_provider": tts_prov,
            "translate_provider": trans_prov,
            "tts_badge": badge,
        }

    return {
        "languages": languages,
        "continents": CONTINENTS,
        "tts_chain": tts_chain,
        "translate_chain": translate_chain,
        "totals": {"voice": voice_count, "text_only": text_only_count},
    }
```

**Step 2: Write test**

Create `tests/test_language_coverage.py`:

```python
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
```

**Step 3: Run tests**

Run: `python3 -m pytest tests/test_language_coverage.py -v`
Expected: All 4 tests PASS

**Step 4: Commit**

```
feat(api): enhanced /languages endpoint with metadata + all Whisper languages
```

---

### Task 3: SVG Flag Spritesheet

**Files:**
- Create: `frontend/public/flags.svg`
- Create: `frontend/src/components/Flag.tsx`
- Delete: `frontend/src/components/FlagSvg.tsx`
- Modify: `frontend/src/components/LanguageSelector.tsx` (update import)

**Step 1: Create SVG spritesheet**

Create `frontend/public/flags.svg` containing `<symbol>` elements for ~70 countries. Migrate all existing inline SVGs from `FlagSvg.tsx` and add flags for the newly supported languages. Use `id="flag-{country_code}"` naming.

**Step 2: Create Flag component**

Create `frontend/src/components/Flag.tsx`:

```tsx
interface FlagProps {
  countryCode: string
  size?: number
}

export function Flag({ countryCode, size = 24 }: FlagProps) {
  const h = Math.round(size * 0.7)

  return (
    <svg
      width={size}
      height={h}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <use
        href={`/flags.svg#flag-${countryCode}`}
        width={size}
        height={h}
        onError={undefined}
      />
    </svg>
  )
}
```

Note: SVG `<use>` with external file does not fire onerror. The LanguageSelector will handle fallback by checking if the country_code exists in a known set, or simply showing the 2-letter code as fallback alongside the Flag (which will be invisible if missing).

**Step 3: Delete FlagSvg.tsx**

Remove `frontend/src/components/FlagSvg.tsx`.

**Step 4: Update LanguageSelector import**

In `frontend/src/components/LanguageSelector.tsx`, replace `import { FlagSvg } from './FlagSvg'` with `import { Flag } from './Flag'`. Replace all `<FlagSvg code={...} size={...} />` with `<Flag countryCode={...} size={...} />`.

**Step 5: TypeScript check**

Run: `cd /mnt/d/repos/dolmtschr/frontend && npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```
feat(ui): SVG flag spritesheet + Flag component, remove inline FlagSvg
```

---

### Task 4: Frontend `useLanguages` Hook

**Files:**
- Create: `frontend/src/hooks/useLanguages.ts`
- Modify: `frontend/src/api/dolmtschr.ts` (update types)

**Step 1: Update API types**

In `frontend/src/api/dolmtschr.ts`, update the `LanguageCoverageEntry` and `LanguageCoverage` interfaces:

```tsx
export interface LanguageCoverageEntry {
  name: string
  native_name: string
  continent: string
  country_code: string
  tts_provider: string | null
  translate_provider: string | null
  tts_badge: 'voice' | 'text-only'
}

export interface LanguageCoverage {
  languages: Record<string, LanguageCoverageEntry>
  continents: Record<string, string>
  tts_chain: string[]
  translate_chain: string[]
  totals: { voice: number; text_only: number }
}
```

**Step 2: Create hook**

Create `frontend/src/hooks/useLanguages.ts`:

```tsx
import { useState, useEffect } from 'react'
import { getLanguageCoverage, type LanguageCoverage, type LanguageCoverageEntry } from '../api/dolmtschr'

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
  continent: string
  continentLabel: string
  countryCode: string
  ttsBadge: 'voice' | 'text-only'
}

export interface UseLanguagesReturn {
  languages: LanguageOption[]
  continents: Record<string, string>
  byContinent: Record<string, LanguageOption[]>
  loading: boolean
  error: string | null
}

export function useLanguages(
  ttsChain: string[],
  translateChain: string[],
): UseLanguagesReturn {
  const [data, setData] = useState<LanguageCoverage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getLanguageCoverage(ttsChain, translateChain)
      .then(setData)
      .catch((e) => {
        console.warn('useLanguages fetch failed', e)
        setError('Failed to load languages')
      })
      .finally(() => setLoading(false))
  }, [ttsChain.join(','), translateChain.join(',')])

  if (!data) {
    return { languages: [], continents: {}, byContinent: {}, loading, error }
  }

  const continents = data.continents
  const languages: LanguageOption[] = Object.entries(data.languages)
    .map(([code, entry]) => ({
      code,
      name: entry.name,
      nativeName: entry.native_name,
      continent: entry.continent,
      continentLabel: continents[entry.continent] || entry.continent,
      countryCode: entry.country_code,
      ttsBadge: entry.tts_badge,
    }))
    .sort((a, b) => a.nativeName.localeCompare(b.nativeName))

  const byContinent: Record<string, LanguageOption[]> = {}
  for (const lang of languages) {
    if (!byContinent[lang.continent]) byContinent[lang.continent] = []
    byContinent[lang.continent].push(lang)
  }

  return { languages, continents, byContinent, loading, error }
}
```

**Step 3: TypeScript check**

Run: `cd /mnt/d/repos/dolmtschr/frontend && npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```
feat(hooks): useLanguages hook — dynamic language data from backend
```

---

### Task 5: LanguageSelector Rewrite

**Files:**
- Rewrite: `frontend/src/components/LanguageSelector.tsx`
- Modify: `frontend/src/App.tsx` (pass languages data)
- Modify: `frontend/src/pages/Home.tsx` (accept languages prop)

**Step 1: Rewrite LanguageSelector**

Complete rewrite of `frontend/src/components/LanguageSelector.tsx`:
- Remove hardcoded `LANGUAGES` and `TARGET_LANGUAGES` arrays
- Accept `languages` prop from `useLanguages` hook
- LangChip dropdown with search input at top
- Grouped by continent with section headers
- Search matches code, name, native_name — hides section headers during search, shows continent label inline
- Flag from spritesheet, badge from backend

**Step 2: Update App.tsx**

In `App.tsx`:
- Import and call `useLanguages(settings.ttsChain, settings.translateChain)`
- Replace the existing `getLanguageCoverage` effect with the hook
- Pass `languages` data to `Home` and `LanguageSelector`

**Step 3: Update Home.tsx**

In `Home.tsx` (via `usePipeline` or props):
- Accept `languages` from useLanguages instead of `coverage`
- Pass to `LanguageSelector`

**Step 4: TypeScript check**

Run: `cd /mnt/d/repos/dolmtschr/frontend && npx tsc --noEmit`
Expected: No errors

**Step 5: Visual verification**

Open in browser at localhost:5173:
- [ ] Dropdown shows all languages grouped by continent
- [ ] Search filters across all fields
- [ ] Flags render from spritesheet
- [ ] voice/text-only badges visible
- [ ] Auto-detect option still works
- [ ] Swap button works
- [ ] Desktop layout looks good
- [ ] Mobile layout looks good

**Step 6: Commit**

```
feat(ui): dynamic language selector — search, continent groups, flag spritesheet
```

---

### Task 6: Cleanup + Deploy

**Step 1: Remove dead code**

- Remove any remaining references to old hardcoded language list
- Remove unused `GlobeIcon` if not needed
- Remove old `LanguageCoverage` usage from `ChainEditor` if applicable

**Step 2: TypeScript check**

Run: `cd /mnt/d/repos/dolmtschr/frontend && npx tsc --noEmit`
Expected: No errors

**Step 3: Python syntax check**

Run: `cd /mnt/d/repos/dolmtschr && python3 -m pytest tests/ -v`
Expected: All tests pass

**Step 4: Final commit**

```
chore: cleanup dead language code
```

**Step 5: Push + Deploy**

```bash
git push
# Deploy to testserver
ssh claude@192.168.178.82 "cd oidanice-inkonnect && git pull && docker compose up -d --build"
```
