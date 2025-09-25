import { PrismaClient, SurgeryStatus } from '@prisma/client'
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

  // Create additional surgeons
  let surgeon2, surgeon3
  try {
    surgeon2 = await prisma.user.create({
      data: {
        email: 'dr.smith@hospital.com',
        password: hashedPassword,
        name: 'Dr. Jennifer Smith',
        role: 'SURGEON'
      }
    })
    console.log('✅ Surgeon 2 created')
  } catch (error) {
    console.log('ℹ️ Surgeon 2 may already exist')
    surgeon2 = await prisma.user.findUnique({ where: { email: 'dr.smith@hospital.com' } })
  }

  try {
    surgeon3 = await prisma.user.create({
      data: {
        email: 'dr.jones@hospital.com',
        password: hashedPassword,
        name: 'Dr. Michael Jones',
        role: 'SURGEON'
      }
    })
    console.log('✅ Surgeon 3 created')
  } catch (error) {
    console.log('ℹ️ Surgeon 3 may already exist')
    surgeon3 = await prisma.user.findUnique({ where: { email: 'dr.jones@hospital.com' } })
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

  // Create comprehensive demo surgeries
  const today = new Date()
  const surgeryData = []
  
  if (patients.length >= 10 && admin && surgeon && staff && surgeon2 && surgeon3) {
    // Today's surgeries
    surgeryData.push(
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30),
        type: 'Emergency Appendectomy',
        status: 'IN_PROGRESS',
        notes: 'Emergency appendectomy - patient experiencing severe abdominal pain with elevated WBC count',
        patientId: patients[0].id,
        surgeonId: surgeon.id,
        scheduledById: admin.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        type: 'Cataract Surgery',
        status: 'SCHEDULED',
        notes: 'Right eye cataract removal - patient has 20/200 vision in affected eye',
        patientId: patients[1].id,
        surgeonId: admin.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
        type: 'Gallbladder Removal',
        status: 'SCHEDULED',
        notes: 'Laparoscopic cholecystectomy - patient has gallstones causing recurrent pain',
        patientId: patients[2].id,
        surgeonId: surgeon.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        type: 'Hernia Repair',
        status: 'SCHEDULED',
        notes: 'Inguinal hernia repair - patient has been experiencing discomfort for 6 months',
        patientId: patients[3].id,
        surgeonId: surgeon.id,
        scheduledById: admin.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30),
        type: 'Knee Arthroscopy',
        status: 'SCHEDULED',
        notes: 'Diagnostic arthroscopy - patient has persistent knee pain and limited mobility',
        patientId: patients[4].id,
        surgeonId: admin.id,
        scheduledById: staff.id
      }
    )

    // Tomorrow's surgeries
    surgeryData.push(
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 8, 0),
        type: 'Total Knee Replacement',
        status: 'SCHEDULED',
        notes: 'Bilateral knee replacement - patient has severe osteoarthritis in both knees',
        patientId: patients[5].id,
        surgeonId: surgeon.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 30),
        type: 'Hip Replacement',
        status: 'SCHEDULED',
        notes: 'Total hip arthroplasty - patient has advanced hip arthritis affecting daily activities',
        patientId: patients[6].id,
        surgeonId: surgeon2.id,
        scheduledById: admin.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 13, 0),
        type: 'Spinal Fusion',
        status: 'SCHEDULED',
        notes: 'L4-L5 spinal fusion - patient has severe back pain and nerve compression',
        patientId: patients[7].id,
        surgeonId: surgeon3.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 30),
        type: 'Cardiac Bypass',
        status: 'SCHEDULED',
        notes: 'Triple bypass surgery - patient has significant coronary artery disease',
        patientId: patients[8].id,
        surgeonId: admin.id,
        scheduledById: admin.id
      }
    )

    // Day after tomorrow
    surgeryData.push(
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 7, 0),
        type: 'Brain Tumor Removal',
        status: 'SCHEDULED',
        notes: 'Craniotomy for meningioma resection - 3cm tumor in frontal lobe',
        patientId: patients[9].id,
        surgeonId: surgeon.id,
        scheduledById: admin.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9, 30),
        type: 'Lung Biopsy',
        status: 'SCHEDULED',
        notes: 'Video-assisted thoracoscopic surgery (VATS) for lung nodule biopsy',
        patientId: patients[0].id,
        surgeonId: admin.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
        type: 'Prostate Surgery',
        status: 'SCHEDULED',
        notes: 'Robotic prostatectomy - patient has localized prostate cancer',
        patientId: patients[1].id,
        surgeonId: surgeon.id,
        scheduledById: staff.id
      }
    )

    // This week's additional surgeries
    surgeryData.push(
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 8, 0),
        type: 'Shoulder Surgery',
        status: 'SCHEDULED',
        notes: 'Rotator cuff repair - patient has torn rotator cuff from sports injury',
        patientId: patients[2].id,
        surgeonId: admin.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 14, 0),
        type: 'Thyroidectomy',
        status: 'SCHEDULED',
        notes: 'Total thyroidectomy - patient has thyroid nodules with suspicious features',
        patientId: patients[3].id,
        surgeonId: surgeon.id,
        scheduledById: admin.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 9, 0),
        type: 'Colonoscopy',
        status: 'SCHEDULED',
        notes: 'Screening colonoscopy - patient is 50+ and due for routine screening',
        patientId: patients[4].id,
        surgeonId: admin.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 11, 30),
        type: 'Endoscopy',
        status: 'SCHEDULED',
        notes: 'Upper GI endoscopy - patient has persistent heartburn and difficulty swallowing',
        patientId: patients[5].id,
        surgeonId: surgeon.id,
        scheduledById: staff.id
      }
    )

    // Some completed surgeries from last week
    surgeryData.push(
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 8, 0),
        type: 'Appendectomy',
        status: 'COMPLETED',
        notes: 'Laparoscopic appendectomy - patient recovered well, discharged same day',
        patientId: patients[6].id,
        surgeonId: surgeon.id,
        scheduledById: admin.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 0),
        type: 'Cataract Surgery',
        status: 'COMPLETED',
        notes: 'Left eye cataract removal - patient vision improved from 20/200 to 20/25',
        patientId: patients[7].id,
        surgeonId: admin.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 14, 0),
        type: 'Hernia Repair',
        status: 'COMPLETED',
        notes: 'Inguinal hernia repair - patient doing well, no complications',
        patientId: patients[8].id,
        surgeonId: surgeon.id,
        scheduledById: staff.id
      }
    )

    // Some cancelled surgeries
    surgeryData.push(
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 16, 0),
        type: 'Knee Surgery',
        status: 'CANCELLED',
        notes: 'Patient cancelled due to personal reasons, will reschedule',
        patientId: patients[9].id,
        surgeonId: admin.id,
        scheduledById: staff.id
      },
      {
        scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 17, 0),
        type: 'Minor Procedure',
        status: 'CANCELLED',
        notes: 'Patient developed fever, surgery postponed until cleared by infectious disease',
        patientId: patients[0].id,
        surgeonId: surgeon.id,
        scheduledById: admin.id
      }
    )
  }

  // Create surgeries only if we have users and patients
  if (admin && surgeon && staff && patients.length > 0) {
    try {
      await Promise.all(
        surgeryData.map(d => 
          prisma.surgery.create({ data: {
            ...d,
            status: d.status as SurgeryStatus,
            type: d.type
          }})
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
  console.log('Surgeon 2: dr.smith@hospital.com / password123')
  console.log('Surgeon 3: dr.jones@hospital.com / password123')
  console.log('Staff: staff@hospital.com / password123')
  console.log('\n📊 Test Data Summary:')
  console.log(`- ${patients.length} patients created`)
  console.log(`- ${surgeryData.length} surgeries scheduled`)
  console.log('- Surgeries span multiple days with various statuses')
  console.log('- Includes emergency, scheduled, completed, and cancelled cases')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
