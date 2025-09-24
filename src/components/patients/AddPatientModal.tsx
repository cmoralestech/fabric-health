'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { X, User, Calendar, Mail, Phone, Save, Loader2 } from 'lucide-react'

interface AddPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onPatientAdded: () => void
}

interface PatientFormData {
  name: string
  birthDate: string
  age: string
  email: string
  phone: string
}

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    birthDate: '',
    age: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<PatientFormData>>({})

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return ''
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age.toString()
  }

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-calculate age when birth date changes
      ...(field === 'birthDate' && { age: calculateAge(value) })
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<PatientFormData> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required'
    if (!formData.age || parseInt(formData.age) < 0) newErrors.age = 'Valid age is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          birthDate: formData.birthDate,
          age: parseInt(formData.age),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
        }),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          birthDate: '',
          age: '',
          email: '',
          phone: ''
        })
        setErrors({})
        onPatientAdded()
        onClose()
      } else {
        const errorData = await response.json()
        console.error('Failed to add patient:', errorData)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error adding patient:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Add New Patient
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter patient's full name"
                className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth *
              </label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className={errors.birthDate ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-600">{errors.birthDate}</p>
              )}
            </div>

            {/* Age (auto-calculated) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Age
              </label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Age (auto-calculated)"
                min="0"
                max="150"
                className={errors.age ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.age && (
                <p className="text-sm text-red-600">{errors.age}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="patient@example.com"
                className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Add Patient
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
