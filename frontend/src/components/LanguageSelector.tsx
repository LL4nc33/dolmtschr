import { useState, useRef, useEffect } from 'react'
import { Flag } from './Flag'
import { LanguageQualityModal } from './LanguageQualityModal'
import type { LanguageOption } from '../hooks/useLanguages'

function GlobeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" style={{ verticalAlign: 'middle' }}>
      <circle cx="10" cy="10" r="8" />
      <ellipse cx="10" cy="10" rx="4" ry="8" />
      <line x1="2" y1="10" x2="18" y2="10" />
    </svg>
  )
}

function TtsBadge({ badge }: { badge: 'voice' | 'text-only' }) {
  const isVoice = badge === 'voice'
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 9,
        padding: '1px 3px',
        borderRadius: 2,
        backgroundColor: isVoice ? 'var(--accent, #6366f1)' : 'var(--bg-secondary, rgba(0,0,0,0.05))',
        color: isVoice ? 'var(--bg, #fff)' : 'var(--text-secondary)',
        opacity: isVoice ? 1 : 0.6,
        lineHeight: 1,
      }}
    >
      {isVoice ? 'voice' : 'text'}
    </span>
  )
}

interface LanguageSelectorProps {
  sourceLang: string
  targetLang: string
  onSourceChange: (lang: string) => void
  onTargetChange: (lang: string) => void
  languages: LanguageOption[]
  byContinent: Record<string, LanguageOption[]>
  continents: Record<string, string>
}

export function LanguageSelector({
  sourceLang, targetLang, onSourceChange, onTargetChange,
  languages, byContinent, continents,
}: LanguageSelectorProps) {
  const [swapped, setSwapped] = useState(false)

  const selectedTarget = languages.find((l) => l.code === targetLang)
  const isTextOnly = selectedTarget?.ttsBadge === 'text-only'

  const swap = () => {
    if (!sourceLang) return
    setSwapped((s) => !s)
    onSourceChange(targetLang)
    onTargetChange(sourceLang)
  }

  return (
    <div className="sticky top-0 z-40 flex flex-col items-center gap-1 py-2 -mx-3 px-3 md:-mx-0 md:px-0" style={{ backgroundColor: 'var(--bg)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-center gap-2">
        <LangChip
          value={sourceLang}
          onChange={onSourceChange}
          languages={languages}
          byContinent={byContinent}
          continents={continents}
          includeAuto
        />
        <button
          className="lang-swap-btn"
          onClick={swap}
          disabled={!sourceLang}
          aria-label="Swap languages"
          style={{ transform: swapped ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ⇄
        </button>
        <LangChip
          value={targetLang}
          onChange={onTargetChange}
          languages={languages}
          byContinent={byContinent}
          continents={continents}
        />
      </div>
      {isTextOnly && (
        <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
          kein TTS — nur Textausgabe
        </span>
      )}
    </div>
  )
}

interface LangChipProps {
  value: string
  onChange: (code: string) => void
  languages: LanguageOption[]
  byContinent: Record<string, LanguageOption[]>
  continents: Record<string, string>
  includeAuto?: boolean
}

function LangChip({ value, onChange, languages, byContinent, continents, includeAuto }: LangChipProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  const selected = languages.find((l) => l.code === value)
  const label = selected ? selected.code.toUpperCase() : 'Auto'

  const q = search.toLowerCase().trim()
  const filtered = q
    ? languages.filter((l) =>
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q)
      )
    : null

  // Continent order
  const continentOrder = ['EU', 'AS', 'ME', 'AF', 'AM', 'OC']

  return (
    <div ref={ref} className="relative">
      <button className="lang-chip" onClick={() => setOpen(!open)}>
        {selected ? <Flag countryCode={selected.countryCode} size={24} /> : <GlobeIcon size={22} />}
        <span className="font-mono text-sm font-bold">{label}</span>
        <span className="text-xs" style={{ opacity: 0.5 }}>▾</span>
      </button>
      {open && (
        <div className="lang-dropdown">
          <div style={{ padding: '4px 4px 8px' }}>
            <input
              ref={searchRef}
              type="text"
              className="font-mono text-sm w-full"
              placeholder="search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'var(--bg-secondary, rgba(0,0,0,0.05))',
                border: '1px solid var(--border)',
                padding: '4px 8px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
          </div>

          {includeAuto && (
            <button
              className={`lang-dropdown-item ${value === '' ? 'lang-dropdown-item--active' : ''}`}
              onClick={() => { onChange(''); setOpen(false) }}
            >
              <GlobeIcon size={20} />
              <span>Auto-detect</span>
            </button>
          )}

          {filtered ? (
            /* Search results — flat list with continent label */
            filtered.map((l) => (
              <DropdownItem
                key={l.code}
                lang={l}
                active={l.code === value}
                showContinent
                expanded={expandedCode === l.code}
                onToggleQuality={() => setExpandedCode(expandedCode === l.code ? null : l.code)}
                onSelect={() => { onChange(l.code); setOpen(false) }}
              />
            ))
          ) : (
            /* Grouped by continent */
            continentOrder.map((c) => {
              const group = byContinent[c]
              if (!group?.length) return null
              return (
                <div key={c}>
                  <div
                    className="font-mono text-xs px-2 py-1"
                    style={{ color: 'var(--text-secondary)', opacity: 0.5 }}
                  >
                    — {continents[c] || c} —
                  </div>
                  {group.map((l) => (
                    <DropdownItem
                      key={l.code}
                      lang={l}
                      active={l.code === value}
                      expanded={expandedCode === l.code}
                      onToggleQuality={() => setExpandedCode(expandedCode === l.code ? null : l.code)}
                      onSelect={() => { onChange(l.code); setOpen(false) }}
                    />
                  ))}
                </div>
              )
            })
          )}

          {filtered && filtered.length === 0 && (
            <p className="font-mono text-xs text-center py-2" style={{ color: 'var(--text-secondary)' }}>
              no matches
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function DropdownItem({ lang, active, showContinent, expanded, onToggleQuality, onSelect }: {
  lang: LanguageOption
  active: boolean
  showContinent?: boolean
  expanded?: boolean
  onToggleQuality?: () => void
  onSelect: () => void
}) {
  return (
    <div>
      <div className="flex">
        <button
          className={`lang-dropdown-item flex-1 ${active ? 'lang-dropdown-item--active' : ''}`}
          onClick={onSelect}
        >
          <Flag countryCode={lang.countryCode} size={22} />
          <span className="flex-1">{lang.nativeName}</span>
          <span className="font-mono text-xs" style={{ opacity: 0.5 }}>{lang.code.toUpperCase()}</span>
          {showContinent && (
            <span className="font-mono text-xs" style={{ opacity: 0.4 }}>{lang.continent}</span>
          )}
          <TtsBadge badge={lang.ttsBadge} />
        </button>
        <button
          className="font-mono text-xs px-2"
          style={{ color: 'var(--text-secondary)', opacity: expanded ? 1 : 0.4, background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onToggleQuality?.() }}
          aria-label="Show quality info"
        >
          i
        </button>
      </div>
      {expanded && (
        <LanguageQualityModal lang={lang} />
      )}
    </div>
  )
}
