# Quality Sprint Plan — 3 Teams

> Ergebnis der 6-Agent-Analyse vom 2026-03-15.
> Findings konsolidiert, dedupliziert, priorisiert.

---

## Team 1: Robustheit & Fallbacks

**Scope:** Backend Error Handling, Timeouts, Event Loop, Frontend Error Recovery

### Phase 1 — Critical Fixes (Pipeline darf nicht crashen)

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 1.1 | TTS-Fehler in Pipeline abfangen — Text trotzdem zurueckliefern | `backend/routers/pipeline.py:208-219` | S |
| 1.2 | STT-Exception wrappen (unbehandelter 500er) | `backend/routers/pipeline.py:168` | S |
| 1.3 | `httpx.TimeoutException` in ALLEN Providern fangen (Ollama, OpenAI, DeepL, Chatterbox) | `backend/providers/translate/*.py`, `backend/providers/tts/chatterbox_remote.py` | M |
| 1.4 | `audio.play()` Promise catchen — Autoplay-Policy auf Mobile | `frontend/src/components/TranscriptBubble.tsx:68`, `SpeakButton.tsx:26`, `MessageBubble.tsx:32` | S |

### Phase 2 — High Priority (Event Loop + Resource Safety)

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 1.5 | Sync-Ops in Thread-Pool: `PiperVoice.synthesize_stream_raw`, `whisper.transcribe` | `piper_local.py:34-47`, `whisper_local.py:48-72` | M |
| 1.6 | `asyncio.create_task` Referenzen speichern (GC-safe) | `main.py:52`, `pipeline.py:105,252` | S |
| 1.7 | Audio-Upload-Groessenlimit fuer interne API (nicht nur Gateway) | `pipeline.py:167`, `stt.py:16` | S |
| 1.8 | Race Condition: Double-Tap auf Record-Button → Guard in `useVoiceRecorder` | `hooks/useVoiceRecorder.ts:42-84` | S |
| 1.9 | `Audio.onerror` Handler — Playing-State stuck fix | `TranscriptBubble.tsx`, `SpeakButton.tsx`, `MessageBubble.tsx` | S |

### Phase 3 — Medium (Resilience)

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 1.10 | Silent `.catch(() => {})` ersetzen durch Error-State/Console-Log (7 Stellen) | `App.tsx:41`, `Settings.tsx:74`, `Home.tsx:145,194`, etc. | S |
| 1.11 | Offline-Banner bei Netzwerkverlust (`navigator.onLine`) | Frontend global | M |
| 1.12 | Max Recording Duration (z.B. 5min) mit Auto-Stop | `useVoiceRecorder.ts` | S |
| 1.13 | `useClipboard` — try/catch fuer `navigator.clipboard.writeText` | `hooks/useClipboard.ts:8` | S |
| 1.14 | cleanup_loop Cancellation-Handling | `database/cleanup.py:49-58` | S |

---

## Team 2: UI/UX

**Scope:** Dolmetscher-Flow, Accessibility, Navigation, Visual Polish

### Phase 1 — Critical Fixes (Core Flow broken)

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 2.1 | Record-Button auch in `result`-Phase sichtbar (statt versteckt) | `Home.tsx:223-232` | M |
| 2.2 | Space-Shortcut auf `result`-Phase erweitern | `Home.tsx:84` | S |
| 2.3 | "No speech detected" — sichtbares Feedback (Toast/Hint) | `Home.tsx:167-170` | S |
| 2.4 | Onboarding/Empty State: "Tippen zum Sprechen" Label unter Record-Button | `RecordButton.tsx`, `Home.tsx` | S |

### Phase 2 — High Priority (Accessibility + Navigation)

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 2.5 | Language Dropdown: Keyboard-Navigation (Escape, Arrow, Enter) + ARIA | `LanguageSelector.tsx:316-357` | L |
| 2.6 | SidebarSessionItem: Delete-Button auf Touch erreichbar (fehlende `group`-Klasse) | `SidebarSessionItem.tsx:38` | S |
| 2.7 | Hash-Router (`#home`/`#settings`) fuer Browser-Back | `App.tsx` | M |
| 2.8 | Auto-detect Sprache in Selector zurueckschreiben → Swap ermoeglichen | `LanguageSelector.tsx`, `Home.tsx` | M |

