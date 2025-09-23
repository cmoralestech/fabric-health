'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createSurgerySchema, createPatientSchema, surgeryTypes } from '@/lib/validations'

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
  role: string
}

interface ScheduleSurgeryFormProps {
  onClose: () => void
  onSuccess: () => void
}

const combinedSchema = z.object({
  surgery: createSurgerySchema.omit({ patientId: true }).extend({
    patientId: z.string().optional()
  }),
  patient: createPatientSchema.optional(),
  isNewPatient: z.boolean()
})

type FormData = z.infer<typeof combinedSchema>

export default function ScheduleSurgeryForm({ onClose, onSuccess }: ScheduleSurgeryFormProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [surgeons, setSurgeons] = useState<Surgeon[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNewPatient, setIsNewPatient] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      isNewPatient: true,
      surgery: {
        scheduledAt: '',
        type: surgeryTypes[0],
        surgeonId: '',
        notes: ''
      }
    }
  })

  // Fetch patients and surgeons
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, surgeonsRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/users/surgeons')
        ])
        
        if (patientsRes.ok) {
          const patientsData = await patientsRes.json()
          setPatients(patientsData)
        }
        
        if (surgeonsRes.ok) {
          const surgeonsData = await surgeonsRes.json()
          setSurgeons(surgeonsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const payload = {
        surgery: data.surgery,
        patient: isNewPatient ? data.patient : undefined
      }

      const response = await fetch('/api/surgeries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to schedule surgery')
      }
    } catch (error) {
      console.error('Error scheduling surgery:', error)
      alert('Failed to schedule surgery')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum datetime (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Schedule New Surgery</CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Patient Information</h3>
              
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={isNewPatient ? 'primary' : 'outline'}
                  onClick={() => {
                    setIsNewPatient(true)
                    setValue('isNewPatient', true)
                    setValue('surgery.patientId', '')
                  }}
                >
                  New Patient
                </Button>
                <Button
                  type="button"
                  variant={!isNewPatient ? 'primary' : 'outline'}
                  onClick={() => {
                    setIsNewPatient(false)
                    setValue('isNewPatient', false)
                  }}
                >
                  Existing Patient
                </Button>
              </div>

              {isNewPatient ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Patient Name *"
                    {...register('patient.name')}
                    error={errors.patient?.name?.message}
                  />
                  <Input
                    label="Birth Date *"
                    type="date"
                    {...register('patient.birthDate')}
                    error={errors.patient?.birthDate?.message}
                  />
                  <Input
                    label="Email"
                    type="email"
                    {...register('patient.email')}
                    error={errors.patient?.email?.message}
                  />
                  <Input
                    label="Phone"
                    {...register('patient.phone')}
                    error={errors.patient?.phone?.message}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Patient *
                  </label>
                  <select
                    {...register('surgery.patientId')}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} (Age {patient.age})
                      </option>
                    ))}
                  </select>
                  {errors.surgery?.patientId && (
                    <p className="text-sm text-red-600 mt-1">{errors.surgery.patientId.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Surgery Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Surgery Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surgery Type *
                  </label>
                  <select
                    {...register('surgery.type')}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {surgeryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.surgery?.type && (
                    <p className="text-sm text-red-600 mt-1">{errors.surgery.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surgeon *
                  </label>
                  <select
                    {...register('surgery.surgeonId')}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select a surgeon...</option>
                    {surgeons.map((surgeon) => (
                      <option key={surgeon.id} value={surgeon.id}>
                        Dr. {surgeon.name}
                      </option>
                    ))}
                  </select>
                  {errors.surgery?.surgeonId && (
                    <p className="text-sm text-red-600 mt-1">{errors.surgery.surgeonId.message}</p>
                  )}
                </div>
              </div>

              <Input
                label="Scheduled Date & Time *"
                type="datetime-local"
                min={getMinDateTime()}
                {...register('surgery.scheduledAt')}
                error={errors.surgery?.scheduledAt?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('surgery.notes')}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Any additional notes or special instructions..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Schedule Surgery
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
