import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/patients/[id]/surgeries - Get all surgeries for a specific patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: patientId } = await params

    // Get all surgeries for the patient
    const surgeries = await prisma.surgery.findMany({
      where: {
        patientId: patientId
      },
      include: {
        surgeon: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        scheduledBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    return NextResponse.json(surgeries)
  } catch (error) {
    console.error('Get patient surgeries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
