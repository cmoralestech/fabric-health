'use client'

import { useState } from 'react'
import { formatDateTime, formatDate, formatTime } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Clock, 
  User, 
  UserCheck, 
  Edit, 
  Trash2, 
  CheckCircle,
  ChevronUp,
  ChevronDown,
  MoreVertical
} from 'lucide-react'

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

interface SurgeryTableViewProps {
  surgeries: Surgery[]
  onEditSurgery: (surgery: Surgery) => void
  onCancelSurgery: (surgery: Surgery) => void
  onCompleteSurgery: (surgery: Surgery) => void
}

type SortField = 'scheduledAt' | 'type' | 'patient' | 'surgeon' | 'status'
type SortOrder = 'asc' | 'desc'

export default function SurgeryTableView({ 
  surgeries, 
  onEditSurgery, 
  onCancelSurgery, 
  onCompleteSurgery 
}: SurgeryTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('scheduledAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedSurgeries = [...surgeries].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortField) {
      case 'scheduledAt':
        aValue = new Date(a.scheduledAt)
        bValue = new Date(b.scheduledAt)
        break
      case 'type':
        aValue = a.type.toLowerCase()
        bValue = b.type.toLowerCase()
        break
      case 'patient':
        aValue = a.patient.name.toLowerCase()
        bValue = b.patient.name.toLowerCase()
        break
      case 'surgeon':
        aValue = a.surgeon.name.toLowerCase()
        bValue = b.surgeon.name.toLowerCase()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left font-medium text-gray-900 hover:text-blue-600 transition-colors"
    >
      {children}
      {sortField === field && (
        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <SortButton field="scheduledAt">Date & Time</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="type">Surgery Type</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="patient">Patient</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="surgeon">Surgeon</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSurgeries.map((surgery) => {
              const isExpanded = expandedRows.has(surgery.id)
              const isToday = new Date(surgery.scheduledAt).toDateString() === new Date().toDateString()
              
              return (
                <>
                  <tr key={surgery.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(surgery.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(surgery.scheduledAt)}</span>
                        </div>
                        {isToday && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{surgery.type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{surgery.patient.name}</div>
                          <div className="text-sm text-gray-500">Age {surgery.patient.age}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{surgery.surgeon.name}</div>
                          <div className="text-sm text-gray-500">Surgeon</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={surgery.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditSurgery(surgery)}
                          className="text-xs hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {surgery.status === 'SCHEDULED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCancelSurgery(surgery)}
                            className="text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {surgery.status === 'IN_PROGRESS' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCompleteSurgery(surgery)}
                            className="text-xs hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        {surgery.notes && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(surgery.id)}
                            className="text-xs"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && surgery.notes && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 bg-amber-50 border-t border-amber-200">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center mt-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-amber-800 mb-1">Clinical Notes</div>
                            <div className="text-sm text-amber-700">{surgery.notes}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

