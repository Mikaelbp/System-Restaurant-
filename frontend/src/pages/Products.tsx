import { useEffect, useState } from 'react'
import api from '../services/api'
import { getCategories } from '../services/categoryService'
import type { Product, Category } from '../types'

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get<Product[]>('/products'),
        getCategories()
      ])
      setProducts(productsRes.data)
      setCategories(categoriesRes)
    } catch (err) {
      setError('Não foi possível carregar os dados.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: ''
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId || undefined
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData)
      } else {
        await api.post('/products', productData)
      }

      await fetchData()
      resetForm()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar produto')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      categoryId: product.category?.id || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      await api.delete(`/products/${productId}`)
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir produto')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Gerenciamento</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Produtos</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {showForm ? 'Cancelar' : 'Novo Produto'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preço *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                {editingProduct ? 'Atualizar' : 'Criar'} Produto
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="text-slate-700">Carregando produtos...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">{product.category?.name ?? 'Sem categoria'}</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">{product.description ?? 'Sem descrição'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 rounded-2xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 rounded-2xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
            {!products.length && (
              <div className="col-span-full rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                Nenhum produto encontrado.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products