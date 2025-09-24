'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDateTime, formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, User, UserCheck, AlertCircle, CheckCircle, XCircle, Plus, Filter, Search, MoreVertical, Edit, Trash2 } from 'lucide-react'

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

const filterOptions = [
  { value: 'ALL', label: 'All Surgeries', count: 0 },
  { value: 'SCHEDULED', label: 'Scheduled', count: 0 },
  { value: 'IN_PROGRESS', label: 'In Progress', count: 0 },
  { value: 'COMPLETED', label: 'Completed', count: 0 },
  { value: 'CANCELLED', label: 'Cancelled', count: 0 }
]

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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading surgeries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Surgery Schedule</h1>
            <p className="text-blue-100">Comprehensive surgical case management</p>
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span>{surgeries.length} Total Cases</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span>{surgeries.filter(s => s.status === 'SCHEDULED').length} Upcoming</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={onScheduleNew} 
            className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg px-6 py-3 font-semibold"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Schedule Surgery
          </Button>
        </div>
      </div>

      {/* Enhanced Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((status) => {
              const count = status === 'ALL' ? surgeries.length : surgeries.filter(s => s.status === status).length
              return (
                <Button
                  key={status}
                  variant={filter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={filter === status ? 'shadow-md' : 'hover:shadow-sm transition-shadow'}
                >
                  {status === 'ALL' ? 'All Surgeries' : status.replace('_', ' ')}
                  {count > 0 && (
                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                      filter === status ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Filter by status</span>
          </div>
        </div>
      </div>

      {/* Enhanced Surgery Cards */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {surgeries.map((surgery) => {
          const isUpcoming = new Date(surgery.scheduledAt) > new Date()
          const isToday = new Date(surgery.scheduledAt).toDateString() === new Date().toDateString()
          
          return (
            <Card key={surgery.id} className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md ${
              isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}>
              <CardHeader className="pb-4 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {surgery.type}
                    </CardTitle>
                    {isToday && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <StatusBadge status={surgery.status} />
                </div>
                
                {/* Priority indicator for urgent cases */}
                {surgery.status === 'SCHEDULED' && isUpcoming && (
                  <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-5">
                {/* Patient Section */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{surgery.patient.name}</p>
                      <p className="text-sm text-gray-500">Age {surgery.patient.age} • Patient</p>
                    </div>
                  </div>
                </div>

                {/* Surgeon Section */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. {surgery.surgeon.name}</p>
                    <p className="text-sm text-gray-500">Attending Surgeon</p>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formatDate(surgery.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatTime(surgery.scheduledAt)}</span>
                  </div>
                </div>

                {/* Notes */}
                {surgery.notes && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                    <p className="text-sm text-amber-800 font-medium mb-1">Clinical Notes</p>
                    <p className="text-sm text-amber-700">{surgery.notes}</p>
                  </div>
                )}

                {/* Enhanced Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditSurgery(surgery)}
                    className="flex-1 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {surgery.status === 'SCHEDULED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelSurgery(surgery.id)}
                      className="flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
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
