import { Button } from '@oidanice/ink-ui'

interface SessionBarProps {
  sessionId: string | null
  title: string | null
  messageCount: number
  onEnd: () => void
}

export function SessionBar({ sessionId, title, messageCount, onEnd }: SessionBarProps) {
  if (!sessionId) return null

  const label = title || 'session'

  const handleEnd = () => {
    if (window.confirm('Session beenden?')) {
      onEnd()
    }
  }

  return (
    <div className="flex items-center justify-between font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
      <span>
        {label}
        {messageCount > 0 && ` (${messageCount})`}
      </span>
      <Button variant="ghost" className="font-mono text-xs px-2 py-0" onClick={handleEnd}>
        [ end ]
      </Button>
    </div>
  )
}
