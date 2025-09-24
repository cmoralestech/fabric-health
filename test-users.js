const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testUsers() {
  try {
    console.log('🔍 Checking users in database...')
    
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users:`)
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`)
    })
    
    // Test password verification
    if (users.length > 0) {
      const testUser = users[0]
      const testPassword = 'password123'
      const isValid = await bcrypt.compare(testPassword, testUser.password)
      console.log(`\n🔐 Password test for ${testUser.email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testUsers()

