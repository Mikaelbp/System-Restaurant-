import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { prisma } from '../index'

const router = Router()

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

router.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body)
  if (error) return res.status(400).json({ error: error.details[0].message })

  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(400).json({ error: 'Invalid credentials' })

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' })
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } })
})

export default router