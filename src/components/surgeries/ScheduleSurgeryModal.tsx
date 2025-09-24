'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { X, Calendar, User, Clock, FileText, Save, Loader2 } from 'lucide-react'

interface Patient {
  id: string
  name: string
  age: number
  birthDate: string
}

interface Surgeon {
  id: string
  name: string
  email: string
}

interface ScheduleSurgeryModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  onSurgeryScheduled: () => void
}

interface SurgeryFormData {
  patientId: string
  surgeonId: string
  scheduledAt: string
  type: string
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

export default function ScheduleSurgeryModal({ 
  isOpen, 
  onClose, 
  patient,
  onSurgeryScheduled 
}: ScheduleSurgeryModalProps) {
  const [formData, setFormData] = useState<SurgeryFormData>({
    patientId: '',
    surgeonId: '',
    scheduledAt: '',
    type: '',
    notes: ''
  })
  const [surgeons, setSurgeons] = useState<Surgeon[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<SurgeryFormData>>({})

  // Set patient ID when patient changes
  useEffect(() => {
    if (patient) {
      setFormData(prev => ({ ...prev, patientId: patient.id }))
    }
  }, [patient])

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
    
    // Validate future date
    if (formData.scheduledAt) {
      const scheduledDate = new Date(formData.scheduledAt)
      const now = new Date()
      if (scheduledDate <= now) {
        newErrors.scheduledAt = 'Surgery must be scheduled for a future date and time'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/surgeries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: formData.patientId,
          surgeonId: formData.surgeonId,
          scheduledAt: formData.scheduledAt,
          type: formData.type,
          notes: formData.notes.trim() || undefined,
        }),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          patientId: patient?.id || '',
          surgeonId: '',
          scheduledAt: '',
          type: '',
          notes: ''
        })
        setErrors({})
        onSurgeryScheduled()
        onClose()
      } else {
        const errorData = await response.json()
        console.error('Failed to schedule surgery:', errorData)
      }
    } catch (error) {
      console.error('Error scheduling surgery:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      patientId: '',
      surgeonId: '',
      scheduledAt: '',
      type: '',
      notes: ''
    })
    setErrors({})
    onClose()
  }

  if (!isOpen || !patient) return null

  // Get minimum datetime (1 hour from now)
  const minDateTime = new Date()
  minDateTime.setHours(minDateTime.getHours() + 1)
  const minDateTimeString = minDateTime.toISOString().slice(0, 16)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Schedule Surgery
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
          {/* Patient Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">{patient.name}</h3>
                <p className="text-sm text-blue-700">Age {patient.age} • ID: {patient.id.slice(-8)}</p>
              </div>
            </div>
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
                min={minDateTimeString}
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
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Schedule Surgery
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

