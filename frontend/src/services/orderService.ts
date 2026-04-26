import api from './api'

export interface OrderItem {
  productId: string
  quantity: number
}

export const createOrder = async (tableId: string, items: OrderItem[]) => {
  const response = await api.post('/orders', { tableId, items })
  return response.data
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.put(`/orders/${orderId}/status`, { status })
  return response.data
}