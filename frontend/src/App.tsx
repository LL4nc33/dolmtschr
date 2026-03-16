import { useState, useEffect, useCallback } from 'react'
import { Layout, DarkModeToggle, InstallPrompt } from '@oidanice/ink-ui'
import { useSettings } from './hooks/useSettings'
import { useSession } from './hooks/useSession'
import { useMessages } from './hooks/useMessages'
import { useLanguages } from './hooks/useLanguages'
import { getMessages, listSessions, deleteSession, SessionResponse } from './api/dolmtschr'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { ChatSidebar } from './components/ChatSidebar'
import { Footer } from './components/Footer'

type Page = 'home' | 'settings'

function getPageFromHash(): Page {
  return window.location.hash === '#settings' ? 'settings' : 'home'
}

export function App() {
  const [page, setPage] = useState<Page>(getPageFromHash)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessions, setSessions] = useState<SessionResponse[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const { settings, update } = useSettings()
  const { session, create: createSession, load: loadSession, clear: clearSession } = useSession()
  const { messages, append: appendMessage, clear: clearMessages } = useMessages()
  const { languages, byContinent, continents } = useLanguages(settings.ttsChain, settings.translateChain)

  const navigate = useCallback((p: Page) => {
    window.location.hash = p === 'home' ? '' : p
    setPage(p)
  }, [])

  useEffect(() => {
    const onHash = () => setPage(getPageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const data = await listSessions(50)
      setSessions(data.sessions)
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSessions()
  }, [refreshSessions])

  const handleNewSession = useCallback(async () => {
    const s = await createSession(
      settings.sourceLang,
      settings.targetLang,
      settings.ttsEnabled,
    )
    if (s) {
      clearMessages()
      await refreshSessions()
      navigate('home')
      setSidebarOpen(false)
    }
  }, [createSession, settings.sourceLang, settings.targetLang, settings.ttsEnabled, clearMessages, refreshSessions, navigate])

  const handleSelectSession = useCallback(async (id: string) => {
    await loadSession(id)
    const data = await getMessages(id)
    clearMessages()
    data.messages.forEach(appendMessage)
    navigate('home')
    setSidebarOpen(false)
  }, [loadSession, clearMessages, appendMessage, navigate])

  const handleDeleteSession = useCallback(async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (session?.id === id) {
      clearSession()
      clearMessages()
    }
    try {
      await deleteSession(id)
    } catch {
      refreshSessions()
    }
  }, [session?.id, clearSession, clearMessages, refreshSessions])

  const handleEndSession = useCallback(() => {
    clearSession()
    clearMessages()
  }, [clearSession, clearMessages])

  const sidebar = (
    <ChatSidebar
      sessions={sessions}
      activeSessionId={session?.id ?? null}
      loading={sessionsLoading}
      onNewSession={handleNewSession}
      onSelectSession={handleSelectSession}
      onDeleteSession={handleDeleteSession}
    />
  )

  return (
    <>
      <Layout
        headerLeft={
          <button
            className="md:hidden border-0 bg-transparent cursor-pointer p-2 font-mono text-base min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: 'var(--text)' }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            [=]
          </button>
        }
        title="dolmtschr"
        headerRight={
          <div className="flex items-center gap-1 md:gap-3">
            <button
              className="border-0 bg-transparent cursor-pointer font-mono text-xs p-1 md:p-2"
              style={{ color: page === 'home' ? 'var(--primary, #3b82f6)' : 'var(--text)', opacity: page === 'home' ? 1 : 0.6 }}
              onClick={() => navigate('home')}
            >
              <span className="hidden md:inline">[ home ]</span>
              <span className="md:hidden">&#9679;</span>
            </button>
            <button
              className="border-0 bg-transparent cursor-pointer font-mono text-xs p-1 md:p-2"
              style={{ color: page === 'settings' ? 'var(--primary, #3b82f6)' : 'var(--text)', opacity: page === 'settings' ? 1 : 0.6 }}
              onClick={() => navigate('settings')}
            >
              <span className="hidden md:inline">[ settings ]</span>
              <span className="md:hidden">&#9881;</span>
            </button>
            <DarkModeToggle />
          </div>
        }
        banner={<InstallPrompt />}
        footer={<Footer />}
        sidebar={sidebar}
        sidebarPosition="left"
        sidebarWidth="w-64"
        sidebarClassName="hidden md:block"
        maxWidth=""
      >
        <div className="max-w-4xl mx-auto">
          {page === 'home' && (
            <Home
              settings={settings}
              languages={languages}
              byContinent={byContinent}
              continents={continents}
              onSourceChange={(lang) => update({ sourceLang: lang })}
              onTargetChange={(lang) => update({ targetLang: lang })}
              sessionId={session?.id ?? null}
              sessionTitle={session?.title ?? null}
              messages={messages}
              onEndSession={handleEndSession}
              onMessageAppend={appendMessage}
              onAutoSession={async (id) => {
                await loadSession(id)
                refreshSessions()
              }}
            />
          )}
          {page === 'settings' && (
            <Settings settings={settings} update={update} />
          )}
        </div>
      </Layout>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="absolute inset-y-0 left-0 w-72 overflow-y-auto"
            style={{ backgroundColor: 'var(--bg)', borderRight: '1px solid var(--border)' }}
          >
            {sidebar}
          </div>
        </div>
      )}
    </>
  )
}
