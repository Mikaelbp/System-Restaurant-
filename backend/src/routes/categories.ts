import { Router } from 'express'
import Joi from 'joi'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string()
})

router.get('/', async (req: AuthRequest, res) => {
  const categories = await prisma.category.findMany({
    include: { products: true }
  })
  res.json(categories)
})

router.post('/', async (req: AuthRequest, res) => {
  const { error } = categorySchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  const category = await prisma.category.create({ data: req.body })
  res.json(category)
})

router.put('/:id', async (req: AuthRequest, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body
  })
  res.json(category)
})

router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ message: 'Category deleted' })
})

export default router