### Phase 3 — Medium (Polish)

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 2.9 | Processing-Phasen granular ("Transcribing...", "Translating...", "Synthesizing...") | `Home.tsx:234`, Backend Response | M |
| 2.10 | SettingsNav sticky machen (wie LanguageSelector) | `SettingsNav.tsx:20` | S |
| 2.11 | Session-Ende Bestaetigung (kein versehentliches Beenden) | `SessionBar.tsx:21` | S |
| 2.12 | Footer-Animation: `prefers-reduced-motion` respektieren | `Footer.tsx:9-17` | S |
| 2.13 | Mobile Sidebar Overlay: Focus-Trap + Escape-to-close + ARIA | `App.tsx:188-202` | M |
| 2.14 | Inline-CSS Splash/Skeleton in `index.html` | `frontend/index.html` | S |
| 2.15 | PWA Manifest: maskable Icon hinzufuegen | `manifest.json` | S |

---

## Team 3: Security & Codebase-Wartbarkeit

**Scope:** OWASP Fixes, API Hardening, Code Quality, Tests

### Phase 1 — Critical Security (vor Production)

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 3.1 | CORS: Wildcard `*` ersetzen durch spezifische Origins | `main.py:88-94` | S |
| 3.2 | API-Keys aus Query-Params in Headers/Body verschieben | `pipeline.py:149-155`, `translate.py:16`, `config.py:221,259,427`, `dolmtschr.ts:211,220` | L |
| 3.3 | File-Upload Groessenlimit auf internen Routen | `pipeline.py:167`, `stt.py:16` | S |
| 3.4 | SSRF-Schutz: URL-Validierung fuer Provider-URLs (keine Private IPs) | `config.py:243,266,284`, `resolver.py:36,78` | M |
| 3.5 | Path Traversal Validierung bei Audio-File-Serving | `messages.py:86` | S |

### Phase 2 — Code Quality (Wartbarkeit)

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 3.6 | `AppSettings` Interface einmal definieren + exportieren (DRY) | `useSettings.ts` + `Settings.tsx` | S |
| 3.7 | `HomeProps` → `settings: AppSettings` Object statt 37 einzelne Props | `Home.tsx`, `App.tsx` | M |
| 3.8 | `FlagSvg` aus `LanguageSelector.tsx` extrahieren (189 Zeilen) | `LanguageSelector.tsx` → `FlagSvg.tsx` | S |
| 3.9 | `handleProcess` in `usePipeline` Hook extrahieren | `Home.tsx:86-175` | M |
| 3.10 | `config.py` Router aufsplitten (482 Zeilen → 5 Dateien) | `backend/routers/config.py` | L |
| 3.11 | Pipeline-Endpoint: 27 Query-Params → Pydantic RequestBody | `pipeline.py:135-162` | L |

### Phase 3 — Tests + Hardening

| # | Finding | Datei | Aufwand |
|---|---------|-------|---------|
| 3.12 | Test-Infrastruktur: pytest-httpx + Pipeline Integration Tests | `tests/` | L |
| 3.13 | Provider Contract Tests (STT, TTS, Translate) | `tests/` | L |
| 3.14 | Pydantic Response Models fuer alle `-> dict` Endpoints (15 Stueck) | `gateway/router.py`, `sessions.py`, `config.py` | M |
| 3.15 | Rate Limiting fuer interne API (`/api/*`) | `main.py` | M |
| 3.16 | Default DB-Credentials aus Source entfernen | `config.py:56`, `docker-compose.yml:33` | S |
| 3.17 | `.mcp.json` zu `.gitignore` hinzufuegen | `.gitignore` | S |

---

## Aufwand-Legende

| Symbol | Bedeutung |
|--------|-----------|
| S | Small — 15-30 min |
| M | Medium — 1-2h |
| L | Large — halber Tag+ |

## Empfohlene Reihenfolge

Alle 3 Teams starten parallel mit Phase 1 (Critical). Die Phasen sind abhaengigkeitsfrei zwischen Teams.

**Quick Wins (sofort machbar, grosse Wirkung):**
- 2.4 Onboarding Label (5 Zeilen Code)
- 2.6 SidebarSessionItem group-Klasse (1 Zeile)
- 3.6 AppSettings DRY (Move + Re-Export)
- 3.17 .mcp.json gitignore (1 Zeile)
- 1.4 audio.play() catch (3 Stellen, je 2 Zeilen)

**Groesste Impact-Fixes:**
- 1.1+1.2+1.3: Pipeline crasht nicht mehr bei Provider-Ausfaellen
- 2.1+2.2: Dolmetscher-Flow wird fluessig (Record immer sichtbar)
- 3.2+3.1: Security-Baseline fuer Production
