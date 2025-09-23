import { z } from 'zod'

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'SURGEON', 'STAFF']).default('STAFF')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Patient validation schemas
export const createPatientSchema = z.object({
  name: z.string().min(2, 'Patient name must be at least 2 characters'),
  birthDate: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const today = new Date()
    return parsedDate <= today && parsedDate >= new Date('1900-01-01')
  }, 'Invalid birth date'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal(''))
})

// Surgery validation schemas
export const surgeryTypes = [
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
] as const

export const createSurgerySchema = z.object({
  scheduledAt: z.string().refine((date) => {
    const scheduledDate = new Date(date)
    const now = new Date()
    return scheduledDate > now
  }, 'Surgery must be scheduled for a future date and time'),
  type: z.enum(surgeryTypes, {
    errorMap: () => ({ message: 'Please select a valid surgery type' })
  }),
  patientId: z.string().min(1, 'Patient is required'),
  surgeonId: z.string().min(1, 'Surgeon is required'),
  notes: z.string().optional()
})

export const updateSurgerySchema = z.object({
  scheduledAt: z.string().optional(),
  type: z.enum(surgeryTypes).optional(),
  patientId: z.string().optional(),
  surgeonId: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED']).optional()
})

// Helper function to calculate age
export const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '')
}

export const sanitizePatientData = (data: any) => {
  return {
    ...data,
    name: sanitizeString(data.name),
    email: data.email ? sanitizeString(data.email) : null,
    phone: data.phone ? sanitizeString(data.phone) : null
  }
}
