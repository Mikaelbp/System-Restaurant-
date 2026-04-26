import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Mesas', path: '/tables' },
  { label: 'Pedidos', path: '/orders' },
  { label: 'Produtos', path: '/products' },
  { label: 'Estoque', path: '/stock' },
  { label: 'Caixa', path: '/cashier' },
  { label: 'Relatórios', path: '/reports' },
]

const AppLayout = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Restaurante</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Painel administrativo</p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                title={`Alternar para ${theme === 'light' ? 'modo escuro' : 'modo claro'}`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <nav className="space-y-1 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-200 dark:border-slate-700 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Usuário</p>
            <p className="mt-2 font-medium text-slate-900 dark:text-slate-100">{user?.email ?? 'Convidado'}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Bem-vindo de volta</p>
              <h2 className="text-3xl font-semibold text-slate-900">Sistema de Restaurante</h2>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
