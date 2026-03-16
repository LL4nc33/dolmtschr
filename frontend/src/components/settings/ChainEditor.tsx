import { useEffect, useState } from 'react'
import { Card } from '@oidanice/ink-ui'
import { getLanguageCoverage, type LanguageCoverage } from '../../api/dolmtschr'

const TTS_PROVIDERS = [
  { id: 'chatterbox', label: 'Chatterbox', type: 'lokal' },
  { id: 'piper', label: 'Piper', type: 'lokal' },
  { id: 'elevenlabs', label: 'ElevenLabs', type: 'cloud' },
] as const

const TRANSLATE_PROVIDERS = [
  { id: 'ollama', label: 'Ollama', type: 'lokal' },
  { id: 'deepl', label: 'DeepL', type: 'cloud' },
  { id: 'openai', label: 'OpenAI', type: 'cloud' },
] as const

interface ChainEditorProps {
  ttsChain: string[]
  onTtsChainChange: (chain: string[]) => void
  translateChain: string[]
  onTranslateChainChange: (chain: string[]) => void
}

function ChainList({
  label,
  chain,
  providers,
  onChange,
}: {
  label: string
  chain: string[]
  providers: readonly { id: string; label: string; type: string }[]
  onChange: (chain: string[]) => void
}) {
  const move = (index: number, dir: -1 | 1) => {
    const next = [...chain]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <h4 className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</h4>
      <div className="space-y-1">
        {chain.map((id, i) => {
          const prov = providers.find((p) => p.id === id)
          return (
            <div
              key={id}
              className="flex items-center gap-2 font-mono text-sm"
              style={{
                padding: '4px 8px',
                border: '2px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', minWidth: 18 }}>{i + 1}.</span>
              <span className="flex-1">{prov?.label ?? id}</span>
              <span
                className="text-xs"
                style={{
                  color: prov?.type === 'lokal' ? 'var(--success, #22c55e)' : 'var(--warning, #f59e0b)',
                  opacity: 0.8,
                }}
              >
                {prov?.type ?? ''}
              </span>
              <button
                className="border-0 bg-transparent cursor-pointer font-mono text-xs"
                style={{ color: 'var(--text-secondary)', padding: '0 2px' }}
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                ^
              </button>
              <button
                className="border-0 bg-transparent cursor-pointer font-mono text-xs"
                style={{ color: 'var(--text-secondary)', padding: '0 2px' }}
                onClick={() => move(i, 1)}
                disabled={i === chain.length - 1}
                aria-label="Move down"
              >
                v
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChainEditor({ ttsChain, onTtsChainChange, translateChain, onTranslateChainChange }: ChainEditorProps) {
  const [coverage, setCoverage] = useState<LanguageCoverage | null>(null)

  useEffect(() => {
    getLanguageCoverage(ttsChain, translateChain).then(setCoverage).catch(() => {})
  }, [ttsChain, translateChain])

  return (
    <Card>
      <h3 className="font-mono text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>provider-reihenfolge</h3>
      <div className="space-y-4">
        <ChainList
          label="TTS Chain (Prioritaet)"
          chain={ttsChain}
          providers={TTS_PROVIDERS}
          onChange={onTtsChainChange}
        />

        <ChainList
          label="Translate Chain (Prioritaet)"
          chain={translateChain}
          providers={TRANSLATE_PROVIDERS}
          onChange={onTranslateChainChange}
        />

        {coverage && (
          <div
            className="font-mono text-xs p-2"
            style={{ border: '2px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="flex justify-between">
              <span>Sprachen mit Sprachausgabe</span>
              <span style={{ color: 'var(--accent)' }}>{coverage.totals.voice}</span>
            </div>
            <div className="flex justify-between">
              <span>Sprachen nur Text</span>
              <span style={{ color: 'var(--text-secondary)' }}>{coverage.totals.text_only}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
