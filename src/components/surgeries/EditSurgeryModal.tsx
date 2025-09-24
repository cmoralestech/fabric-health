'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { X, Calendar, User, Clock, FileText, Save, Loader2, Edit } from 'lucide-react'

interface Surgery {
  id: string
  scheduledAt: string
  type: string
  status: string
  notes?: string
  patient: {
    id: string
    name: string
    age: number
    email?: string
    phone?: string
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

interface Surgeon {
  id: string
  name: string
  email: string
}

interface EditSurgeryModalProps {
  isOpen: boolean
  onClose: () => void
  surgery: Surgery | null
  onSurgeryUpdated: () => void
}

interface SurgeryFormData {
  surgeonId: string
  scheduledAt: string
  type: string
  status: string
  notes: string
}

const surgeryTypes = [
  'Appendectomy',
  'Cholecystectomy',
  'Hernia Repair',
  'Knee Replacement',
  'Hip Replacement',
  'Cataract Surgery',
  'Coronary Bypass',
  'Gallbladder Removal',
  'Tonsillectomy',
  'Other'
]

const surgeryStatuses = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'text-blue-700 bg-blue-100' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'text-yellow-700 bg-yellow-100' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-green-700 bg-green-100' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-700 bg-red-100' },
  { value: 'POSTPONED', label: 'Postponed', color: 'text-purple-700 bg-purple-100' }
]

export default function EditSurgeryModal({ 
  isOpen, 
  onClose, 
  surgery,
  onSurgeryUpdated 
}: EditSurgeryModalProps) {
  const [formData, setFormData] = useState<SurgeryFormData>({
    surgeonId: '',
    scheduledAt: '',
    type: '',
    status: '',
    notes: ''
  })
  const [surgeons, setSurgeons] = useState<Surgeon[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<SurgeryFormData>>({})

  // Populate form when surgery changes
  useEffect(() => {
    if (surgery) {
      setFormData({
        surgeonId: surgery.surgeon.id,
        scheduledAt: new Date(surgery.scheduledAt).toISOString().slice(0, 16),
        type: surgery.type,
        status: surgery.status,
        notes: surgery.notes || ''
      })
    }
  }, [surgery])

  // Fetch surgeons when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSurgeons()
    }
  }, [isOpen])

  const fetchSurgeons = async () => {
    try {
      const response = await fetch('/api/users/surgeons')
      if (response.ok) {
        const data = await response.json()
        setSurgeons(data)
      }
    } catch (error) {
      console.error('Error fetching surgeons:', error)
    }
  }

  const handleInputChange = (field: keyof SurgeryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<SurgeryFormData> = {}
    
    if (!formData.surgeonId) newErrors.surgeonId = 'Surgeon is required'
    if (!formData.scheduledAt) newErrors.scheduledAt = 'Date and time are required'
    if (!formData.type) newErrors.type = 'Surgery type is required'
    if (!formData.status) newErrors.status = 'Status is required'
    
    // Validate future date only for scheduled surgeries
    if (formData.scheduledAt && formData.status === 'SCHEDULED') {
      const scheduledDate = new Date(formData.scheduledAt)
      const now = new Date()
      if (scheduledDate <= now) {
        newErrors.scheduledAt = 'Scheduled surgeries must be set for a future date and time'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !surgery) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/surgeries/${surgery.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surgeonId: formData.surgeonId,
          scheduledAt: formData.scheduledAt,
          type: formData.type,
          status: formData.status,
          notes: formData.notes.trim() || undefined,
        }),
      })

      if (response.ok) {
        onSurgeryUpdated()
        onClose()
      } else {
        const errorData = await response.json()
        console.error('Failed to update surgery:', errorData)
      }
    } catch (error) {
      console.error('Error updating surgery:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!isOpen || !surgery) return null

  const currentStatus = surgeryStatuses.find(s => s.value === surgery.status)

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Edit Surgery
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Surgery Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{surgery.type}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${currentStatus?.color}`}>
                {currentStatus?.label}
              </span>
            </div>
            <p className="text-sm text-gray-600">Surgery ID: {surgery.id.slice(-8)}</p>
            <p className="text-sm text-gray-600">Scheduled by: {surgery.scheduledBy.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Surgeon Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Surgeon *
              </label>
              <select
                value={formData.surgeonId}
                onChange={(e) => handleInputChange('surgeonId', e.target.value)}
                className={`w-full h-10 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.surgeonId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select a surgeon</option>
                {surgeons.map(surgeon => (
                  <option key={surgeon.id} value={surgeon.id}>
                    {surgeon.name}
                  </option>
                ))}
              </select>
              {errors.surgeonId && (
                <p className="text-sm text-red-600">{errors.surgeonId}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Date and Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                className={errors.scheduledAt ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.scheduledAt && (
                <p className="text-sm text-red-600">{errors.scheduledAt}</p>
              )}
            </div>

            {/* Surgery Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Surgery Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={`w-full h-10 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.type ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select surgery type</option>
                {surgeryTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={`w-full h-10 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.status ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select status</option>
                {surgeryStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or special instructions..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Surgery
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

