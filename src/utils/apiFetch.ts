const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

async function refreshTokens(): Promise<string | null> {
  const rt = localStorage.getItem('refresh_token')
  if (!rt) return null
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  })
  if (!res.ok) return null
  const data = await res.json()
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { accessToken: data.access_token } }))
  return data.access_token
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const at = localStorage.getItem('access_token')
  const headers = new Headers(init.headers)
  if (at) headers.set('Authorization', `Bearer ${at}`)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  let res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    const newAt = await refreshTokens()
    if (!newAt) {
      // Force redirect to login; React will re-render via AuthContext listener
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.hash = '/login'
      return res
    }
    headers.set('Authorization', `Bearer ${newAt}`)
    res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  }

  return res
}
