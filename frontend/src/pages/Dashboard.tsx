import { useEffect, useState } from 'react'
import api from '../services/api'
import type { Order, Product, Table } from '../types'

const Dashboard = () => {
  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        const [tablesResponse, ordersResponse, productsResponse] = await Promise.all([
          api.get<Table[]>('/tables'),
          api.get<Order[]>('/orders'),
          api.get<Product[]>('/products'),
        ])

        setTables(tablesResponse.data)
        setOrders(ordersResponse.data)
        setProducts(productsResponse.data)
      } catch (err) {
        setError('Não foi possível carregar os dados do dashboard.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const occupiedTables = tables.filter((table) => table.isOccupied).length
  const totalOrders = orders.length
  const totalProducts = products.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Visão geral</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Acompanhe os principais indicadores do restaurante.</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300 shadow-sm">Carregando dados...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-red-700 dark:text-red-400 shadow-sm">{error}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Mesas ocupadas</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-slate-100">{occupiedTables}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pedidos ativos</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-slate-100">{totalOrders}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Produtos</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-slate-100">{totalProducts}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Faturamento total</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900 dark:text-slate-100">R$ {totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Últimas mesas</h2>
          <div className="mt-4 space-y-3">
            {tables.slice(0, 4).map((table) => (
              <div key={table.id} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Mesa {table.number}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{table.isOccupied ? 'Ocupada' : 'Livre'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  table.isOccupied
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                }`}>
                  {table.isOccupied ? 'Em uso' : 'Disponível'}
                </span>
              </div>
            ))}
            {!tables.length && <p className="text-sm text-slate-600 dark:text-slate-400">Nenhuma mesa cadastrada.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pedidos recentes</h2>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-4">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Pedido {order.id.slice(0, 6)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Mesa {order.table?.number ?? order.tableId}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Total: R$ {order.total.toFixed(2)}</p>
              </div>
            ))}
            {!orders.length && <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum pedido disponível.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
