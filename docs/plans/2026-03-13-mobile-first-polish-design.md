# Mobile-First Polish Design

## Context
dolmtschr wird als Dolmetscher-App verwendet: Handy wird in Gespraechen rumgereicht.
Mobile-First bedeutet hier: Home-Screen (Aufnehmen + Uebersetzen) muss mit minimalem Aufwand bedienbar sein.
Settings sind sekundaer und werden selten mobil genutzt.

## Approach
CSS-Polish der bestehenden Komponenten mit responsive Breakpoints. Keine neuen Views.

## Changes

### 1. Layout (ink-ui Layout.tsx)
- Header: `px-6 py-6` -> `px-3 py-3 md:px-6 md:py-6`
- Main: `px-6 py-8` -> `px-3 py-4 md:px-6 md:py-8`
- Footer: `px-6 py-3` -> `px-3 py-2 md:px-6 md:py-3`
- Titel: `text-2xl` -> `text-xl md:text-2xl`

### 2. LanguageSelector — Sticky Header-Streifen
- Wrapper: `sticky top-0 z-40` + background-blur
- Kompakteres Padding auf Mobile
- Dropdown: auf Mobile `left: 0` statt center-transform, `max-height: 60vh`

### 3. Record Button — Mehr visuelles Feedback
- Ripple scale bis 1.6 statt 1.4
- Active-State: groesserer Box-Shadow
- `touch-action: manipulation` (kein Double-Tap-Zoom)

### 4. TranscriptBubble — Ergebnis gross anzeigen
- Text: `text-lg md:text-base` (groesser auf Mobile)
- Max-width: `max-w-[95%] md:max-w-[85%]`
- Play/Copy Buttons: min 44px Touch-Target

### 5. ResultActions — Tap-to-Continue
- New Recording: Full-Width Primary Button auf Mobile
- Retry: sekundaer, kleiner
- Reihenfolge: New Recording zuerst

### 6. Home Page
- `space-y-3 md:space-y-4`

### 7. Header-Nav (App.tsx)
- Buttons gap: `gap-2 md:gap-3`
- Hamburger: min 44x44px Touch-Target
