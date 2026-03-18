import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceRecorderState {
  isRecording: boolean
  blob: Blob | null
  audioUrl: string | null
  duration: number
  error: string | null
  stream: MediaStream | null
}

const INITIAL_STATE: VoiceRecorderState = {
  isRecording: false,
  blob: null,
  audioUrl: null,
  duration: 0,
  error: null,
  stream: null,
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>(INITIAL_STATE)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const startingRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const revokeUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
  }, [])

  const start = useCallback(async () => {
    if (startingRef.current) return
    startingRef.current = true
    try {
      revokeUrl()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      startingRef.current = false
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })

      chunks.current = []
      recorder.ondataavailable = (e) => {
        console.log('[Recorder] chunk:', e.data.size, 'bytes')
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        clearTimer()
        console.log('[Recorder] stop: chunks:', chunks.current.length, 'total:', chunks.current.reduce((a, b) => a + b.size, 0), 'bytes')
        const blob = new Blob(chunks.current, { type: recorder.mimeType })
        stream.getTracks().forEach((t) => t.stop())
        const url = URL.createObjectURL(blob)
        audioUrlRef.current = url
        setState((prev) => ({
          ...prev,
          isRecording: false,
          blob,
          audioUrl: url,
          stream: null,
          error: null,
        }))
      }

      recorder.start(250)  // 250ms timeslice for regular data chunks
      mediaRecorder.current = recorder

      setState({ isRecording: true, blob: null, audioUrl: null, duration: 0, error: null, stream })

      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    } catch {
      startingRef.current = false
      setState({ ...INITIAL_STATE, stream: null, error: 'Microphone access denied' })
    }
  }, [clearTimer, revokeUrl])

  const stop = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop()
    }
  }, [])

  const reset = useCallback(() => {
    revokeUrl()
    setState(INITIAL_STATE)
  }, [revokeUrl])

  useEffect(() => {
    return () => {
      clearTimer()
      revokeUrl()
    }
  }, [clearTimer, revokeUrl])

  return { ...state, start, stop, reset }
}
