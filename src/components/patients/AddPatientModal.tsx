'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { X, User, Calendar, Mail, Phone, Save, Loader2, Shield, Users, MapPin, AlertTriangle, Heart } from 'lucide-react'

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
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  insuranceProvider: string
  insuranceNumber: string
  allergies: string
  medicalConditions: string
}

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    birthDate: '',
    age: '',
    email: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    insuranceProvider: '',
    insuranceNumber: '',
    allergies: '',
    medicalConditions: ''
  })
  const [currentStep, setCurrentStep] = useState(1)
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

  const validateStep = (step: number) => {
    const newErrors: Partial<PatientFormData> = {}
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required'
      if (!formData.birthDate) newErrors.birthDate = 'Date of birth is required'
      if (!formData.age || parseInt(formData.age) < 0) newErrors.age = 'Valid age is required'
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }
    
    if (step === 2) {
      if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required'
      if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required'
      if (!formData.emergencyContactRelation.trim()) newErrors.emergencyContactRelation = 'Relationship is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateForm = () => {
    return validateStep(1) && validateStep(2)
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
          address: formData.address.trim() || undefined,
          emergencyContactName: formData.emergencyContactName.trim() || undefined,
          emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
          emergencyContactRelation: formData.emergencyContactRelation.trim() || undefined,
          insuranceProvider: formData.insuranceProvider.trim() || undefined,
          insuranceNumber: formData.insuranceNumber.trim() || undefined,
          allergies: formData.allergies.trim() || undefined,
          medicalConditions: formData.medicalConditions.trim() || undefined,
        }),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          birthDate: '',
          age: '',
          email: '',
          phone: '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          insuranceProvider: '',
          insuranceNumber: '',
          allergies: '',
          medicalConditions: ''
        })
        setCurrentStep(1)
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleClose = () => {
    setFormData({
      name: '',
      birthDate: '',
      age: '',
      email: '',
      phone: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      insuranceProvider: '',
      insuranceNumber: '',
      allergies: '',
      medicalConditions: ''
    })
    setCurrentStep(1)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const totalSteps = 3

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                New Patient Registration
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Step {currentStep} of {totalSteps}: {
                  currentStep === 1 ? 'Personal Information' :
                  currentStep === 2 ? 'Emergency Contact & Insurance' :
                  'Medical Information'
                }
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-600 mt-1">Let's start with the patient's basic information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter patient's full name"
                      className={`h-12 ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth *
                    </label>
                    <Input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className={`h-12 ${errors.birthDate ? 'border-red-300 focus:border-red-500' : ''}`}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.birthDate && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.birthDate}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Age
                    </label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="Auto-calculated"
                      min="0"
                      max="150"
                      className={`h-12 bg-gray-50 ${errors.age ? 'border-red-300 focus:border-red-500' : ''}`}
                      readOnly
                    />
                    {errors.age && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.age}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="patient@example.com"
                      className={`h-12 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className={`h-12 ${errors.phone ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Street address, City, State, ZIP"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Emergency Contact & Insurance */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Contact & Insurance</h3>
                  <p className="text-sm text-gray-600 mt-1">Important contact and insurance information</p>
                </div>

                <div className="space-y-6">
                  {/* Emergency Contact Section */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-red-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Emergency Contact Information *
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Contact Name *
                        </label>
                        <Input
                          type="text"
                          value={formData.emergencyContactName}
                          onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                          placeholder="Emergency contact's full name"
                          className={`h-12 ${errors.emergencyContactName ? 'border-red-300 focus:border-red-500' : ''}`}
                        />
                        {errors.emergencyContactName && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {errors.emergencyContactName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Contact Phone *
                        </label>
                        <Input
                          type="tel"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className={`h-12 ${errors.emergencyContactPhone ? 'border-red-300 focus:border-red-500' : ''}`}
                        />
                        {errors.emergencyContactPhone && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {errors.emergencyContactPhone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Relationship *
                        </label>
                        <select
                          value={formData.emergencyContactRelation}
                          onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                          className={`w-full h-12 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                            errors.emergencyContactRelation ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                        >
                          <option value="">Select relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Child">Child</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.emergencyContactRelation && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {errors.emergencyContactRelation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Insurance Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Insurance Provider
                        </label>
                        <Input
                          type="text"
                          value={formData.insuranceProvider}
                          onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                          placeholder="e.g., Blue Cross, Aetna, Medicare"
                          className="h-12"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Policy/Member ID
                        </label>
                        <Input
                          type="text"
                          value={formData.insuranceNumber}
                          onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                          placeholder="Insurance ID number"
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Medical Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                  <p className="text-sm text-gray-600 mt-1">Important medical history and conditions</p>
                </div>

                <div className="space-y-6">
                  {/* Allergies */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-yellow-900 mb-3 block flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Known Allergies
                    </label>
                    <textarea
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="List any known allergies (medications, foods, environmental, etc.)"
                      rows={3}
                      className="w-full rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                    />
                    <p className="text-xs text-yellow-700 mt-2">
                      Please be specific about allergic reactions and severity
                    </p>
                  </div>

                  {/* Medical Conditions */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <label className="text-sm font-semibold text-green-900 mb-3 block flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Current Medical Conditions
                    </label>
                    <textarea
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      placeholder="List current medical conditions, chronic illnesses, or ongoing treatments"
                      rows={3}
                      className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                    <p className="text-xs text-green-700 mt-2">
                      Include any medications currently being taken
                    </p>
                  </div>

                  {/* HIPAA Notice */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">HIPAA Privacy Notice</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          By submitting this information, you acknowledge that this medical information will be 
                          protected under HIPAA regulations and will only be used for healthcare purposes by 
                          authorized medical personnel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registering Patient...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className={`${currentStep === 1 ? 'flex-1' : ''} h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-200`}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
