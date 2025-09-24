const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuth() {
  try {
    console.log('🔐 Testing authentication...')
    
    const email = 'admin@hospital.com'
    const password = 'password123'
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found:', email)
      return
    }
    
    console.log('✅ User found:', user.email, user.role)
    
    // Test password
    const isValid = await bcrypt.compare(password, user.password)
    console.log('🔐 Password valid:', isValid)
    
    if (isValid) {
      console.log('✅ Authentication would succeed')
      console.log('User data:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      })
    } else {
      console.log('❌ Authentication would fail - wrong password')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()
