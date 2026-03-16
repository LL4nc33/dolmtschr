import { Flag } from './Flag'
import type { LanguageOption } from '../hooks/useLanguages'

interface LanguageQualityModalProps {
  lang: LanguageOption
  style?: React.CSSProperties
}

function tierToScore(tier: string): number {
  switch (tier) {
    case 'excellent': return 100
    case 'good': return 75
    case 'fair': return 50
    case 'poor': return 25
    case 'experimental': return 10
    default: return 0
  }
}

function ttsScore(provider: string | null, badge: string): number {
  if (!provider) return 0
  return badge === 'voice' ? 80 : 0
}

function overallStars(stt: number, translateTier: string, ttsProvider: string | null, ttsBadge: string): number {
  const translate = tierToScore(translateTier)
  const tts = ttsScore(ttsProvider, ttsBadge)
  const overall = (stt * 0.4) + (translate * 0.4) + (tts * 0.2)
  if (overall >= 90) return 5
  if (overall >= 70) return 4
  if (overall >= 50) return 3
  if (overall >= 30) return 2
  return 1
}

function starLabel(stars: number): string {
  if (stars >= 5) return 'Excellent'
  if (stars >= 4) return 'Good'
  if (stars >= 3) return 'Fair'
  if (stars >= 2) return 'Poor'
  return 'Experimental'
}

function QualityBar({ value, label, detail }: { value: number; label: string; detail: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between font-mono text-xs">
        <span>{label}</span>
        <span style={{ opacity: 0.6 }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-secondary, rgba(0,0,0,0.1))', borderRadius: 0 }}>
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: value >= 70 ? 'var(--success, #22c55e)' : value >= 40 ? 'var(--warning, #f59e0b)' : 'var(--error, #ef4444)',
            borderRadius: 0,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div className="font-mono" style={{ fontSize: 10, opacity: 0.5 }}>{detail}</div>
    </div>
  )
}

export function LanguageQualityModal({ lang, style }: LanguageQualityModalProps) {
  const translateScore = tierToScore(lang.translateTier)
  const tts = ttsScore(lang.ttsProvider, lang.ttsBadge)
  const stars = overallStars(lang.sttQuality, lang.translateTier, lang.ttsProvider, lang.ttsBadge)

  const providerLabel = (p: string | null) => {
    if (!p) return 'none'
    if (p === 'ollama') return 'local ai'
    return p
  }

  const translateDetail = [
    providerLabel(lang.translateProvider),
    lang.translateTier,
  ].join(' · ')

  const ttsDetail = lang.ttsProvider
    ? `${lang.ttsProvider} · ${lang.ttsBadge}`
    : 'no provider'

  return (
    <div
      className="font-mono text-xs"
      style={{
        padding: '8px 10px',
        background: 'var(--bg-secondary, rgba(0,0,0,0.03))',
        borderTop: '1px solid var(--border)',
        ...style,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Flag countryCode={lang.countryCode} size={28} />
        <div>
          <div className="font-bold text-sm">{lang.nativeName}</div>
          <div style={{ opacity: 0.5 }}>{lang.name} · {lang.code.toUpperCase()}</div>
        </div>
      </div>

      <div className="space-y-2">
        <QualityBar value={lang.sttQuality} label="STT" detail={`whisper · ${lang.sttQuality >= 80 ? 'excellent' : lang.sttQuality >= 60 ? 'good' : 'limited'}`} />
        <QualityBar value={translateScore} label="Translate" detail={translateDetail} />
        <QualityBar value={tts} label="TTS" detail={ttsDetail} />
      </div>

      <div className="mt-3 flex items-center gap-1" style={{ color: stars >= 4 ? 'var(--success, #22c55e)' : stars >= 3 ? 'var(--warning, #f59e0b)' : 'var(--error, #ef4444)' }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ opacity: i < stars ? 1 : 0.2 }}>&#9733;</span>
        ))}
        <span className="ml-1" style={{ opacity: 0.7 }}>{starLabel(stars)}</span>
      </div>
    </div>
  )
}
