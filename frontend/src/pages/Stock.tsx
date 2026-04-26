import { useEffect, useState } from 'react'
import api from '../services/api'
import type { Product } from '../types'

const Stock = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get<Product[]>('/products')
      setProducts(response.data)
    } catch (err) {
      setError('Não foi possível carregar o estoque.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async (productId: string) => {
    const quantityStr = quantityInputs[productId]
    if (!quantityStr || parseFloat(quantityStr) <= 0) {
      setError('Digite uma quantidade válida')
      return
    }

    const quantity = parseInt(quantityStr, 10)
    setUpdatingId(productId)

    try {
      await api.put(`/products/${productId}/stock`, { quantity })
      await fetchStock()
      setQuantityInputs(prev => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar estoque')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Inventário</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Estoque</h1>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
            {products.length} produtos
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-6 text-slate-700 dark:text-slate-300 shadow-sm">Carregando estoque...</div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-red-700 dark:text-red-400 shadow-sm">{error}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
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
              <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
                <p>Estoque: <span className="font-semibold text-slate-900 dark:text-slate-100">{product.stock?.quantity ?? 0}</span></p>
                <p>{product.description ?? 'Sem descrição'}</p>
              </div>
              
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantityInputs[product.id] ?? ''}
                  onChange={(e) => setQuantityInputs(prev => ({ ...prev, [product.id]: e.target.value }))}
                  placeholder="Quantidade a adicionar"
                  className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-500 dark:focus:border-slate-400 focus:outline-none"
                />
                <button
                  onClick={() => handleAddStock(product.id)}
                  disabled={updatingId === product.id || !quantityInputs[product.id]}
                  className="rounded-2xl bg-emerald-600 dark:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 dark:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-500"
                >
                  {updatingId === product.id ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          ))}
          {!products.length && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 p-6 text-slate-600 dark:text-slate-400 shadow-sm">
              Nenhum produto encontrado no estoque.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Stock
