import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createSurgerySchema, calculateAge, sanitizePatientData } from '@/lib/validations'

// GET /api/surgeries - Get all surgeries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status && status !== 'ALL' ? { status: status as any } : {}

    // First check if we have any data at all
    const totalCount = await prisma.surgery.count({ where })
    
    if (totalCount === 0) {
      return NextResponse.json({
        surgeries: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    // Use raw query to avoid relationship issues with corrupted data
    const surgeries = await prisma.surgery.findMany({
      where,
      select: {
        id: true,
        scheduledAt: true,
        type: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        patientId: true,
        surgeonId: true,
        scheduledById: true,
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            email: true,
            phone: true
          }
        },
        surgeon: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        scheduledBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      skip,
      take: limit
    })

    const total = await prisma.surgery.count({ where })

    return NextResponse.json({
      surgeries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get surgeries error:', error)
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('DNS resolution')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check MongoDB Atlas connection.' },
        { status: 503 }
      )
    }
    
    // Check if it's a Prisma client error
    if (error instanceof Error && error.message.includes('PrismaClient')) {
      return NextResponse.json(
        { error: 'Database query failed. Please ensure database is properly seeded.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/surgeries - Create new surgery
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate surgery data
    const validatedSurgery = createSurgerySchema.parse(body.surgery)
    
    // Handle patient creation or selection
    let patientId = validatedSurgery.patientId
    
    if (body.patient) {
      // Creating new patient
      const patientData = sanitizePatientData(body.patient)
      const birthDate = new Date(patientData.birthDate)
      const age = calculateAge(birthDate)
      
      const patient = await prisma.patient.create({
        data: {
          ...patientData,
          birthDate,
          age
        }
      })
      
      patientId = patient.id
    }

    // Create surgery
    const surgery = await prisma.surgery.create({
      data: {
        ...validatedSurgery,
        patientId,
        scheduledAt: new Date(validatedSurgery.scheduledAt),
        scheduledById: session.user.id
      },
      include: {
        patient: true,
        surgeon: {
          select: { id: true, name: true, email: true }
        },
        scheduledBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Surgery scheduled successfully',
      surgery
    }, { status: 201 })

  } catch (error) {
    console.error('Create surgery error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
