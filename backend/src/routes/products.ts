import { Router } from 'express'
import Joi from 'joi'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().positive().required(),
  categoryId: Joi.string().required()
})

router.get('/', async (req: AuthRequest, res) => {
  const products = await prisma.product.findMany({
    include: { category: true, stock: true }
  })
  res.json(products)
})

router.post('/', async (req: AuthRequest, res) => {
  const { error } = productSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  const product = await prisma.product.create({ data: req.body })
  res.json(product)
})

router.put('/:id', async (req: AuthRequest, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body
  })
  res.json(product)
})

router.put('/:id/stock', async (req: AuthRequest, res) => {
  const { quantity } = req.body
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Quantidade inválida' })
  }

  const stock = await prisma.stock.update({
    where: { productId: req.params.id },
    data: { quantity: { increment: quantity } }
  })
  res.json(stock)
})

router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.product.delete({ where: { id: req.params.id } })
  res.json({ message: 'Product deleted' })
})

export default router