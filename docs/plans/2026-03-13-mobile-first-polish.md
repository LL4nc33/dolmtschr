# Mobile-First Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the dolmtschr Home screen optimally usable on mobile devices in interpreter mode (phone gets passed around in conversations).

**Architecture:** Responsive Tailwind breakpoint adjustments to existing components. No new components, no new views. Mobile-first defaults with `md:` overrides for desktop.

**Tech Stack:** Tailwind CSS, React, ink-ui Layout component

---

### Task 1: Layout responsive padding (ink-ui)

**Files:**
- Modify: `ink-ui/src/components/Layout.tsx`

**Step 1: Update header padding**

Change line 83:
```tsx
// FROM:
className="px-6 py-6 flex items-center justify-between"
// TO:
className="px-3 py-3 md:px-6 md:py-6 flex items-center justify-between"
```

**Step 2: Update title font size**

Change line 89:
```tsx
// FROM:
className="font-serif text-2xl font-light tracking-wider leading-tight"
// TO:
className="font-serif text-xl md:text-2xl font-light tracking-wider leading-tight"
```

**Step 3: Update main content padding**

Change line 71:
```tsx
// FROM:
className={`flex-1 px-6 py-8 ${maxWidth} w-full mx-auto`}
// TO:
className={`flex-1 px-3 py-4 md:px-6 md:py-8 ${maxWidth} w-full mx-auto`}
```

**Step 4: Update footer padding**

Change line 120:
```tsx
// FROM:
className="px-6 py-3 text-center font-mono text-xs flex items-center justify-center gap-1"
// TO:
className="px-3 py-2 md:px-6 md:py-3 text-center font-mono text-xs flex items-center justify-center gap-1"
```

**Step 5: Build ink-ui**

Run: `cd ink-ui && npm run build`
Expected: Build succeeds

**Step 6: Commit**

```
feat(layout): responsive padding for mobile-first
```

---

### Task 2: LanguageSelector sticky header strip

**Files:**
- Modify: `frontend/src/components/LanguageSelector.tsx`
- Modify: `frontend/src/index.css`

**Step 1: Make LanguageSelector wrapper sticky with backdrop blur**

In `LanguageSelector.tsx`, change the outer div (line 207):
```tsx
// FROM:
<div className="flex flex-col items-center gap-1">
// TO:
<div className="sticky top-0 z-40 flex flex-col items-center gap-1 py-2 -mx-3 px-3 md:-mx-0 md:px-0" style={{ backgroundColor: 'var(--bg)', backdropFilter: 'blur(8px)' }}>
```

**Step 2: Fix dropdown positioning for mobile**

In `index.css`, update `.lang-dropdown`:
```css
/* FROM: */
.lang-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  max-height: 280px;
  ...
}

/* TO: */
.lang-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  max-height: 60vh;
  ...
}
```

**Step 3: Commit**

```
feat(lang-selector): sticky header strip + mobile dropdown fix
```

---

### Task 3: Record Button touch improvements

**Files:**
- Modify: `frontend/src/index.css`

**Step 1: Add touch-action and stronger ripple**

In `index.css`, update record button styles:

Add `touch-action: manipulation;` to `.record-btn`.

Update `@keyframes ripple`:
```css
@keyframes ripple {
  0% { transform: scale(0.85); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}
```

**Step 2: Commit**

```
feat(record-btn): touch-action manipulation + stronger ripple
```

---

### Task 4: TranscriptBubble mobile-optimized

**Files:**
- Modify: `frontend/src/components/TranscriptBubble.tsx`
- Modify: `frontend/src/index.css`

**Step 1: Larger text and wider bubbles on mobile**

In `TranscriptBubble.tsx`, update OriginalBubble (line 38):
```tsx
// FROM:
<div className="bubble bubble--original max-w-[85%]">
// TO:
<div className="bubble bubble--original max-w-[95%] md:max-w-[85%]">
```

Update text size (line 39):
```tsx
// FROM:
<p className="text-base leading-relaxed">{text}</p>
// TO:
<p className="text-lg md:text-base leading-relaxed">{text}</p>
```

Same for TranslationBubble (line 89):
```tsx
// FROM:
<div className="bubble bubble--translation max-w-[85%]">
// TO:
<div className="bubble bubble--translation max-w-[95%] md:max-w-[85%]">
```

And text (line 91):
```tsx
// FROM:
<p className="text-base leading-relaxed flex-1">{text}</p>
// TO:
<p className="text-lg md:text-base leading-relaxed flex-1">{text}</p>
```

**Step 2: Enlarge touch targets for Play/Copy buttons**

In `index.css`, update `.bubble-copy` and `.bubble-play`:
```css
.bubble-copy, .bubble-play {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  color: inherit;
  opacity: 0.7;
}
.bubble-play {
  font-size: 20px;
}
```

**Step 3: Commit**

```
feat(bubbles): larger text + touch targets on mobile
```

---

### Task 5: ResultActions mobile-first

**Files:**
- Modify: `frontend/src/components/ResultActions.tsx`

**Step 1: Reorder buttons, new recording as primary full-width**

```tsx
export function ResultActions({ onRetry, onReset }: ResultActionsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Button className="flex-1 min-h-[48px]" onClick={onReset}>
        [ new recording ]
      </Button>
      <Button variant="ghost" className="md:flex-1 min-h-[44px]" onClick={onRetry}>
        [ retry ]
      </Button>
    </div>
  )
}
```

**Step 2: Commit**

```
feat(result-actions): mobile-first button layout
```

---

### Task 6: Home page spacing + App header

**Files:**
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Tighter spacing on mobile**

In `Home.tsx`, update root div (line 201):
```tsx
// FROM:
<div className="space-y-4">
// TO:
<div className="space-y-3 md:space-y-4">
```

**Step 2: App header — larger hamburger touch target + tighter nav gap**

In `App.tsx`, update hamburger button (lines 100-107):
```tsx
// FROM:
className="md:hidden border-0 bg-transparent cursor-pointer p-1 font-mono text-base"
// TO:
className="md:hidden border-0 bg-transparent cursor-pointer p-2 font-mono text-base min-w-[44px] min-h-[44px] flex items-center justify-center"
```

Update nav gap (line 111):
```tsx
// FROM:
<div className="flex items-center gap-3">
// TO:
<div className="flex items-center gap-2 md:gap-3">
```

**Step 3: Commit**

```
feat(home): mobile spacing + larger hamburger touch target
```

---

### Task 7: Visual verification

**Step 1: Start dev server**

Run: `cd frontend && npm run dev`

**Step 2: Open in browser mobile emulation**

Check at 375px (iPhone SE) and 390px (iPhone 14):
- [ ] Header compact, title readable
- [ ] Language selector sticky, dropdown not clipped
- [ ] Record button has visible ripple, no double-tap zoom
- [ ] Transcript bubbles wide, text legible
- [ ] Play/Copy buttons easily tappable
- [ ] "New Recording" button is full-width primary
- [ ] Hamburger button easily tappable
- [ ] Desktop (1024px+) still looks good
