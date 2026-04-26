import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import type { Table } from '../types'

const Tables = () => {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get<Table[]>('/tables')
        setTables(response.data)
      } catch (err) {
        setError('Não foi possível carregar as mesas.')
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Gestão de mesas</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Mesas</h1>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
            {tables.length} mesas cadastradas
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300 shadow-sm">Carregando mesas...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-red-700 dark:text-red-400 shadow-sm">{error}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tables.map((table) => (
            <div key={table.id} className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mesa {table.number}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{table.orders?.length ?? 0} pedidos abertos</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    table.isOccupied ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  }`}>
                  {table.isOccupied ? 'Ocupada' : 'Livre'}
                </span>
              </div>
              <Link
                to={`/menu/${table.id}`}
                className="mt-4 inline-block w-full rounded-2xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Fazer pedido
              </Link>
            </div>
          ))}
          {!tables.length && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 p-6 text-slate-600 dark:text-slate-400 shadow-sm">
              Nenhuma mesa encontrada. Crie mesas no backend ou verifique os dados.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Tables
