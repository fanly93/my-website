import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChatInput } from '../components/chat/ChatInput'
import { ChatSessionSidebar } from '../components/chat/ChatSessionSidebar'
import { type LLMConfig, LLMConfigModal } from '../components/chat/LLMConfigModal'
import { type Message, MessageList } from '../components/chat/MessageList'
import { apiFetch } from '../utils/apiFetch'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

interface Session {
  id: string
  title: string
  created_at: string
}

export function AIChatPage() {
  const location = useLocation()
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')

  // LLM config state
  const [llmConfig, setLLMConfig] = useState<LLMConfig | null | undefined>(undefined) // undefined = loading
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── LLM config bootstrap ──────────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/users/me/llm-config').then(async (res) => {
      if (res.ok) {
        setLLMConfig(await res.json())
      } else {
        setLLMConfig(null) // 404 = not configured
      }
    }).catch(() => setLLMConfig(null))
  }, [])

  function handleConfigSaved(cfg: LLMConfig) {
    setLLMConfig(cfg)
    setShowConfigModal(false)
    showToast('配置已保存')
  }

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  // ── session bootstrap ────────────────────────────────────────────────────
  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    try {
      const res = await apiFetch('/chat/sessions')
      if (!res.ok) return
      const data: Session[] = await res.json()
      setSessions(data)
      const targetId = (location.state as { sessionId?: string } | null)?.sessionId
      const target = targetId ? data.find(s => s.id === targetId) : null
      if (target) {
        await selectSession(target)
      } else if (data.length > 0) {
        await selectSession(data[0])
      } else {
        await createSession()
      }
    } catch {
      setError('加载会话失败')
    }
  }

  async function createSession() {
    if (activeSession && messages.length === 0) return
    try {
      const res = await apiFetch('/chat/sessions', { method: 'POST' })
      if (!res.ok) return
      const session: Session = await res.json()
      setSessions((prev) => [session, ...prev])
      setActiveSession(session)
      setMessages([])
    } catch {
      setError('创建会话失败')
    }
  }

  async function selectSession(session: Session) {
    setActiveSession(session)
    setError('')
    try {
      const res = await apiFetch(`/chat/sessions/${session.id}/messages`)
      if (!res.ok) return
      const data = await res.json()
      setMessages(
        data.map((m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      )
    } catch {
      setError('加载消息失败')
    }
  }

  async function handleDeleteSession(sessionId: string) {
    await apiFetch(`/chat/sessions/${sessionId}`, { method: 'DELETE' })
    const next = sessions.filter((s) => s.id !== sessionId)
    setSessions(next)
    if (activeSession?.id === sessionId) {
      if (next.length > 0) {
        await selectSession(next[0])
      } else {
        await createSession()
      }
    }
  }

  // ── send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (content: string) => {
      if (!activeSession || streaming) return
      setError('')

      const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content }
      const aiMsgId = `ai-${Date.now()}`
      const aiMsg: Message = { id: aiMsgId, role: 'assistant', content: '', streaming: true }

      setMessages((prev) => [...prev, userMsg, aiMsg])
      setStreaming(true)

      try {
        const at = localStorage.getItem('access_token')
        const res = await fetch(
          `${API_BASE}/chat/sessions/${activeSession.id}/messages/stream`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(at ? { Authorization: `Bearer ${at}` } : {}),
            },
            body: JSON.stringify({ content }),
          }
        )

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.detail ?? '请求失败')
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6)
            if (payload === '[DONE]') {
              const sesRes = await apiFetch('/chat/sessions')
              if (sesRes.ok) setSessions(await sesRes.json())
              break
            }
            if (payload.startsWith('[ERROR]')) {
              setError(payload.slice(7).trim() || 'AI 回复出错')
              break
            }
            try {
              const token: string = JSON.parse(payload)
              setMessages((prev) =>
                prev.map((m) => m.id === aiMsgId ? { ...m, content: m.content + token } : m)
              )
            } catch { /* skip malformed token */ }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送失败')
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId))
      } finally {
        setStreaming(false)
        setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, streaming: false } : m))
      }
    },
    [activeSession, streaming]
  )

  const chatDisabled = streaming || llmConfig === null

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      <ChatSessionSidebar
        sessions={sessions}
        activeId={activeSession?.id ?? null}
        onSelect={(id) => { const s = sessions.find((x) => x.id === id); if (s) selectSession(s) }}
        onNew={createSession}
        onDelete={handleDeleteSession}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-12 items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-700">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Dashboard
          </Link>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
            {activeSession?.title ?? 'AI 学习助手'}
          </span>
          {/* Settings button */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            title="配置 LLM"
            className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {/* Provider badge */}
          {llmConfig && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {llmConfig.model}
            </span>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Unconfigured banner */}
        {llmConfig === null && (
          <div className="mx-4 mt-2 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-900/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-amber-500">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-amber-700 dark:text-amber-400">
              请先配置 API Key 后开始对话
            </span>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="ml-auto rounded-lg bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-200 dark:bg-amber-800/40 dark:text-amber-300 dark:hover:bg-amber-800/60"
            >
              立即配置
            </button>
          </div>
        )}

        <MessageList messages={messages} loading={streaming && messages.length === 0} />
        <ChatInput onSend={handleSend} disabled={chatDisabled} />
      </div>

      {/* LLM Config Modal */}
      {showConfigModal && (
        <LLMConfigModal
          current={llmConfig ?? null}
          onSave={handleConfigSaved}
          onClose={() => setShowConfigModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-gray-700">
          {toast}
        </div>
      )}
    </div>
  )
}
