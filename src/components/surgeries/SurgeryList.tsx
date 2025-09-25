'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Pagination } from '@/components/ui/Pagination'
import ViewToggle from '@/components/ui/ViewToggle'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import SurgeryTableView from './SurgeryTableView'
import ExportSurgeriesButton from './ExportSurgeriesButton'
import { formatDateTime, formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, User, UserCheck, AlertCircle, CheckCircle, XCircle, Plus, Filter, Search, MoreVertical, Edit, Trash2, X } from 'lucide-react'

interface Surgery {
  id: string
  scheduledAt: string
  type: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
  priority: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'ELECTIVE'
  estimatedDuration?: number // in minutes
  actualDuration?: number // in minutes
  operatingRoom?: string
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
  assistantSurgeon?: {
    id: string
    name: string
    email: string
  }
  anesthesiologist?: {
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
  { value: 'CANCELLED', label: 'Cancelled', count: 0 },
  { value: 'POSTPONED', label: 'Postponed', count: 0 }
]

const priorityOptions = [
  { value: 'ALL', label: 'All Priorities', count: 0 },
  { value: 'EMERGENCY', label: 'Emergency', count: 0 },
  { value: 'URGENT', label: 'Urgent', count: 0 },
  { value: 'ROUTINE', label: 'Routine', count: 0 },
  { value: 'ELECTIVE', label: 'Elective', count: 0 }
]

export default function SurgeryList({ onScheduleNew, onEditSurgery }: SurgeryListProps) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [selectedSurgeries, setSelectedSurgeries] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  
  // Confirmation modal states
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedSurgeryForAction, setSelectedSurgeryForAction] = useState<Surgery | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Utility functions for enterprise features
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800 border-red-200'
      case 'URGENT': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'ROUTINE': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ELECTIVE': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY': return <AlertCircle className="w-3 h-3" />
      case 'URGENT': return <Clock className="w-3 h-3" />
      case 'ROUTINE': return <Calendar className="w-3 h-3" />
      case 'ELECTIVE': return <CheckCircle className="w-3 h-3" />
      default: return <Calendar className="w-3 h-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'POSTPONED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Not specified'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Bulk operations handlers
  const toggleSurgerySelection = (surgeryId: string) => {
    const newSelected = new Set(selectedSurgeries)
    if (newSelected.has(surgeryId)) {
      newSelected.delete(surgeryId)
    } else {
      newSelected.add(surgeryId)
    }
    setSelectedSurgeries(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const selectAllSurgeries = () => {
    const allIds = new Set(filteredSurgeries.map(s => s.id))
    setSelectedSurgeries(allIds)
    setShowBulkActions(true)
  }

  const clearSelection = () => {
    setSelectedSurgeries(new Set())
    setShowBulkActions(false)
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Update ${selectedSurgeries.size} surgeries to ${newStatus}?`)) return

    try {
      const promises = Array.from(selectedSurgeries).map(id =>
        fetch(`/api/surgeries/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      )
      
      await Promise.all(promises)
      fetchSurgeries()
      clearSelection()
    } catch (error) {
      console.error('Bulk update error:', error)
    }
  }

  const handleBulkCancel = async () => {
    if (!confirm(`Cancel ${selectedSurgeries.size} surgeries?`)) return
    await handleBulkStatusUpdate('CANCELLED')
  }

  const fetchSurgeries = async (page: number = 1) => {
    try {
      const params = new URLSearchParams({
        status: filter,
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      
      const response = await fetch(`/api/surgeries?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSurgeries(data.surgeries)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching surgeries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchSurgeries(page)
  }

  useEffect(() => {
    fetchSurgeries(1) // Reset to page 1 when filter changes
  }, [filter])

  const handleCancelSurgery = (surgery: Surgery) => {
    setSelectedSurgeryForAction(surgery)
    setShowCancelModal(true)
  }

  const confirmCancelSurgery = async () => {
    if (!selectedSurgeryForAction) return

    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/surgeries/${selectedSurgeryForAction.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchSurgeries() // Refresh the list
        setShowCancelModal(false)
        setSelectedSurgeryForAction(null)
      }
    } catch (error) {
      console.error('Error cancelling surgery:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCompleteSurgery = (surgery: Surgery) => {
    setSelectedSurgeryForAction(surgery)
    setShowCompleteModal(true)
  }

  const confirmCompleteSurgery = async () => {
    if (!selectedSurgeryForAction) return

    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/surgeries/${selectedSurgeryForAction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      
      if (response.ok) {
        fetchSurgeries() // Refresh the list
        setShowCompleteModal(false)
        setSelectedSurgeryForAction(null)
      }
    } catch (error) {
      console.error('Error completing surgery:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const filters = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED']

  // Enhanced filtering with priority, search, and other criteria
  const filteredSurgeries = surgeries.filter(surgery => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (
        surgery.type.toLowerCase().includes(searchLower) ||
        surgery.patient.name.toLowerCase().includes(searchLower) ||
        surgery.surgeon.name.toLowerCase().includes(searchLower) ||
        surgery.operatingRoom?.toLowerCase().includes(searchLower) ||
        surgery.notes?.toLowerCase().includes(searchLower)
      )
      if (!matchesSearch) return false
    }

    // Priority filter
    if (priorityFilter !== 'ALL' && surgery.priority !== priorityFilter) {
      return false
    }

    return true
  })

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
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
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {filteredSurgeries.length} Total
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {filteredSurgeries.filter(s => s.status === 'SCHEDULED').length} Scheduled
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              {filteredSurgeries.filter(s => s.status === 'IN_PROGRESS').length} Active
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {filteredSurgeries.filter(s => s.priority === 'EMERGENCY').length} Emergency
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onScheduleNew} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Surgery
          </Button>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by surgery type, patient name, surgeon, OR room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              size="sm"
              className={`${showAdvancedFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'text-gray-600'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <ExportSurgeriesButton 
              surgeries={filteredSurgeries} 
              selectedSurgeries={selectedSurgeries}
            />
            
            <ViewToggle view={view} onViewChange={setView} />
            
            {filteredSurgeries.length > 0 && (
              <Button
                onClick={selectedSurgeries.size === filteredSurgeries.length ? clearSelection : selectAllSurgeries}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {selectedSurgeries.size === filteredSurgeries.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
            
            {selectedSurgeries.size > 0 && (
              <Button
                onClick={() => setShowBulkActions(!showBulkActions)}
                variant="outline"
                size="sm"
                className="bg-purple-50 border-purple-200 text-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {selectedSurgeries.size} Selected
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Additional filters can be added here */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operating Room</label>
                <input
                  type="text"
                  placeholder="Filter by OR..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Surgeon</label>
                <input
                  type="text"
                  placeholder="Filter by surgeon..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedSurgeries.size > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">{selectedSurgeries.size} surgeries selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleBulkStatusUpdate('IN_PROGRESS')}
                  size="sm"
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  Mark In Progress
                </Button>
                <Button
                  onClick={() => handleBulkStatusUpdate('POSTPONED')}
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Postpone
                </Button>
                <Button
                  onClick={handleBulkCancel}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={clearSelection}
                  size="sm"
                  variant="ghost"
                  className="text-gray-600"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {filters.map((status) => {
          const count = status === 'ALL' ? pagination.total : surgeries.filter(s => s.status === status).length
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

      {/* Enterprise Surgery Content - Cards or Table View */}
      {view === 'cards' ? (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredSurgeries.map((surgery) => {
            const isUpcoming = new Date(surgery.scheduledAt) > new Date()
            const isToday = new Date(surgery.scheduledAt).toDateString() === new Date().toDateString()
            const isEmergency = surgery.priority === 'EMERGENCY'
            const isUrgent = surgery.priority === 'URGENT'
            
            return (
              <Card key={surgery.id} className={`group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 border overflow-hidden ${
                isEmergency ? 'border-red-300 bg-red-50/30' : 
                isUrgent ? 'border-orange-300 bg-orange-50/30' :
                isToday ? 'border-blue-300 bg-blue-50/30' : 
                'border-gray-200 hover:border-gray-300'
              }`}>
                
                {/* Enhanced Header with Priority and Selection */}
                <CardHeader className="pb-3 relative">
                  <div className="flex justify-between items-start">
                    {/* Selection Checkbox */}
                    <div className="absolute -top-1 -left-1">
                      <input
                        type="checkbox"
                        checked={selectedSurgeries.has(surgery.id)}
                        onChange={() => toggleSurgerySelection(surgery.id)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    
                    <div className="space-y-2 flex-1 ml-6">
                      {/* Priority Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(surgery.priority)}`}>
                          {getPriorityIcon(surgery.priority)}
                          <span className="ml-1">{surgery.priority}</span>
                        </span>
                        {isToday && (
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            TODAY
                          </span>
                        )}
                      </div>
                      
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {surgery.type}
                      </CardTitle>
                      
                      {/* Date, Time, and OR */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(surgery.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(surgery.scheduledAt)}</span>
                        </div>
                        {surgery.operatingRoom && (
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                              <span className="text-purple-600 text-xs font-bold">OR</span>
                            </div>
                            <span className="font-medium">{surgery.operatingRoom}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={surgery.status} />
                      {surgery.estimatedDuration && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          ~{formatDuration(surgery.estimatedDuration)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Patient Information */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{surgery.patient.name}</p>
                        <p className="text-sm text-gray-600">Age {surgery.patient.age} • ID: {surgery.patient.id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical Team */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Medical Team</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{surgery.surgeon.name}</p>
                          <p className="text-xs text-gray-500">Lead Surgeon</p>
                        </div>
                      </div>
                      
                      {surgery.assistantSurgeon && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{surgery.assistantSurgeon.name}</p>
                            <p className="text-xs text-gray-500">Assistant Surgeon</p>
                          </div>
                        </div>
                      )}
                      
                      {surgery.anesthesiologist && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{surgery.anesthesiologist.name}</p>
                            <p className="text-xs text-gray-500">Anesthesiologist</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration Information */}
                  {(surgery.estimatedDuration || surgery.actualDuration) && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Duration</p>
                          {surgery.estimatedDuration && (
                            <p className="text-xs text-gray-500">Est: {formatDuration(surgery.estimatedDuration)}</p>
                          )}
                        </div>
                        {surgery.actualDuration && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{formatDuration(surgery.actualDuration)}</p>
                            <p className="text-xs text-gray-500">Actual</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Clinical Notes */}
                  {surgery.notes && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                      <p className="text-xs text-amber-800 font-semibold mb-1">Clinical Notes</p>
                      <p className="text-xs text-amber-700 line-clamp-3">{surgery.notes}</p>
                    </div>
                  )}

                  {/* Enterprise Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
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
                        onClick={() => handleCompleteSurgery(surgery)}
                        className="flex-1 text-xs hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelSurgery(surgery)}
                      className="flex-1 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
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

      {/* Pagination */}
      {!loading && surgeries.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={true}
          />
        </div>
      )}

      {/* Cancel Surgery Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelSurgery}
        title="Cancel Surgery"
        message={
          selectedSurgeryForAction 
            ? `Are you sure you want to cancel the ${selectedSurgeryForAction.type} surgery for ${selectedSurgeryForAction.patient.name}? This action cannot be undone.`
            : "Are you sure you want to cancel this surgery?"
        }
        confirmText="Yes, Cancel Surgery"
        cancelText="Keep Surgery"
        type="danger"
        isLoading={isActionLoading}
      />

      {/* Complete Surgery Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={confirmCompleteSurgery}
        title="Mark Surgery as Completed"
        message={
          selectedSurgeryForAction 
            ? `Are you sure you want to mark the ${selectedSurgeryForAction.type} surgery for ${selectedSurgeryForAction.patient.name} as completed?`
            : "Are you sure you want to mark this surgery as completed?"
        }
        confirmText="Mark as Completed"
        cancelText="Cancel"
        type="success"
        isLoading={isActionLoading}
      />
    </div>
  )
}

