import { Router } from 'express'
import Joi from 'joi'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

const tableSchema = Joi.object({
  number: Joi.number().integer().positive().required()
})

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables
 *     responses:
 *       200:
 *         description: List of tables
 */
router.get('/', async (req: AuthRequest, res) => {
  const tables = await prisma.table.findMany({
    include: {
      orders: {
        where: { status: { not: 'DELIVERED' } },
        include: { items: { include: { product: true } } }
      }
    }
  })
  res.json(tables)
})

router.post('/', async (req: AuthRequest, res) => {
  const { error } = tableSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  const table = await prisma.table.create({ data: req.body })
  res.json(table)
})

router.put('/:id', async (req: AuthRequest, res) => {
  const table = await prisma.table.update({
    where: { id: req.params.id },
    data: req.body
  })
  res.json(table)
})

router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.table.delete({ where: { id: req.params.id } })
  res.json({ message: 'Table deleted' })
})

export default router