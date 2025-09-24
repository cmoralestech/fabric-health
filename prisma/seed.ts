import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo users (without upsert to avoid transaction requirements)
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create users without checking for existing (simpler approach)
  let admin, surgeon, staff
  
  try {
    admin = await prisma.user.create({
      data: {
        email: 'admin@hospital.com',
        password: hashedPassword,
        name: 'Dr. Sarah Admin',
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin user created')
  } catch (error) {
    console.log('ℹ️ Admin user may already exist')
    admin = await prisma.user.findUnique({ where: { email: 'admin@hospital.com' } })
  }

  try {
    surgeon = await prisma.user.create({
      data: {
        email: 'surgeon@hospital.com',
        password: hashedPassword,
        name: 'Dr. John Surgeon',
        role: 'SURGEON'
      }
    })
    console.log('✅ Surgeon user created')
  } catch (error) {
    console.log('ℹ️ Surgeon user may already exist')
    surgeon = await prisma.user.findUnique({ where: { email: 'surgeon@hospital.com' } })
  }

  try {
    staff = await prisma.user.create({
      data: {
        email: 'staff@hospital.com',
        password: hashedPassword,
        name: 'Mary Staff',
        role: 'STAFF'
      }
    })
    console.log('✅ Staff user created')
  } catch (error) {
    console.log('ℹ️ Staff user may already exist')
    staff = await prisma.user.findUnique({ where: { email: 'staff@hospital.com' } })
  }

  console.log('✅ Users created')

  // Create a few demo patients
  const patientData = [
    { name: 'Emma Thompson', birthDate: new Date('2015-05-12'), age: 9, email: 'emma.thompson@email.com', phone: '(555) 101-1001' },
    { name: 'Alice Johnson', birthDate: new Date('1995-03-15'), age: 29, email: 'alice.johnson@email.com', phone: '(555) 123-4567' },
    { name: 'Michael Brown', birthDate: new Date('1992-11-08'), age: 32, email: 'michael.brown@email.com', phone: '(555) 201-2001' },
    { name: 'Sarah Davis', birthDate: new Date('1998-07-22'), age: 26, email: 'sarah.davis@email.com', phone: '(555) 201-2002' },
    { name: 'James Wilson', birthDate: new Date('1990-04-17'), age: 34, email: 'james.wilson@email.com', phone: '(555) 201-2003' },
    { name: 'Emily Garcia', birthDate: new Date('1996-12-05'), age: 28, email: 'emily.garcia@email.com', phone: '(555) 201-2004' },
    { name: 'Robert Taylor', birthDate: new Date('1975-08-12'), age: 49, email: 'robert.taylor@email.com', phone: '(555) 301-3001' },
    { name: 'Linda Thomas', birthDate: new Date('1980-05-20'), age: 44, email: 'linda.thomas@email.com', phone: '(555) 301-3002' },
    { name: 'William Johnson', birthDate: new Date('1955-03-18'), age: 69, email: 'william.johnson@email.com', phone: '(555) 401-4001' },
    { name: 'Barbara Smith', birthDate: new Date('1950-08-25'), age: 74, email: 'barbara.smith@email.com', phone: '(555) 401-4002' }
  ]

  // Create patients
  let patients = []
  try {
    patients = await Promise.all(
      patientData.map(data => 
        prisma.patient.create({ data })
      )
    )
    console.log('✅ Patients created')
  } catch (error) {
    console.log('ℹ️ Patients may already exist')
    // Get existing patients for surgery creation
    patients = await prisma.patient.findMany()
  }

  // Create a few demo surgeries
  const today = new Date()
  const surgeryData = []
  
  if (patients.length >= 3 && admin && surgeon && staff) {
    surgeryData.push(
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
        type: 'Appendectomy',
        status: 'IN_PROGRESS',
        notes: 'Emergency appendectomy - patient experiencing severe abdominal pain',
        patientId: patients[0].id,
        surgeonId: surgeon.id,
        scheduledById: admin.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30),
        type: 'Cataract Surgery',
        status: 'SCHEDULED',
        notes: 'Right eye cataract removal',
        patientId: patients[1].id,
        surgeonId: admin.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
        type: 'Knee Replacement',
        status: 'SCHEDULED',
        notes: 'Total knee replacement - left knee, patient has severe arthritis',
        patientId: patients[2].id,
        surgeonId: surgeon.id,
        scheduledById: staff.id
      }
    )
  }

  // Create surgeries only if we have users and patients
  if (admin && surgeon && staff && patients.length > 0) {
    try {
      await Promise.all(
        surgeryData.map(data => 
          prisma.surgery.create({ data })
        )
      )
      console.log('✅ Surgeries created')
    } catch (error) {
      console.log('ℹ️ Surgeries may already exist')
    }
  } else {
    console.log('ℹ️ Skipping surgeries - missing users or patients')
  }

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
