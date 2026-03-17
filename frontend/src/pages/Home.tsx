import { Progress } from '@oidanice/ink-ui'
import type { AppSettings } from '../hooks/useSettings'
import type { MessageResponse } from '../api/dolmtschr'
import type { LanguageOption } from '../hooks/useLanguages'
import { usePipeline } from '../hooks/usePipeline'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { PipelineRecorder } from '../components/PipelineRecorder'
import { TranscriptBubble } from '../components/TranscriptBubble'
import { LanguageSelector } from '../components/LanguageSelector'
import { ErrorCard } from '../components/ErrorCard'
import { ResultActions } from '../components/ResultActions'
import { SessionBar } from '../components/SessionBar'
import { MessageFeed } from '../components/MessageFeed'

interface HomeProps {
  settings: AppSettings
  languages: LanguageOption[]
  byContinent: Record<string, LanguageOption[]>
  continents: Record<string, string>
  onSourceChange: (lang: string) => void
  onTargetChange: (lang: string) => void
  sessionId: string | null
  sessionTitle: string | null
  messages: MessageResponse[]
  onEndSession: () => void
  onMessageAppend: (msg: MessageResponse) => void
  onAutoSession: (id: string) => void
}

export function Home({ settings, languages, byContinent, continents, onSourceChange, onTargetChange, sessionId, sessionTitle, messages, onEndSession, onMessageAppend, onAutoSession }: HomeProps) {
  const {
    phase, result, error, statusMessage, autoStart, spaceToggle,
    handleProcess, handleRetry, handleReset, handleRecordingStart,
    handleRecordingChange, handleSpaceToggle,
  } = usePipeline({
    settings,
    sessionId,
    historyEnabled: settings.historyEnabled,
    onAutoSession,
    onMessageAppend,
    onSourceChange,
  })

  useKeyboardShortcut(' ', handleSpaceToggle, phase === 'idle' || phase === 'result')

  const inSession = sessionId !== null

  return (
    <div className="space-y-3 md:space-y-4">
      {inSession && (
        <SessionBar sessionId={sessionId} title={sessionTitle} messageCount={messages.length} onEnd={onEndSession} />
      )}

      <LanguageSelector
        sourceLang={settings.sourceLang}
        targetLang={settings.targetLang}
        onSourceChange={onSourceChange}
        onTargetChange={onTargetChange}
        languages={languages}
        byContinent={byContinent}
        continents={continents}
      />

      {inSession && messages.length > 0 && (
        <MessageFeed messages={messages} sessionId={sessionId} />
      )}

      {phase !== 'processing' && phase !== 'error' && (
        <PipelineRecorder
          onProcess={handleProcess}
          disabled={false}
          autoStart={autoStart}
          onRecordingStart={handleRecordingStart}
          onRecordingChange={handleRecordingChange}
          triggerToggle={spaceToggle}
        />
      )}

      {statusMessage && phase === 'idle' && (
        <p className="text-center font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{statusMessage}</p>
      )}

      {phase === 'processing' && <Progress label="translating..." />}

      {phase === 'error' && error && <ErrorCard message={error} onRetry={handleRetry} />}

      {phase === 'result' && result && (
        <>
          <TranscriptBubble
            originalText={result.originalText}
            detectedLang={result.detectedLang}
            translatedText={result.translatedText}
            targetLang={settings.targetLang}
            audioBase64={result.audio}
            audioFormat={result.audioFormat}
            autoPlay={settings.autoPlay}
            sttMs={result.sttMs}
            translateMs={result.translateMs}
            ttsMs={result.ttsMs}
            modelUsed={result.modelUsed}
          />
          <ResultActions onRetry={handleRetry} onReset={handleReset} />
        </>
      )}

      <div aria-live="polite" className="sr-only">
        {statusMessage}
        {phase === 'processing' && 'Processing audio'}
        {phase === 'result' && 'Translation complete'}
        {phase === 'error' && `Error: ${error}`}
      </div>
    </div>
  )
}
