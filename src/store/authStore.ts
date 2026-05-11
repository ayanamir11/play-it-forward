import { create } from 'zustand'
import { api, TOKEN_KEY } from '@/lib/api'

interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  balance: string
  selectedCause: string | null
}

interface RegisterData {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: string
  selectedCause?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isHydrated: boolean

  initializeAuth: () => Promise<void>
  fetchUser: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  initializeAuth: async () => {
    if (get().isHydrated) return
    const stored = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (stored) {
      set({ token: stored })
      await get().fetchUser()
    }
    set({ isHydrated: true })
  },

  fetchUser: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/api/auth/me')
      if (res.ok) {
        const { user } = await res.json()
        set({ user })
      } else {
        set({ user: null, token: null })
        if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY)
      }
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (username, password) => {
    set({ isLoading: true })
    try {
      const res = await api.post('/api/auth/login', { username, password })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Login failed')
      if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, data.token)
      set({ token: data.token, user: data.user })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (data) => {
    set({ isLoading: true })
    try {
      const res = await api.post('/api/auth/register', data)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Registration failed')
      if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, body.token)
      set({ token: body.token, user: body.user })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      window.location.replace('/login')
    }
    set({ user: null, token: null, isHydrated: false })
  },
}))
