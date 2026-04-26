import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

const getStoredUser = (): User | null => {
  const storedValue = localStorage.getItem('user')
  if (!storedValue) return null

  try {
    return JSON.parse(storedValue) as User
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: getStoredUser(),
  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },
}))
