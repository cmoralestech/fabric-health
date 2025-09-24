const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser() {
  try {
    console.log('🔐 Creating test user...')
    
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@hospital.com',
        password: hashedPassword,
        name: 'Dr. Sarah Admin',
        role: 'ADMIN'
      }
    })
    
    console.log('✅ User created successfully:', user.email)
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()

