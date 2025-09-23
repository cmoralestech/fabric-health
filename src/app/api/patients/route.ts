import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/patients - Get all patients
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    } : {}

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50 // Limit for performance
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Get patients error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
