import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { updateSurgerySchema } from '@/lib/validations'

// GET /api/surgeries/[id] - Get single surgery
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const surgery = await prisma.surgery.findUnique({
      where: { id: params.id },
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

    if (!surgery) {
      return NextResponse.json({ error: 'Surgery not found' }, { status: 404 })
    }

    return NextResponse.json(surgery)
  } catch (error) {
    console.error('Get surgery error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/surgeries/[id] - Update surgery
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSurgerySchema.parse(body)

    // Check if surgery exists
    const existingSurgery = await prisma.surgery.findUnique({
      where: { id: params.id }
    })

    if (!existingSurgery) {
      return NextResponse.json({ error: 'Surgery not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = { ...validatedData }
    
    if (validatedData.scheduledAt) {
      updateData.scheduledAt = new Date(validatedData.scheduledAt)
    }

    const surgery = await prisma.surgery.update({
      where: { id: params.id },
      data: updateData,
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
      message: 'Surgery updated successfully',
      surgery
    })

  } catch (error) {
    console.error('Update surgery error:', error)
    
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

// DELETE /api/surgeries/[id] - Cancel/Delete surgery
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if surgery exists
    const existingSurgery = await prisma.surgery.findUnique({
      where: { id: params.id }
    })

    if (!existingSurgery) {
      return NextResponse.json({ error: 'Surgery not found' }, { status: 404 })
    }

    // Update status to CANCELLED instead of deleting
    const surgery = await prisma.surgery.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
      include: {
        patient: true,
        surgeon: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Surgery cancelled successfully',
      surgery
    })

  } catch (error) {
    console.error('Cancel surgery error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
