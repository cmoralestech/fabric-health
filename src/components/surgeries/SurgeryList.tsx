'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime, formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, User, UserCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface Surgery {
  id: string
  scheduledAt: string
  type: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
  notes?: string
  patient: {
    id: string
    name: string
    age: number
    birthDate: string
  }
  surgeon: {
    id: string
    name: string
    email: string
  }
  scheduledBy: {
    id: string
    name: string
    email: string
  }
}

interface SurgeryListProps {
  onScheduleNew: () => void
  onEditSurgery: (surgery: Surgery) => void
}

const statusConfig = {
  SCHEDULED: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
  IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
  POSTPONED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
}

export default function SurgeryList({ onScheduleNew, onEditSurgery }: SurgeryListProps) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const fetchSurgeries = async () => {
    try {
      const response = await fetch(`/api/surgeries?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setSurgeries(data.surgeries)
      }
    } catch (error) {
      console.error('Error fetching surgeries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSurgeries()
  }, [filter])

  const handleCancelSurgery = async (surgeryId: string) => {
    if (!confirm('Are you sure you want to cancel this surgery?')) return

    try {
      const response = await fetch(`/api/surgeries/${surgeryId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchSurgeries() // Refresh the list
      }
    } catch (error) {
      console.error('Error cancelling surgery:', error)
    }
  }

  const filters = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surgery Schedule</h1>
          <p className="text-gray-600">Manage and view all scheduled surgeries</p>
        </div>
        <Button onClick={onScheduleNew} className="w-full sm:w-auto">
          Schedule New Surgery
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Surgery Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surgeries.map((surgery) => {
          const statusInfo = statusConfig[surgery.status]
          const StatusIcon = statusInfo.icon
          const isUpcoming = new Date(surgery.scheduledAt) > new Date()
          
          return (
            <Card key={surgery.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{surgery.type}</CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {surgery.status.replace('_', ' ')}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Patient Info */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{surgery.patient.name}</span>
                  <span className="text-gray-500">• Age {surgery.patient.age}</span>
                </div>

                {/* Surgeon Info */}
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  <span>Dr. {surgery.surgeon.name}</span>
                </div>

                {/* Date & Time */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(surgery.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{formatTime(surgery.scheduledAt)}</span>
                  </div>
                </div>

                {/* Notes */}
                {surgery.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {surgery.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditSurgery(surgery)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  {surgery.status === 'SCHEDULED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelSurgery(surgery.id)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {surgeries.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No surgeries found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'ALL' ? 'Get started by scheduling a new surgery.' : `No ${filter.toLowerCase()} surgeries.`}
          </p>
          {filter === 'ALL' && (
            <div className="mt-6">
              <Button onClick={onScheduleNew}>Schedule New Surgery</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
