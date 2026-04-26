export interface Category {
  id: string
  name: string
  description?: string
  products?: Product[]
}

export interface User {
  id: string
  email: string
  role: string
}

export interface Table {
  id: string
  number: number
  isOccupied: boolean
  orders?: Order[]
}

export interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  categoryId: string
  category?: {
    id: string
    name: string
  } | null
  stock?: {
    quantity: number
  } | null
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  product: Product
}

export interface Order {
  id: string
  tableId: string
  total: number
  status: string
  createdAt?: string
  table?: Table | null
  items?: OrderItem[]
}
