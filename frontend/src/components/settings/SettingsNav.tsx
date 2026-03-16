import { FilterChip } from '@oidanice/ink-ui'

const sections = [
  { id: 'section-status', label: 'status' },
  { id: 'section-local', label: 'lokal' },
  { id: 'section-cloud', label: 'cloud' },
  { id: 'section-chain', label: 'reihenfolge' },
] as const

interface SettingsNavProps {
  activeSection: string
}

export function SettingsNav({ activeSection }: SettingsNavProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="sticky top-0 z-30 flex flex-wrap gap-2 mb-4 py-2 -mx-3 px-3 md:-mx-0 md:px-0" style={{ backgroundColor: 'var(--bg)' }}>
      {sections.map((s) => (
        <FilterChip
          key={s.id}
          active={activeSection === s.id}
          onClick={() => scrollTo(s.id)}
        >
          {s.label}
        </FilterChip>
      ))}
    </div>
  )
}
