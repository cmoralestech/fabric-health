import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createPatientSchema, calculateAge, sanitizePatientData } from '@/lib/validations'

// GET /api/patients - Get all patients with advanced search and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const ageMin = searchParams.get('ageMin')
    const ageMax = searchParams.get('ageMax')
    const birthYear = searchParams.get('birthYear')
    const birthDate = searchParams.get('birthDate')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause for advanced search
    const where: any = {}
    const conditions: any[] = []

    // Text search across multiple fields
    if (search && search.trim()) {
      const searchTerm = search.trim()
      conditions.push({
        OR: [
          { name: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phone: { contains: searchTerm } }
        ]
      })
    }

    // Age range filtering
    if (ageMin || ageMax) {
      const ageFilter: any = {}
      if (ageMin) ageFilter.gte = parseInt(ageMin)
      if (ageMax) ageFilter.lte = parseInt(ageMax)
      conditions.push({ age: ageFilter })
    }

    // Birth year filtering
    if (birthYear) {
      const year = parseInt(birthYear)
      const startOfYear = new Date(year, 0, 1)
      const endOfYear = new Date(year, 11, 31, 23, 59, 59)
      conditions.push({
        birthDate: {
          gte: startOfYear,
          lte: endOfYear
        }
      })
    }

    // Exact birth date filtering
    if (birthDate) {
      const targetDate = new Date(birthDate)
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59)
      conditions.push({
        birthDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      })
    }

    if (conditions.length > 0) {
      where.AND = conditions
    }

    // Build order by clause
    const orderBy: any = {}
    if (sortBy === 'age') {
      orderBy.age = sortOrder
    } else if (sortBy === 'birthDate') {
      orderBy.birthDate = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else {
      orderBy.name = sortOrder
    }

    // Execute queries
    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { surgeries: true }
          }
        }
      }),
      prisma.patient.count({ where })
    ])

    // Add surgery count to each patient
    const patientsWithCounts = patients.map(patient => ({
      ...patient,
      surgeryCount: patient._count.surgeries
    }))

    return NextResponse.json({
      patients: patientsWithCounts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get patients error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validationResult = createPatientSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, birthDate, email, phone } = validationResult.data
    
    // Sanitize the data
    const sanitizedData = sanitizePatientData({ name, email, phone })
    
    // Parse birth date and calculate age
    const parsedBirthDate = new Date(birthDate)
    const calculatedAge = calculateAge(parsedBirthDate)

    // Create the patient
    const patient = await prisma.patient.create({
      data: {
        name: sanitizedData.name,
        birthDate: parsedBirthDate,
        age: calculatedAge,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
      }
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
