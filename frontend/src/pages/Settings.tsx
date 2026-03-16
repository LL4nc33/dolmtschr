import { useEffect, useState } from 'react'
import { Card, Divider, Select } from '@oidanice/ink-ui'
import { getConfig } from '../api/dolmtschr'
import { useProviderHealth } from '../hooks/useProviderHealth'
import { SettingsNav } from '../components/settings/SettingsNav'
import { ProviderStatusGrid } from '../components/settings/ProviderStatusGrid'
import { GpuMonitor } from '../components/settings/GpuMonitor'
import { CloudUsage } from '../components/settings/CloudUsage'
import { BenchmarkWidget } from '../components/settings/BenchmarkWidget'
import { PiperConfig } from '../components/settings/PiperConfig'
import { ChatterboxConfig } from '../components/settings/ChatterboxConfig'
import { OllamaConfig } from '../components/settings/OllamaConfig'
import { ElevenLabsConfig } from '../components/settings/ElevenLabsConfig'
import { DeepLConfig } from '../components/settings/DeepLConfig'
import { OpenAIConfig } from '../components/settings/OpenAIConfig'
import { ChainEditor } from '../components/settings/ChainEditor'
import type { AppSettings } from '../hooks/useSettings'

interface SettingsProps {
  settings: AppSettings
  update: (patch: Partial<AppSettings>) => void
}

interface BackendConfig {
  stt_provider: string
  tts_provider: string
  translate_provider: string
  device: string
  whisper_model: string
  piper_voice: string
  ollama_model: string
  chatterbox_url: string
  chatterbox_voice: string
}

