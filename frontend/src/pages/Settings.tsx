import { useEffect, useState } from 'react'
import { Card, Divider, Select, FilterChip } from '@oidanice/ink-ui'
import { getConfig } from '../api/dolmtschr'
import { useProviderHealth } from '../hooks/useProviderHealth'
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

type ProviderTab = 'stt' | 'translate' | 'tts'

const TABS: { id: ProviderTab; label: string }[] = [
  { id: 'stt', label: 'STT' },
  { id: 'translate', label: 'Translate' },
  { id: 'tts', label: 'TTS' },
]

export function Settings({ settings, update }: SettingsProps) {
  const [config, setConfig] = useState<BackendConfig | null>(null)
  const [activeTab, setActiveTab] = useState<ProviderTab>('stt')
  const health = useProviderHealth(settings.ollamaUrl || undefined, settings.chatterboxUrl || undefined)

  useEffect(() => {
    getConfig().then(setConfig).catch((e) => console.warn('getConfig failed', e))
    health.refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl">Settings</h2>

      {/* ── Dashboard ── */}
      <ProviderStatusGrid
        providers={health.providers}
        deepLKey={settings.deepLKey}
        elevenlabsKey={settings.elevenlabsKey}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <ChainEditor
        ttsChain={settings.ttsChain}
        onTtsChainChange={(chain) => update({ ttsChain: chain })}
        translateChain={settings.translateChain}
        onTranslateChainChange={(chain) => update({ translateChain: chain })}
      />

      <BenchmarkWidget />

      {/* ── Provider Tabs ── */}
      <Divider spacing="md" />

      <div className="sticky top-0 z-30 flex gap-2 py-2 -mx-3 px-3 md:-mx-0 md:px-0" style={{ backgroundColor: 'var(--bg)' }}>
        {TABS.map((t) => (
          <FilterChip
            key={t.id}
            active={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </FilterChip>
        ))}
      </div>

      {/* ── STT Tab ── */}
      {activeTab === 'stt' && (
        <div className="space-y-4">
          {config ? (
            <Card>
              <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                <StatusDot status={health.providers?.whisper?.status} /> whisper (lokal)
              </h3>
              <dl className="font-mono text-xs space-y-1">
                <div className="flex justify-between"><dt>provider</dt><dd>{config.stt_provider}</dd></div>
                <Divider spacing="sm" />
                <div className="flex justify-between"><dt>model</dt><dd>{config.whisper_model}</dd></div>
                <Divider spacing="sm" />
                <div className="flex justify-between"><dt>device</dt><dd>{config.device}</dd></div>
              </dl>
            </Card>
          ) : (
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>loading config...</p>
          )}
        </div>
      )}

      {/* ── Translate Tab ── */}
      {activeTab === 'translate' && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              <StatusDot status={health.providers?.ollama?.status} /> local ai
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

          <Card>
            <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>deepl (cloud)</h3>
            <DeepLConfig
              deepLKey={settings.deepLKey}
              onDeepLKeyChange={(v) => update({ deepLKey: v })}
              deepLFree={settings.deepLFree}
              onDeepLFreeChange={(v) => update({ deepLFree: v })}
            />
          </Card>

          <Card>
            <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>openai-compat (cloud)</h3>
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
      )}

      {/* ── TTS Tab ── */}
      {activeTab === 'tts' && (
        <div className="space-y-4">
          <Card>
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
            </div>
          </Card>

          {settings.ttsEnabled && (
            <>
              <Card>
                <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <StatusDot status={health.providers?.chatterbox?.status} /> chatterbox (lokal)
                </h3>
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
              </Card>

              <Card>
                <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <StatusDot status={health.providers?.piper?.status} /> piper (lokal)
                </h3>
                <PiperConfig
                  piperVoice={settings.piperVoice}
                  onPiperVoiceChange={(v) => update({ piperVoice: v })}
                />
              </Card>

              <Card>
                <h3 className="font-mono text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>elevenlabs (cloud)</h3>
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
            </>
          )}
        </div>
      )}
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
