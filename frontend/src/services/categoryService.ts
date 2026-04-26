import api from './api'

export interface Category {
  id: string
  name: string
  description?: string
  products?: any[]
}

export const getCategories = async () => {
  const response = await api.get<Category[]>('/categories')
  return response.data
}

export const createCategory = async (data: Omit<Category, 'id'>) => {
  const response = await api.post('/categories', data)
  return response.data
}

export const updateCategory = async (id: string, data: Partial<Category>) => {
  const response = await api.put(`/categories/${id}`, data)
  return response.data
}

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`)
  return response.data
}