import { Button } from '@oidanice/ink-ui'

interface ResultActionsProps {
  onRetry: () => void
  onReset: () => void
}

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
