import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@restaurante.com' },
    update: {},
    create: {
      email: 'admin@restaurante.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  // Create categories
  const entradas = await prisma.category.upsert({
    where: { name: 'Entradas' },
    update: {},
    create: { name: 'Entradas' }
  })

  const pratos = await prisma.category.upsert({
    where: { name: 'Pratos Principais' },
    update: {},
    create: { name: 'Pratos Principais' }
  })

  const bebidas = await prisma.category.upsert({
    where: { name: 'Bebidas' },
    update: {},
    create: { name: 'Bebidas' }
  })

  // Create products
  await prisma.product.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Salada Caesar',
      description: 'Salada fresca com molho caesar',
      price: 15.00,
      categoryId: entradas.id
    }
  })

  await prisma.product.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'Filé Mignon',
      description: 'Filé mignon grelhado',
      price: 45.00,
      categoryId: pratos.id
    }
  })

  await prisma.product.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      name: 'Coca-Cola',
      description: 'Refrigerante 350ml',
      price: 5.00,
      categoryId: bebidas.id
    }
  })

  // Create tables
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i }
    })
  }

  // Create stock
  await prisma.stock.upsert({
    where: { productId: '1' },
    update: {},
    create: { productId: '1', quantity: 20, minStock: 5 }
  })

  await prisma.stock.upsert({
    where: { productId: '2' },
    update: {},
    create: { productId: '2', quantity: 15, minStock: 3 }
  })

  await prisma.stock.upsert({
    where: { productId: '3' },
    update: {},
    create: { productId: '3', quantity: 50, minStock: 10 }
  })

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })