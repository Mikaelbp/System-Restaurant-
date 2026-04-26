import { useEffect, useState } from 'react'
import api from '../services/api'
import type { Order } from '../types'

const Reports = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get<Order[]>('/orders')
        setOrders(response.data)
      } catch (err) {
        setError('N�o foi poss�vel carregar os relat�rios.')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0)
  const averageOrder = orders.length ? totalRevenue / orders.length : 0
  const statusCounts = orders.reduce((acc, order) => {
    const status = order.status ?? 'Pendente'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Relatórios</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Relatórios</h1>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
            {orders.length} pedidos analisados
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300 shadow-sm">Carregando relatórios...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-red-700 dark:text-red-400 shadow-sm">{error}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Faturamento total</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">R$ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pedido médio</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">R$ {averageOrder.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pedidos totais</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{orders.length}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Status dos pedidos</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="rounded-3xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-4 text-sm text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{status}</p>
                <p className="mt-2 text-2xl font-semibold">{count}</p>
              </div>
            ))}
            {!Object.keys(statusCounts).length && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-4 text-sm text-slate-600 dark:text-slate-400">Sem pedidos para analisar.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
