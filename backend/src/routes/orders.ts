import { Router } from 'express'
import Joi from 'joi'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

const orderSchema = Joi.object({
  tableId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().positive().required()
    })
  ).required()
})

router.get('/', async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    include: {
      table: true,
      items: { include: { product: true } },
      payment: true
    }
  })
  res.json(orders)
})

router.post('/', async (req: AuthRequest, res) => {
  const { error } = orderSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  const { tableId, items } = req.body

  // Check stock
  for (const item of items) {
    const stock = await prisma.stock.findUnique({ where: { productId: item.productId } })
    if (stock && stock.quantity < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for product ${item.productId}` })
    }
  }

  // Calculate total
  let total = 0
  const orderItems = []
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) return res.status(400).json({ error: 'Product not found' })
    total += product.price * item.quantity
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price
    })
  }

  const order = await prisma.order.create({
    data: {
      tableId,
      total,
      items: { create: orderItems }
    },
    include: { items: { include: { product: true } } }
  })

  // Update stock
  for (const item of items) {
    await prisma.stock.update({
      where: { productId: item.productId },
      data: { quantity: { decrement: item.quantity } }
    })
  }

  // Mark table as occupied
  await prisma.table.update({
    where: { id: tableId },
    data: { isOccupied: true }
  })

  res.json(order)
})

router.put('/:id/status', async (req: AuthRequest, res) => {
  const { status } = req.body
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status }
  })
  res.json(order)
})

export default router