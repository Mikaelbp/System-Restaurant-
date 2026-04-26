import api from './api'
import type { User } from '../types'

interface LoginResponse {
  token: string
  user: User
}

export const loginRequest = async (email: string, password: string) => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password })
  return response.data
}
