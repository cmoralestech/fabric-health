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
  const [viewType, setViewType] = useState<'card' | 'table'>('table') // Default to table view
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Professional Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Patient Directory</h1>
              <p className="text-sm text-gray-600 mt-1">
                {pagination.total} patient{pagination.total !== 1 ? 's' : ''} • {patients.filter(p => p.surgeryCount > 0).length} with surgeries
              </p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>

          {/* Advanced Search */}
          <AdvancedPatientSearch
            onSearch={handleSearch}
            isLoading={loading}
            totalResults={pagination.total}
          />

          {/* View Toggle and Results Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {pagination.total} Patient{pagination.total !== 1 ? 's' : ''} Found
              </h2>
              {(filters.search || filters.ageMin || filters.ageMax || filters.birthYear || filters.birthDate) && (
                <span className="text-sm text-gray-500">
                  • Filtered results
                </span>
              )}
            </div>
            <ViewToggle 
              view={viewType} 
              onViewChange={setViewType}
              className="shadow-sm"
            />
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {patients.map((patient) => {
                const ageCategory = getAgeCategory(patient.age)
                const birthYear = new Date(patient.birthDate).getFullYear()
                
                return (
                  <Card key={patient.id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
                    <CardContent className="p-4">
                      {/* Header with avatar and basic info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                              {patient.name}
                            </h3>
                            <p className="text-xs text-gray-500">ID: {patient.id.slice(-8)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${ageCategory.color}`}>
                          {ageCategory.label}
                        </span>
                      </div>

                      {/* Compact demographics */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Age</span>
                          <span className="font-medium">{patient.age}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Born</span>
                          <span className="font-medium">{birthYear}</span>
                        </div>
                      </div>

                      {/* Contact info (compact) */}
                      {(patient.email || patient.phone) && (
                        <div className="space-y-1 mb-3 text-xs">
                          {patient.email && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{patient.email}</span>
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="w-3 h-3" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Surgery count */}
                      <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">Surgeries</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                          {patient.surgeryCount}
                        </span>
                      </div>

                      {/* Compact actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                          onClick={() => handleViewPatient(patient)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          onClick={() => handleScheduleSurgery(patient.id)}
                        >
                          Schedule
                        </Button>
                      </div>

                      {/* Added date (very compact) */}
                      <div className="text-xs text-gray-400 mt-2 text-center">
                        Added {formatDate(patient.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {patients.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500 mb-6">
                {filters.search || filters.ageMin || filters.ageMax || filters.birthYear || filters.birthDate
                  ? 'Try adjusting your search filters.'
                  : 'Patients will appear here as you add them to the system.'}
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowAddModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Patient
              </Button>
            </div>
          )}

          {/* Pagination */}
          {patients.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              className="bg-white rounded-lg p-4 shadow-sm"
            />
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
