const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...')
    
    // Try to connect to the database
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Try a simple query
    const result = await prisma.$runCommandRaw({ ping: 1 })
    console.log('✅ Database ping successful:', result)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
