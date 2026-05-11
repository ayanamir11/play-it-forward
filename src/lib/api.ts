export const TOKEN_KEY = 'pif_token'

async function request(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    window.location.replace('/login')
  }

  return res
}

export const api = {
  get:   (url: string)                 => request(url),
  post:  (url: string, body?: unknown) => request(url, { method: 'POST',  body: JSON.stringify(body) }),
  patch: (url: string, body?: unknown) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
}
