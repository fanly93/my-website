import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { apiFetch } from '../utils/apiFetch'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

interface Profile {
  id: string
  email: string
  username: string
  avatar_url: string | null
  level: number
  streak_days: number
  created_at: string
}

const INPUT_CLS =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'

export function ProfilePage() {
  const { refreshUser } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadError, setLoadError] = useState('')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiFetch('/users/me')
      .then(r => {
        if (!r.ok) throw new Error('加载失败')
        return r.json()
      })
      .then((data: Profile) => {
        setProfile(data)
        setUsername(data.username)
      })
      .catch(err => setLoadError(err.message))
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ username }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? '保存失败')
      }
      const updated: Profile = await res.json()
      setProfile(updated)
      setUsername(updated.username)
      setSaveMsg('保存成功')
      await refreshUser()
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setSaveMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const at = localStorage.getItem('access_token')
      const res = await fetch(`${API_BASE}/users/me/avatar`, {
        method: 'POST',
        headers: at ? { Authorization: `Bearer ${at}` } : {},
        body: form,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? '上传失败')
      }
      const updated: Profile = await res.json()
      setProfile(updated)
      setSaveMsg('头像已更新')
      await refreshUser()
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="rounded-lg bg-red-500/10 px-6 py-4 text-red-400">{loadError}</div>
      </div>
    )
  }

  if (!profile) {
    return <div className="flex items-center justify-center p-8 text-gray-400">加载中…</div>
  }

  const avatarSrc =
    profile.avatar_url
      ? profile.avatar_url.startsWith('/uploads/')
        ? `${API_BASE}${profile.avatar_url}`
        : profile.avatar_url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=6366f1&color=fff`

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回 Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">个人资料</h1>

      {/* Avatar & stats */}
      <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="relative flex-shrink-0">
          <img
            src={avatarSrc}
            alt={profile.username}
            loading="lazy"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-500/30"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition hover:bg-indigo-500 disabled:opacity-50"
            title="更换头像"
          >
            {uploading ? (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile.username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
          <div className="mt-1 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Lv.{profile.level}</span>
            <span>连续 {profile.streak_days} 天</span>
          </div>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">点击头像右下角图标上传本地图片</p>
        </div>
      </div>

      {/* Edit form */}
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 className="font-semibold text-gray-900 dark:text-white">修改用户名</h2>
        <div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">用户名</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className={INPUT_CLS}
          />
        </div>
        {saveMsg && (
          <p className={`text-sm ${saveMsg.includes('成功') || saveMsg.includes('更新') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {saveMsg}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存'}
        </button>
      </form>
    </div>
  )
}
