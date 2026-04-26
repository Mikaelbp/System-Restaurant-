import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { updateOrderStatus } from '../services/orderService'
import type { Order } from '../types'

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get<Order[]>('/orders')
      setOrders(response.data)
    } catch (err) {
      setError('Não foi possível carregar os pedidos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // Polling a cada 3 segundos para atualizar pedidos
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      await fetchOrders()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
      case 'preparing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'ready': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
      case 'paid': return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pendente'
      case 'preparing': return 'Preparando'
      case 'ready': return 'Pronto'
      case 'paid': return 'Pago'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Gestão de pedidos</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Pedidos</h1>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
            {orders.length} pedidos carregados
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300 shadow-sm">Carregando pedidos...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-red-700 dark:text-red-400 shadow-sm">{error}</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pedido {order.id.slice(0, 6)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Mesa {order.table?.number ?? order.tableId}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <p>Total: R$ {order.total.toFixed(2)}</p>
                {order.createdAt && <p>Criado em: {new Date(order.createdAt).toLocaleString()}</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                    className="rounded-2xl bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    Iniciar Preparo
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'ready')}
                    className="rounded-2xl bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  >
                    Marcar como Pronto
                  </button>
                )}
                {order.status === 'ready' && (
                  <Link
                    to="/cashier"
                    className="rounded-2xl bg-amber-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-amber-500 dark:bg-amber-700 dark:hover:bg-amber-600"
                  >
                    Ir para Caixa
                  </Link>
                )}
              </div>
            </div>
          ))}
          {!orders.length && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 shadow-sm">
              Nenhum pedido disponível. Adicione pedidos ou carregue novamente.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Orders
