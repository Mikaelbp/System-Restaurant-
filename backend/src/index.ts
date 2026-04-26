import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import authRoutes from './routes/auth'
import tableRoutes from './routes/tables'
import orderRoutes from './routes/orders'
import productRoutes from './routes/products'
import categoryRoutes from './routes/categories'
import paymentRoutes from './routes/payments'
import menuRoutes from './routes/menu'
import { authMiddleware } from './middleware/auth'

dotenv.config()

const app = express()
export const prisma = new PrismaClient()

app.use(cors({
  origin: "https://system-restaurant-frontend.vercel.app",
  credentials: true
}))
app.use(helmet())
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
app.use(limiter)

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema Restaurante API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'],
}
const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/tables', authMiddleware, tableRoutes)
app.use('/api/orders', authMiddleware, orderRoutes)
app.use('/api/products', authMiddleware, productRoutes)
app.use('/api/categories', authMiddleware, categoryRoutes)
app.use('/api/payments', authMiddleware, paymentRoutes)
app.use('/menu', menuRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})