import { useState, useRef, useCallback } from 'react'
import type { AppSettings } from './useSettings'
import {
  pipeline,
  warmupGpu,
  createSession,
  updateSession,
  type ProviderOptions,
  type SynthesisParams,
  type ElevenLabsParams,
  type MessageResponse,
} from '../api/dolmtschr'

type Phase = 'idle' | 'processing' | 'result' | 'error'

interface Result {
  originalText: string
  detectedLang: string
  translatedText: string
  audio: string | null
  audioFormat: string
  durationMs: number
  sttMs: number | null
  translateMs: number | null
  ttsMs: number | null
  modelUsed: string | null
}

interface UsePipelineOptions {
  settings: AppSettings
  sessionId: string | null
  historyEnabled: boolean
  onAutoSession: (id: string) => void
  onMessageAppend: (msg: MessageResponse) => void
  onSourceChange: (lang: string) => void
}

interface UsePipelineReturn {
  phase: Phase
  result: Result | null
  error: string | null
  statusMessage: string
  autoStart: boolean
  spaceToggle: number
  handleProcess: (blob: Blob) => Promise<void>
  handleRetry: () => void
  handleReset: () => void
  handleRecordingStart: () => void
  handleRecordingChange: (recording: boolean) => void
  handleSpaceToggle: () => void
}

function buildProviderOpts(
  provider: string,
  url: string,
  key: string,
  deepLKey: string,
  deepLFree: boolean,
): ProviderOptions | undefined {
  if (provider === 'openai' && url) return { provider: 'openai', apiUrl: url, apiKey: key || undefined }
  if (provider === 'deepl' && deepLKey) return { provider: 'deepl', apiKey: deepLKey, deeplFree: deepLFree }
  return undefined
}

export function usePipeline(opts: UsePipelineOptions): UsePipelineReturn {
  const { settings, sessionId, historyEnabled, onAutoSession, onMessageAppend, onSourceChange } = opts
  const {
    sourceLang, targetLang, ttsEnabled, ttsProvider, piperVoice,
    chatterboxVoice, chatterboxUrl, ollamaModel, ollamaUrl,
    translateProvider, openaiUrl, openaiKey, openaiModel,
    chatterboxExaggeration, chatterboxCfgWeight, chatterboxTemperature,
    ollamaKeepAlive, ollamaContextLength, deepLKey, deepLFree,
    elevenlabsKey, elevenlabsModel, elevenlabsVoiceId,
    elevenlabsStability, elevenlabsSimilarity,
  } = settings

  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [spaceToggle, setSpaceToggle] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [autoStart, setAutoStart] = useState(false)
  const lastBlob = useRef<Blob | null>(null)
  const autoSessionRef = useRef<string | null>(null)

  const handleRecordingChange = useCallback((recording: boolean) => {
    setStatusMessage(recording ? 'Recording started' : '')
  }, [])

  const handleSpaceToggle = useCallback(() => {
    setSpaceToggle((n) => n + 1)
  }, [])

  const handleProcess = async (blob: Blob) => {
    lastBlob.current = blob
    setPhase('processing')
    setError(null)

    // Auto-create session if history enabled and no active session
    let activeSessionId = sessionId
    if (!activeSessionId && historyEnabled) {
      try {
        const s = await createSession(sourceLang || 'auto', targetLang, ttsEnabled)
        activeSessionId = s.id
        autoSessionRef.current = s.id
        onAutoSession(s.id)
      } catch {
        // Continue without session if creation fails
      }
    }

    try {
      const providerOpts = buildProviderOpts(translateProvider, openaiUrl, openaiKey, deepLKey, deepLFree)
      const model = translateProvider === 'openai' ? openaiModel || undefined : ollamaModel || undefined
      const activeTtsProvider = ttsProvider === 'chatterbox' ? 'chatterbox'
        : ttsProvider === 'elevenlabs' ? 'elevenlabs' : undefined
      const synthesisParams: SynthesisParams | undefined =
        ttsProvider === 'chatterbox'
          ? { exaggeration: chatterboxExaggeration, cfgWeight: chatterboxCfgWeight, temperature: chatterboxTemperature }
          : undefined
      const elParams: ElevenLabsParams | undefined =
        ttsProvider === 'elevenlabs'
          ? { key: elevenlabsKey, voiceId: elevenlabsVoiceId, model: elevenlabsModel, stability: elevenlabsStability, similarity: elevenlabsSimilarity }
          : undefined
      const voice = ttsProvider === 'chatterbox' ? chatterboxVoice
        : ttsProvider === 'elevenlabs' ? undefined : piperVoice
      const res = await pipeline(
        blob, sourceLang || undefined, targetLang, ttsEnabled,
        voice || undefined, model, providerOpts, activeTtsProvider, synthesisParams,
        ttsProvider === 'chatterbox' ? chatterboxUrl || undefined : undefined,
        translateProvider === 'local' ? ollamaUrl || undefined : undefined,
        translateProvider === 'local' ? ollamaKeepAlive || undefined : undefined,
        translateProvider === 'local' && ollamaContextLength ? parseInt(ollamaContextLength, 10) : undefined,
        elParams, activeSessionId || undefined,
      )
      setResult({
        originalText: res.original_text,
        detectedLang: res.detected_language,
        translatedText: res.translated_text,
        audio: res.audio,
        audioFormat: res.audio_format || 'wav',
        durationMs: res.duration_ms,
        sttMs: res.stt_ms,
        translateMs: res.translate_ms,
        ttsMs: res.tts_ms,
        modelUsed: res.model_used,
      })
      setPhase('result')

      // Write detected language back to selector so swap works after auto-detect
      if (!sourceLang && res.detected_language) {
        onSourceChange(res.detected_language)
      }

      // Auto-title session with first 50 chars of original text
      if (autoSessionRef.current === activeSessionId && activeSessionId) {
        autoSessionRef.current = null
        const title = res.original_text.slice(0, 50)
        updateSession(activeSessionId, { title }).catch((e) => console.warn('updateSession title failed', e))
      }

      if (activeSessionId) {
        onMessageAppend({
          id: crypto.randomUUID(),
          session_id: activeSessionId,
          direction: 'source',
          original_text: res.original_text,
          translated_text: res.translated_text,
          original_lang: res.detected_language,
          translated_lang: targetLang,
          audio_path: ttsEnabled ? 'pending' : null,
          stt_ms: res.stt_ms,
          translate_ms: res.translate_ms,
          tts_ms: res.tts_ms,
          model_used: null,
          created_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('No speech detected')) {
        setPhase('idle')
        setStatusMessage('No speech detected — try again')
        setTimeout(() => setStatusMessage(''), 3000)
        lastBlob.current = null
        return
      }
      setError(msg || 'Unknown error')
      setPhase('error')
    }
  }

  const handleRetry = () => {
    if (lastBlob.current) handleProcess(lastBlob.current)
  }

  const handleReset = () => {
    setAutoStart(true)
    setPhase('idle')
    setResult(null)
    setError(null)
    lastBlob.current = null
  }

  const handleRecordingStart = () => {
    setAutoStart(false)
    setResult(null)
    setError(null)
    setPhase('idle')
    if (translateProvider === 'local') {
      warmupGpu('ollama', ollamaUrl || undefined, ollamaKeepAlive || undefined).catch(() => {})
    }
  }

  return {
    phase,
    result,
    error,
    statusMessage,
    autoStart,
    spaceToggle,
    handleProcess,
    handleRetry,
    handleReset,
    handleRecordingStart,
    handleRecordingChange,
    handleSpaceToggle,
  }
}
