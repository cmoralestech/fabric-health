'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ViewToggle from '@/components/ui/ViewToggle'
import SurgeryTableView from './SurgeryTableView'
import { formatDateTime, formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, User, UserCheck, AlertCircle, CheckCircle, XCircle, Plus, Filter, Search, MoreVertical, Edit, Trash2, X } from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [view, setView] = useState<'cards' | 'table'>('cards')

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

  const handleCompleteSurgery = async (surgeryId: string) => {
    if (!confirm('Are you sure you want to mark this surgery as completed?')) return

    try {
      const response = await fetch(`/api/surgeries/${surgeryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      
      if (response.ok) {
        fetchSurgeries() // Refresh the list
      }
    } catch (error) {
      console.error('Error completing surgery:', error)
    }
  }

  const filters = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  // Filter surgeries based on search term
  const filteredSurgeries = surgeries.filter(surgery => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      surgery.type.toLowerCase().includes(searchLower) ||
      surgery.patient.name.toLowerCase().includes(searchLower) ||
      surgery.surgeon.name.toLowerCase().includes(searchLower) ||
      surgery.notes?.toLowerCase().includes(searchLower)
    )
  })

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
    <div className="space-y-6">
      {/* Compact Professional Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">Surgery Schedule</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              {filteredSurgeries.length} Total Cases
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {filteredSurgeries.filter(s => s.status === 'SCHEDULED').length} Upcoming
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {filteredSurgeries.filter(s => s.status === 'IN_PROGRESS').length} In Progress
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search surgeries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <button
                onClick={() => {
                  setSearchTerm('')
                  setShowSearch(false)
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <Button
            onClick={() => setShowSearch(!showSearch)}
            variant="outline"
            size="sm"
            className="text-gray-600"
          >
            <Search className="w-4 h-4 mr-1" />
            Search
          </Button>
          <ViewToggle view={view} onViewChange={setView} />
          <Button 
            onClick={onScheduleNew} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Surgery
          </Button>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {filters.map((status) => {
          const count = status === 'ALL' ? surgeries.length : surgeries.filter(s => s.status === status).length
          return (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className={`text-xs ${
                filter === status 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === status ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Surgery Content - Cards or Table View */}
      {view === 'cards' ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredSurgeries.map((surgery) => {
            const isUpcoming = new Date(surgery.scheduledAt) > new Date()
            const isToday = new Date(surgery.scheduledAt).toDateString() === new Date().toDateString()
            
            return (
              <Card key={surgery.id} className={`group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 ${
                isToday ? 'ring-2 ring-blue-500 ring-opacity-30' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {surgery.type}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(surgery.scheduledAt)}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{formatTime(surgery.scheduledAt)}</span>
                        {isToday && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full ml-2">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={surgery.status} />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Patient & Surgeon Section - Compact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{surgery.patient.name}</p>
                        <p className="text-xs text-gray-500">Age {surgery.patient.age}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">Dr. {surgery.surgeon.name}</p>
                        <p className="text-xs text-gray-500">Surgeon</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {surgery.notes && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-2 rounded-r-lg">
                      <p className="text-xs text-amber-800 font-medium mb-1">Notes</p>
                      <p className="text-xs text-amber-700 line-clamp-2">{surgery.notes}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-1 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditSurgery(surgery)}
                      className="flex-1 text-xs hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    {surgery.status === 'SCHEDULED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelSurgery(surgery.id)}
                        className="flex-1 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <SurgeryTableView
          surgeries={filteredSurgeries}
          onEditSurgery={onEditSurgery}
          onCancelSurgery={handleCancelSurgery}
          onCompleteSurgery={handleCompleteSurgery}
        />
      )}

      {filteredSurgeries.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No surgeries match your search' : 'No surgeries found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? `Try adjusting your search terms.` 
              : filter === 'ALL' 
                ? 'Get started by scheduling a new surgery.' 
                : `No ${filter.toLowerCase()} surgeries.`
            }
          </p>
          {!searchTerm && filter === 'ALL' && (
            <div className="mt-6">
              <Button onClick={onScheduleNew}>Schedule New Surgery</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

