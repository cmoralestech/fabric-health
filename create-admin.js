const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@hospital.com' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }
    
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@hospital.com',
        password: hashedPassword,
        name: 'Dr. Sarah Admin',
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Admin user created successfully:', admin.email)
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

