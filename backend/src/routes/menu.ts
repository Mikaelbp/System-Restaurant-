import { Router } from 'express'
import { prisma } from '../index'

const router = Router()

router.get('/:tableId', async (req, res) => {
  const { tableId } = req.params
  const products = await prisma.product.findMany({
    include: { category: true }
  })
  const table = await prisma.table.findUnique({ where: { id: tableId } })

  // Simple HTML menu
  const menuHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cardápio - Mesa ${table?.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .product { border: 1px solid #ccc; padding: 10px; margin: 10px; }
        .category { font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Cardápio - Mesa ${table?.number}</h1>
      ${products.map(p => `
        <div class="product">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p>R$ ${p.price.toFixed(2)}</p>
        </div>
      `).join('')}
    </body>
    </html>
  `
  res.send(menuHtml)
})

export default router