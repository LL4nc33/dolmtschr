import { Input, Select } from '@oidanice/ink-ui'

interface DeepLConfigProps {
  deepLKey: string
  onDeepLKeyChange: (key: string) => void
  deepLFree: boolean
  onDeepLFreeChange: (free: boolean) => void
}

function PrivacyBadge({ free }: { free: boolean }) {
  const label = free
    ? 'EU-Server, Daten fuer Training'
    : 'Keine Datenspeicherung, DSGVO'
  const color = free ? 'var(--warning, #f59e0b)' : 'var(--success, #22c55e)'

  return (
    <span
      className="font-mono text-xs"
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        border: `1px solid ${color}`,
        color,
        marginTop: 4,
      }}
    >
      [{label}]
    </span>
  )
}

export function DeepLConfig({
  deepLKey, onDeepLKeyChange,
  deepLFree, onDeepLFreeChange,
}: DeepLConfigProps) {
  return (
    <>
      <Input
        label="API Key"
        type="password"
        placeholder="DeepL API Key"
        value={deepLKey}
        onChange={(e) => onDeepLKeyChange(e.target.value)}
      />
      <Select
        label="Tier"
        value={deepLFree ? 'free' : 'pro'}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onDeepLFreeChange(e.target.value === 'free')}
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </Select>
      <PrivacyBadge free={deepLFree} />
    </>
  )
}
