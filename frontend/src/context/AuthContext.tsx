import { createContext, useContext } from 'react'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types'

interface AuthContextValue {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, user, login, logout } = useAuthStore()

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
