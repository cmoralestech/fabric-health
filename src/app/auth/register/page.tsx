'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createUserSchema, INVITATION_CODES } from '@/lib/validations'
import Link from 'next/link'

type RegisterData = {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'SURGEON' | 'STAFF'
  invitationCode: string
  medicalLicense?: string
  hipaaAcknowledgment: boolean
}

export default function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'SURGEON' | 'STAFF'>('STAFF')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'STAFF',
      hipaaAcknowledgment: false
    }
  })

  const watchedRole = watch('role')
  
  useEffect(() => {
    setSelectedRole(watchedRole)
  }, [watchedRole])

  const onSubmit = async (data: RegisterData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create account')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Account created successfully!</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Redirecting to sign in page...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">SurgeryManager</h1>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the secure healthcare management system
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <Card>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              Join the secure healthcare management system
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>
                
                <Input
                  label="Full Name"
                  autoComplete="name"
                  {...register('name')}
                  error={errors.name?.message}
                />

                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
                      <div>• 12+ characters</div>
                      <div>• Uppercase letter</div>
                      <div>• Lowercase letter</div>
                      <div>• Number (0-9)</div>
                      <div className="sm:col-span-2">• Special character (!@#$%^&*)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Professional Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    {...register('role')}
                    className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  >
                    <option value="STAFF">Staff - General healthcare support staff</option>
                    <option value="SURGEON">Surgeon - Licensed medical doctor</option>
                    <option value="ADMIN">Administrator - System administrator</option>
                  </select>
                  {errors.role && (
                    <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                  )}
                </div>

                {/* Medical License for Surgeons */}
                {selectedRole === 'SURGEON' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <Input
                      label="Medical License Number"
                      placeholder="Enter your medical license number"
                      {...register('medicalLicense')}
                      error={errors.medicalLicense?.message}
                    />
                    <p className="text-xs text-blue-600 mt-2">
                      Required for surgeons to verify medical credentials
                    </p>
                  </div>
                )}

                <Input
                  label="Invitation Code"
                  placeholder="Enter your invitation code"
                  {...register('invitationCode')}
                  error={errors.invitationCode?.message}
                />
              </div>

              {/* HIPAA Compliance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Compliance Agreement
                </h3>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      {...register('hipaaAcknowledgment')}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 mb-2">
                        HIPAA Compliance Acknowledgment
                      </p>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        I acknowledge that I understand and will comply with all HIPAA regulations 
                        regarding the protection of patient health information. I understand that 
                        unauthorized access, use, or disclosure of protected health information 
                        is prohibited and may result in civil and criminal penalties.
                      </p>
                    </div>
                  </div>
                  {errors.hipaaAcknowledgment && (
                    <p className="text-sm text-red-600 mt-2 ml-7">{errors.hipaaAcknowledgment.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-12 text-base font-semibold"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full">
                    Sign in instead
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment - Test Invitation Codes */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">📝 Assessment - Test Invitation Codes:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="font-medium text-blue-900">Admin</div>
              <div className="text-blue-700 mt-1">ADMIN-2024</div>
              <div className="text-blue-700">DEMO-ADMIN</div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="font-medium text-blue-900">Surgeon</div>
              <div className="text-blue-700 mt-1">SURGEON-2024</div>
              <div className="text-blue-700">DEMO-SURGEON</div>
            </div>
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="font-medium text-blue-900">Staff</div>
              <div className="text-blue-700 mt-1">STAFF-2024</div>
              <div className="text-blue-700">DEMO-STAFF</div>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3 text-center">
            💡 In production, invitation codes would be securely generated and sent via email
          </p>
        </div>
      </div>
    </div>
  )
}

