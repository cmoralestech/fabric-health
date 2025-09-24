'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import AdvancedPatientSearch from '@/components/patients/AdvancedPatientSearch'
import PatientTableView from '@/components/patients/PatientTableView'
import AddPatientModal from '@/components/patients/AddPatientModal'
import PatientDetailsModal from '@/components/patients/PatientDetailsModal'
import ViewToggle from '@/components/ui/ViewToggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { User, Calendar, Phone, Mail, Activity, MapPin, Clock, FileText, UserPlus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Patient {
  id: string
  name: string
  age: number
  birthDate: string
  email?: string
  phone?: string
  createdAt: string
  surgeryCount: number
}

interface SearchFilters {
  search: string
  ageMin: string
  ageMax: string
  birthYear: string
  birthDate: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function PatientsPage() {
  const { data: session, status } = useSession()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState<'cards' | 'table'>('table') // Default to table view
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    ageMin: '',
    ageMax: '',
    birthYear: '',
    birthDate: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const fetchPatients = useCallback(async (page: number = 1) => {
    setLoading(true)
    try {
            const params = new URLSearchParams({
              page: page.toString(),
              limit: pagination.limit.toString(),
              ...(filters.search && { search: filters.search }),
              ...(filters.ageMin && { ageMin: filters.ageMin }),
              ...(filters.ageMax && { ageMax: filters.ageMax }),
              ...(filters.birthYear && { birthYear: filters.birthYear }),
              ...(filters.birthDate && { birthDate: filters.birthDate }),
              sortBy: filters.sortBy,
              sortOrder: filters.sortOrder
            })

      const response = await fetch(`/api/patients?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit])

  useEffect(() => {
    fetchPatients(1)
  }, [filters])

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    fetchPatients(page)
  }

  const handlePatientAdded = () => {
    fetchPatients(1) // Refresh to first page
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowDetailsModal(true)
  }

  const handleScheduleSurgery = (patientId: string) => {
    // TODO: Implement schedule surgery functionality
    console.log('Schedule surgery for patient:', patientId)
    setShowDetailsModal(false)
    // You could navigate to a schedule surgery page or open another modal
  }

  const getAgeCategory = (age: number) => {
    if (age < 18) return { label: 'Pediatric', color: 'bg-green-100 text-green-800' }
    if (age >= 65) return { label: 'Senior', color: 'bg-purple-100 text-purple-800' }
    return { label: 'Adult', color: 'bg-blue-100 text-blue-800' }
  }

  // Early returns after all hooks
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-gray-600 font-medium">Loading Patient Manager...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Patient Directory</h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-600">
                    {pagination.total} patient{pagination.total !== 1 ? 's' : ''} registered
                  </p>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    {patients.filter(p => p.surgeryCount > 0).length} with surgeries
                  </p>
                </div>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Enhanced Search Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <AdvancedPatientSearch
              onSearch={handleSearch}
              isLoading={loading}
              totalResults={pagination.total}
            />
          </div>

          {/* Enhanced Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200/60">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {loading ? 'Searching...' : `${pagination.total} Patient${pagination.total !== 1 ? 's' : ''}`}
                  </h2>
                  {(filters.search || filters.ageMin || filters.ageMax || filters.birthYear || filters.birthDate) && (
                    <p className="text-sm text-gray-500">Filtered results</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 hidden sm:block">View as:</div>
              <ViewToggle 
                view={viewType} 
                onViewChange={setViewType}
              />
            </div>
          </div>

          {/* Patient Results */}
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-gray-600">Searching patients...</p>
              </div>
            </div>
          ) : viewType === 'table' ? (
            <PatientTableView 
              patients={patients} 
              onViewPatient={handleViewPatient}
              onScheduleSurgery={handleScheduleSurgery}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {patients.map((patient) => {
                const ageCategory = getAgeCategory(patient.age)
                const birthYear = new Date(patient.birthDate).getFullYear()
                
                return (
                  <Card key={patient.id} className="group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 border border-gray-200/60 hover:border-blue-200 bg-white overflow-hidden">
                    <CardContent className="p-0">
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors text-lg">
                                {patient.name}
                              </h3>
                              <p className="text-xs text-gray-500 font-mono">#{patient.id.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 shadow-sm ${ageCategory.color}`}>
                            {ageCategory.label}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Demographics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-gray-900">{patient.age}</div>
                            <div className="text-xs text-gray-500 font-medium">Years Old</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-gray-900">{birthYear}</div>
                            <div className="text-xs text-gray-500 font-medium">Born</div>
                          </div>
                        </div>

                        {/* Contact info */}
                        {(patient.email || patient.phone) && (
                          <div className="space-y-2 py-2 border-y border-gray-100">
                            {patient.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                  <Mail className="w-3 h-3 text-blue-600" />
                                </div>
                                <span className="truncate">{patient.email}</span>
                              </div>
                            )}
                            {patient.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                                  <Phone className="w-3 h-3 text-green-600" />
                                </div>
                                <span>{patient.phone}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Surgery count highlight */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-blue-900">Medical History</span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-900">{patient.surgeryCount}</div>
                              <div className="text-xs text-blue-600">Surgeries</div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-sm font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                            onClick={() => handleScheduleSurgery(patient.id)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </Button>
                        </div>

                        {/* Footer with date */}
                        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                          Patient since {formatDate(patient.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Enhanced Empty State */}
          {patients.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {filters.search || filters.ageMin || filters.ageMax || filters.birthYear || filters.birthDate
                  ? 'No patients match your search'
                  : 'No patients registered yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {filters.search || filters.ageMin || filters.ageMax || filters.birthYear || filters.birthDate
                  ? 'Try adjusting your search filters or clearing them to see all patients.'
                  : 'Start building your patient database by adding your first patient to the system.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(filters.search || filters.ageMin || filters.ageMax || filters.birthYear || filters.birthDate) && (
                  <Button 
                    variant="outline"
                    onClick={() => setFilters({
                      search: '',
                      ageMin: '',
                      ageMax: '',
                      birthYear: '',
                      birthDate: '',
                      sortBy: 'name',
                      sortOrder: 'asc'
                    })}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setShowAddModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {filters.search || filters.ageMin || filters.ageMax || filters.birthYear || filters.birthDate ? 'Add New Patient' : 'Add First Patient'}
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Pagination */}
          {patients.length > 0 && pagination.totalPages > 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-semibold text-gray-900">{pagination.total}</span> patients
                </div>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPatientAdded={handlePatientAdded}
      />

      <PatientDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        patient={selectedPatient}
        onScheduleSurgery={handleScheduleSurgery}
      />
    </div>
  )
}