export function Settings({ settings, update }: SettingsProps) {
  const [config, setConfig] = useState<BackendConfig | null>(null)
  const [activeSection, setActiveSection] = useState('section-status')
  const health = useProviderHealth(settings.ollamaUrl || undefined, settings.chatterboxUrl || undefined)

  useEffect(() => {
    getConfig().then(setConfig).catch(() => {})
    health.refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setActiveSection(entry.target.id); break }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    )
    for (const id of ['section-status', 'section-local', 'section-cloud', 'section-chain']) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl">Settings</h2>

      <SettingsNav activeSection={activeSection} />

      {/* --- STATUS --- */}
      <div id="section-status" className="space-y-4">
        <ProviderStatusGrid
          providers={health.providers}
          deepLKey={settings.deepLKey}
          elevenlabsKey={settings.elevenlabsKey}
        />
        <GpuMonitor
          gpuStatus={health.gpuStatus}
          loading={health.loading}
          lastUpdated={health.lastUpdated}
          onRefresh={health.refresh}
        />
        <CloudUsage
          deepLKey={settings.deepLKey}
          deepLFree={settings.deepLFree}
          elevenlabsKey={settings.elevenlabsKey}
        />
        <BenchmarkWidget />
      </div>

      {/* --- LOKAL --- */}
      <div id="section-local" className="space-y-4">
        {/* STT (read-only from backend config) */}
        {config && (
          <Card>
            <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>stt (lokal)</h3>
            <dl className="font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <dt>provider</dt>
                <dd>{config.stt_provider}</dd>
              </div>
              <Divider spacing="sm" />
              <div className="flex justify-between">
                <dt>model</dt>
                <dd>{config.whisper_model}</dd>
              </div>
              <Divider spacing="sm" />
              <div className="flex justify-between">
                <dt>device</dt>
                <dd>{config.device}</dd>
              </div>
            </dl>
          </Card>
        )}

        {/* TTS lokal: Chatterbox + Piper */}
        <Card>
          <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>tts (lokal)</h3>
          <div className="space-y-3">
            <Select
              label="TTS Output"
              value={settings.ttsEnabled ? 'on' : 'off'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ ttsEnabled: e.target.value === 'on' })}
            >
              <option value="on">Enabled</option>
              <option value="off">Disabled</option>
            </Select>
            <Select
              label="Auto-Play"
              value={settings.autoPlay ? 'on' : 'off'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ autoPlay: e.target.value === 'on' })}
            >
              <option value="on">Enabled</option>
              <option value="off">Disabled</option>
            </Select>

            {settings.ttsEnabled && (
              <>
                <Divider spacing="sm" />
                <h4 className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <StatusDot status={health.providers?.chatterbox?.status} /> Chatterbox
                </h4>
                <ChatterboxConfig
                  chatterboxVoice={settings.chatterboxVoice}
                  onChatterboxVoiceChange={(v) => update({ chatterboxVoice: v })}
                  chatterboxUrl={settings.chatterboxUrl}
                  onChatterboxUrlChange={(v) => update({ chatterboxUrl: v })}
                  exaggeration={settings.chatterboxExaggeration}
                  onExaggerationChange={(v) => update({ chatterboxExaggeration: v })}
                  cfgWeight={settings.chatterboxCfgWeight}
                  onCfgWeightChange={(v) => update({ chatterboxCfgWeight: v })}
                  temperature={settings.chatterboxTemperature}
                  onTemperatureChange={(v) => update({ chatterboxTemperature: v })}
                />

                <Divider spacing="sm" />
                <h4 className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <StatusDot status={health.providers?.piper?.status} /> Piper
                </h4>
                <PiperConfig
                  piperVoice={settings.piperVoice}
                  onPiperVoiceChange={(v) => update({ piperVoice: v })}
                />
              </>
            )}
          </div>
        </Card>

        {/* Translate lokal: Ollama */}
        <Card>
          <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            <StatusDot status={health.providers?.ollama?.status} /> translate (lokal)
          </h3>
          <OllamaConfig
            ollamaUrl={settings.ollamaUrl}
            onOllamaUrlChange={(v) => update({ ollamaUrl: v })}
            ollamaModel={settings.ollamaModel}
            onOllamaModelChange={(v) => update({ ollamaModel: v })}
            ollamaKeepAlive={settings.ollamaKeepAlive}
            onOllamaKeepAliveChange={(v) => update({ ollamaKeepAlive: v })}
            ollamaContextLength={settings.ollamaContextLength}
            onOllamaContextLengthChange={(v) => update({ ollamaContextLength: v })}
          />
        </Card>
      </div>

      {/* --- CLOUD --- */}
      <div id="section-cloud" className="space-y-4">
        {/* TTS cloud: ElevenLabs */}
        <Card>
          <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>elevenlabs (cloud tts)</h3>
          <ElevenLabsConfig
            elevenlabsKey={settings.elevenlabsKey}
            onElevenlabsKeyChange={(v) => update({ elevenlabsKey: v })}
            elevenlabsModel={settings.elevenlabsModel}
            onElevenlabsModelChange={(v) => update({ elevenlabsModel: v })}
            elevenlabsVoiceId={settings.elevenlabsVoiceId}
            onElevenlabsVoiceIdChange={(v) => update({ elevenlabsVoiceId: v })}
            elevenlabsStability={settings.elevenlabsStability}
            onElevenlabsStabilityChange={(v) => update({ elevenlabsStability: v })}
            elevenlabsSimilarity={settings.elevenlabsSimilarity}
            onElevenlabsSimilarityChange={(v) => update({ elevenlabsSimilarity: v })}
          />
          <PrivacyBadge label="US-Firma, Daten verlassen EU" color="var(--warning, #f59e0b)" />
        </Card>

        {/* Translate cloud: DeepL */}
        <Card>
          <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>deepl (cloud translate)</h3>
          <DeepLConfig
            deepLKey={settings.deepLKey}
            onDeepLKeyChange={(v) => update({ deepLKey: v })}
            deepLFree={settings.deepLFree}
            onDeepLFreeChange={(v) => update({ deepLFree: v })}
          />
        </Card>

        {/* OpenAI compat */}
        <Card>
          <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>openai-compat (cloud translate)</h3>
          <OpenAIConfig
            openaiUrl={settings.openaiUrl}
            onOpenaiUrlChange={(v) => update({ openaiUrl: v })}
            openaiKey={settings.openaiKey}
            onOpenaiKeyChange={(v) => update({ openaiKey: v })}
            openaiModel={settings.openaiModel}
            onOpenaiModelChange={(v) => update({ openaiModel: v })}
          />
        </Card>
      </div>

      {/* --- REIHENFOLGE --- */}
      <div id="section-chain">
        <ChainEditor
          ttsChain={settings.ttsChain}
          onTtsChainChange={(chain) => update({ ttsChain: chain })}
          translateChain={settings.translateChain}
          onTranslateChainChange={(chain) => update({ translateChain: chain })}
        />
      </div>
    </div>
  )
}

function StatusDot({ status }: { status?: string }) {
  const color = status === 'ok'
    ? 'var(--success, #22c55e)'
    : status === 'error'
      ? 'var(--error, #ef4444)'
      : 'var(--text-secondary)'
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: 4,
        verticalAlign: 'middle',
      }}
    />
  )
}

function PrivacyBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="font-mono text-xs"
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        border: `1px solid ${color}`,
        color,
        marginTop: 8,
      }}
    >
      [{label}]
    </span>
  )
}
