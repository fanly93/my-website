import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/apiFetch'

export interface LLMConfig {
  provider: string
  api_key_hint: string
  base_url: string
  model: string
  custom_models: string[]
}

interface Props {
  current: LLMConfig | null
  onSave: (config: LLMConfig) => void
  onClose: () => void
}

const PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek', defaultBase: 'https://api.deepseek.com/v1' },
  { value: 'dashscope', label: 'DashScope (阿里云)', defaultBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { value: 'openai', label: 'OpenAI', defaultBase: 'https://api.openai.com/v1' },
]

const PRESET_MODELS: Record<string, string[]> = {
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  dashscope: ['qwen-plus', 'qwen-max', 'qwen3-235b-a22b'],
  openai: ['gpt-4.1', 'gpt-4o', 'o4-mini'],
}

const NEW_CUSTOM = '__new_custom__'

function resolveModelSelect(model: string, provider: string, customModels: string[] = []): string {
  if ((PRESET_MODELS[provider] ?? []).includes(model)) return model
  if (customModels.includes(model)) return model
  return NEW_CUSTOM
}

export function LLMConfigModal({ current, onSave, onClose }: Props) {
  // Pre-seed with current so hint shows immediately, then merge full list from API
  const [savedConfigs, setSavedConfigs] = useState<Record<string, LLMConfig>>(() =>
    current ? { [current.provider]: current } : {}
  )
  const [provider, setProvider] = useState(current?.provider ?? 'deepseek')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState(() => {
    if (current) return current.base_url
    return PROVIDERS[0].defaultBase
  })
  const [modelSelect, setModelSelect] = useState<string>(() => {
    if (!current) return PRESET_MODELS['deepseek'][0]
    return resolveModelSelect(current.model, current.provider, current.custom_models)
  })
  const [newCustomModel, setNewCustomModel] = useState<string>(() => {
    if (!current) return ''
    const presets = PRESET_MODELS[current.provider] ?? []
    const isInCustomList = current.custom_models?.includes(current.model)
    return !presets.includes(current.model) && !isInCustomList ? current.model : ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load all saved provider configs for pre-fill (merge over initial seed)
  useEffect(() => {
    apiFetch('/users/me/llm-configs')
      .then((res) => (res.ok ? res.json() : []))
      .then((configs: LLMConfig[]) => {
        setSavedConfigs((prev) => {
          const map = { ...prev }
          for (const c of configs) map[c.provider] = c
          return map
        })
      })
      .catch(() => {})
  }, [])

  function handleProviderChange(p: string) {
    setProvider(p)
    setApiKey('')
    const saved = savedConfigs[p]
    if (saved) {
      setBaseUrl(saved.base_url)
      const ms = resolveModelSelect(saved.model, p, saved.custom_models)
      setModelSelect(ms)
      setNewCustomModel(ms === NEW_CUSTOM ? saved.model : '')
    } else {
      const providerInfo = PROVIDERS.find((x) => x.value === p)
      setBaseUrl(providerInfo?.defaultBase ?? '')
      const presets = PRESET_MODELS[p] ?? []
      setModelSelect(presets[0] ?? NEW_CUSTOM)
      setNewCustomModel('')
    }
  }

  const savedForProvider = savedConfigs[provider] ?? null
  const presets = PRESET_MODELS[provider] ?? []
  // Include the currently-active model in the list even if `custom_models` hasn't been backfilled yet
  const savedCustomModels = (() => {
    const list = savedForProvider?.custom_models ?? []
    const active = savedForProvider?.model ?? ''
    if (active && !presets.includes(active) && !list.includes(active)) {
      return [active, ...list]
    }
    return list
  })()
  const effectiveModel = modelSelect === NEW_CUSTOM ? newCustomModel.trim() : modelSelect

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim() && !savedForProvider) { setError('首次配置请填写 API Key'); return }
    if (!effectiveModel) { setError('请选择或输入模型名称'); return }
    setError('')
    setSaving(true)
    try {
      const body: Record<string, string> = { provider, model: effectiveModel }
      if (apiKey.trim()) body.api_key = apiKey.trim()
      if (baseUrl.trim()) body.base_url = baseUrl.trim()
      const res = await apiFetch('/users/me/llm-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.detail ?? '保存失败，请重试')
        return
      }
      const saved: LLMConfig = await res.json()
      onSave(saved)
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">LLM 配置</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Provider */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              API Key
              {savedForProvider && (
                <span className="ml-2 text-xs text-gray-400">（已保存：{savedForProvider.api_key_hint}，重新输入以更新）</span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入 API Key"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* Base URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Base URL <span className="text-xs text-gray-400">（可选，留空使用默认值）</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Model */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">模型</label>
            <select
              value={modelSelect}
              onChange={(e) => { setModelSelect(e.target.value); if (e.target.value !== NEW_CUSTOM) setNewCustomModel('') }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {presets.length > 0 && (
                <optgroup label="预设模型">
                  {presets.map((m) => <option key={m} value={m}>{m}</option>)}
                </optgroup>
              )}
              {savedCustomModels.length > 0 && (
                <optgroup label="已保存自定义">
                  {savedCustomModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </optgroup>
              )}
              <option value={NEW_CUSTOM}>＋ 新增自定义模型…</option>
            </select>
            {modelSelect === NEW_CUSTOM && (
              <input
                type="text"
                value={newCustomModel}
                onChange={(e) => setNewCustomModel(e.target.value)}
                placeholder="输入模型名称，如 qwen3.5-plus"
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                autoFocus
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
