'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import SurgeryList from '@/components/surgeries/SurgeryList'
import ScheduleSurgeryForm from '@/components/surgeries/ScheduleSurgeryForm'
import EditSurgeryModal from '@/components/surgeries/EditSurgeryModal'
import Navbar from '@/components/layout/Navbar'

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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading Surgery Manager...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  const handleScheduleSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleEditSurgery = (surgery: Surgery) => {
    setSelectedSurgery(surgery)
    setShowEditModal(true)
  }

  const handleEditClose = () => {
    setShowEditModal(false)
    setSelectedSurgery(null)
  }

  const handleEditSuccess = () => {
    setRefreshKey(prev => prev + 1)
    handleEditClose()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
          <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <SurgeryList
          key={refreshKey}
          onScheduleNew={() => setShowScheduleForm(true)}
          onEditSurgery={handleEditSurgery}
        />
      </main>

      {showScheduleForm && (
        <ScheduleSurgeryForm
          onClose={() => setShowScheduleForm(false)}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {showEditModal && (
        <EditSurgeryModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          surgery={selectedSurgery}
          onSurgeryUpdated={handleEditSuccess}
        />
      )}
    </div>
  )
}
