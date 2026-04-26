import { Router } from 'express'
import Joi from 'joi'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

const paymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  method: Joi.string().required()
})

router.post('/', async (req: AuthRequest, res) => {
  const { error } = paymentSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  const { orderId, amount, method } = req.body

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true }
  })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.payment) return res.status(400).json({ error: 'Order already paid' })

  const payment = await prisma.payment.create({
    data: { orderId, amount, method }
  })

  // Mark table as free if all orders are paid
  const unpaidOrders = await prisma.order.count({
    where: { tableId: order.tableId, payment: null }
  })
  if (unpaidOrders === 0) {
    await prisma.table.update({
      where: { id: order.tableId },
      data: { isOccupied: false }
    })
  }

  res.json(payment)
})

export default router