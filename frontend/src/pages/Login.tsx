import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { token, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { token: authToken, user } = await loginRequest(email.trim(), password)
      login(authToken, user)
      navigate('/')
    } catch (err) {
      setError('Falha ao autenticar. Verifique o email e a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Faça login</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Acesse o painel do restaurante</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-slate-900 dark:focus:border-slate-400"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-slate-900 dark:focus:border-slate-400"
            />
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-500"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
