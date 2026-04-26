import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { createOrder } from '../services/orderService'
import type { Product } from '../types'

interface CartItem {
  product: Product
  quantity: number
}

const Menu = () => {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get<Product[]>('/products')
        setProducts(response.data)
      } catch (err) {
        setError('Não foi possível carregar o cardápio.')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const handleSubmitOrder = async () => {
    if (!tableId || cart.length === 0) return

    setSubmitting(true)
    try {
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))

      await createOrder(tableId, orderItems)
      setCart([])
      navigate('/orders')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Cardápio</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Cardápio - Mesa {tableId}
            </h1>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
            {products.length} itens
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-red-700 dark:text-red-400 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300 shadow-sm">
              Carregando cardápio...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{product.category?.name ?? 'Sem categoria'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{product.description ?? 'Sem descrição disponível'}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Adicionar ao pedido
                  </button>
                </div>
              ))}
              {!products.length && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 p-6 text-slate-600 dark:text-slate-400 shadow-sm">
                  Nenhum item encontrado no cardápio.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pedido Atual</h2>
            <div className="mt-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum item no pedido</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{item.product.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">R$ {item.product.price.toFixed(2)} cada</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="rounded-full bg-slate-200 dark:bg-slate-600 px-2 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="rounded-full bg-slate-200 dark:bg-slate-600 px-2 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-2 rounded-full bg-red-100 dark:bg-red-900 px-2 py-1 text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="mt-6 border-t border-slate-200 dark:border-slate-600 pt-4">
                <div className="flex items-center justify-between text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <span>Total:</span>
                  <span>R$ {getTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-500"
                >
                  {submitting ? 'Criando pedido...' : 'Fazer pedido'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Menu
