import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      email: 'admin@hospital.com',
      password: hashedPassword,
      name: 'Dr. Sarah Admin',
      role: 'ADMIN'
    }
  })

  const surgeon = await prisma.user.upsert({
    where: { email: 'surgeon@hospital.com' },
    update: {},
    create: {
      email: 'surgeon@hospital.com',
      password: hashedPassword,
      name: 'Dr. John Surgeon',
      role: 'SURGEON'
    }
  })

  const staff = await prisma.user.upsert({
    where: { email: 'staff@hospital.com' },
    update: {},
    create: {
      email: 'staff@hospital.com',
      password: hashedPassword,
      name: 'Mary Staff',
      role: 'STAFF'
    }
  })

  console.log('✅ Users created')

  // Create demo patients
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'Alice Johnson',
        birthDate: new Date('1985-03-15'),
        age: 39,
        email: 'alice.johnson@email.com',
        phone: '(555) 123-4567'
      }
    }),
    prisma.patient.create({
      data: {
        name: 'Bob Smith',
        birthDate: new Date('1972-07-22'),
        age: 52,
        email: 'bob.smith@email.com',
        phone: '(555) 234-5678'
      }
    }),
    prisma.patient.create({
      data: {
        name: 'Carol Davis',
        birthDate: new Date('1990-11-08'),
        age: 34,
        email: 'carol.davis@email.com',
        phone: '(555) 345-6789'
      }
    }),
    prisma.patient.create({
      data: {
        name: 'David Wilson',
        birthDate: new Date('1965-09-12'),
        age: 59,
        email: 'david.wilson@email.com',
        phone: '(555) 456-7890'
      }
    })
  ])

  console.log('✅ Patients created')

  // Create demo surgeries
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 30, 0, 0)

  const surgeries = await Promise.all([
    prisma.surgery.create({
      data: {
        scheduledAt: tomorrow,
        type: 'Appendectomy',
        status: 'SCHEDULED',
        notes: 'Emergency appendectomy - patient experiencing severe abdominal pain',
        patientId: patients[0].id,
        surgeonId: surgeon.id,
        scheduledById: admin.id
      }
    }),
    prisma.surgery.create({
      data: {
        scheduledAt: nextWeek,
        type: 'Knee Replacement',
        status: 'SCHEDULED',
        notes: 'Total knee replacement - right knee',
        patientId: patients[1].id,
        surgeonId: surgeon.id,
        scheduledById: staff.id
      }
    }),
    prisma.surgery.create({
      data: {
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        type: 'Cataract Surgery',
        status: 'SCHEDULED',
        notes: 'Left eye cataract removal',
        patientId: patients[2].id,
        surgeonId: admin.id, // Admin can also perform surgeries
        scheduledById: staff.id
      }
    })
  ])

  console.log('✅ Surgeries created')

  console.log('🎉 Seed completed successfully!')
  console.log('\nDemo accounts:')
  console.log('Admin: admin@hospital.com / password123')
  console.log('Surgeon: surgeon@hospital.com / password123')
  console.log('Staff: staff@hospital.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
