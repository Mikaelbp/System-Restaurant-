import { useEffect, useState } from 'react'
import api from '../services/api'
import { updateOrderStatus } from '../services/orderService'
import type { Order } from '../types'

interface PaymentSplit {
  method: 'cash' | 'card' | 'pix'
  amount: number
}

const Cashier = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([])
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash')
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState('')
  const [change, setChange] = useState(0)

  useEffect(() => {
    fetchOrders()
    // Polling a cada 3 segundos para atualizar pedidos
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get<Order[]>('/orders')
      // Filtra pedidos ainda não pagos para o caixa
      const cashierOrders = response.data.filter(order => {
        const status = (order.status || '').toLowerCase()
        return status === 'pending' || status === 'preparing' || status === 'ready'
      })
      setOrders(cashierOrders)
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError('Não foi possível carregar os pedidos.')
    } finally {
      setLoading(false)
    }
  }

  const getTotalPaid = () => {
    return paymentSplits.reduce((sum, payment) => sum + payment.amount, 0)
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente'
      case 'preparing':
        return 'Preparando'
      case 'ready':
        return 'Pronto'
      case 'paid':
        return 'Pago'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
      case 'preparing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'ready':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
      case 'paid':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
    }
  }

  const handlePayment = async (order: Order) => {
    const totalPaid = getTotalPaid()
    if (totalPaid < order.total) {
      setError('O valor total pago é menor que o valor do pedido.')
      return
    }

    try {
      setLoading(true)
      await updateOrderStatus(order.id, 'paid')
      // Liberar a mesa
      if (order.table) {
        await api.put(`/tables/${order.table.id}`, { isOccupied: false })
      }
      // Aguarda um pouco para sincronizar
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchOrders()
      resetPayment()
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao processar pagamento')
      setLoading(false)
    }
  }

  const resetPayment = () => {
    setSelectedOrder(null)
    setPaymentSplits([])
    setCurrentPaymentAmount('')
    setChange(0)
  }

  const addPaymentSplit = () => {
    const amount = parseFloat(currentPaymentAmount)
    if (!amount || amount <= 0) return

    setPaymentSplits(prev => [...prev, { method: currentPaymentMethod, amount }])
    setCurrentPaymentAmount('')
    calculateChange()
  }

  const removePaymentSplit = (index: number) => {
    setPaymentSplits(prev => prev.filter((_, i) => i !== index))
    calculateChange()
  }

  const calculateChange = () => {
    if (!selectedOrder) return
    const totalPaid = paymentSplits.reduce((sum, payment) => sum + payment.amount, 0)
    const currentAmount = parseFloat(currentPaymentAmount) || 0
    const totalReceived = totalPaid + currentAmount
    setChange(Math.max(0, totalReceived - selectedOrder.total))
  }

  const getRemainingAmount = () => {
    if (!selectedOrder) return 0
    return Math.max(0, selectedOrder.total - getTotalPaid())
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Caixa</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Pedidos para Pagamento</h1>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
            {orders.length} pedidos em aberto
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
              Carregando pedidos...
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`rounded-3xl border p-6 shadow-sm cursor-pointer transition ${
                    selectedOrder?.id === order.id
                      ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Mesa {order.table?.number}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.items?.length} itens • {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'Data desconhecida'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        R$ {order.total.toFixed(2)}
                      </p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status ?? '')}`}>
                        {getStatusLabel(order.status ?? '')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-slate-600">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!orders.length && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                  Nenhum pedido em aberto para pagamento.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedOrder ? (
            <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Pagamento - Mesa {selectedOrder.table?.number}
              </h2>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-700 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Total a pagar:</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      R$ {selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total pago:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      R$ {getTotalPaid().toFixed(2)}
                    </span>
                  </div>
                  {getRemainingAmount() > 0 && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                      <span className="font-semibold text-slate-900">Restante:</span>
                      <span className="text-lg font-bold text-amber-600">
                        R$ {getRemainingAmount().toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Formas de pagamento já adicionadas */}
                {paymentSplits.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pagamentos adicionados:</h3>
                    {paymentSplits.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            {payment.method === 'cash' ? 'Dinheiro' :
                             payment.method === 'card' ? 'Cartão' : 'PIX'}
                          </span>
                          <span className="text-sm text-emerald-600 dark:text-emerald-400">
                            R$ {payment.amount.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => removePaymentSplit(index)}
                          className="text-red-500 hover:text-red-700 text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Adicionar nova forma de pagamento */}
                {getRemainingAmount() > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Adicionar pagamento:</h3>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Método de pagamento
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'cash', label: 'Dinheiro' },
                          { value: 'card', label: 'Cartão' },
                          { value: 'pix', label: 'PIX' }
                        ].map((method) => (
                          <button
                            key={method.value}
                            onClick={() => setCurrentPaymentMethod(method.value as any)}
                            className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                              currentPaymentMethod === method.value
                                ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                            }`}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Valor
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentPaymentAmount}
                        onChange={(e) => {
                          setCurrentPaymentAmount(e.target.value)
                          calculateChange()
                        }}
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-slate-500 dark:focus:border-slate-400 focus:outline-none"
                        placeholder={`Máx. R$ ${getRemainingAmount().toFixed(2)}`}
                      />
                    </div>

                    <button
                      onClick={addPaymentSplit}
                      disabled={!currentPaymentAmount || parseFloat(currentPaymentAmount) <= 0}
                      className="w-full rounded-2xl bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 dark:hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-500"
                    >
                      Adicionar Pagamento
                    </button>
                  </div>
                )}

                {change > 0 && (
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">Troco:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">R$ {change.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handlePayment(selectedOrder)}
                  disabled={getTotalPaid() < selectedOrder.total}
                  className="w-full rounded-2xl bg-emerald-600 dark:bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 dark:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-500"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-6 text-slate-600 dark:text-slate-400">
              Selecione um pedido para processar o pagamento.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cashier