'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import SurgeryList from '@/components/surgeries/SurgeryList'
import ScheduleSurgeryForm from '@/components/surgeries/ScheduleSurgeryForm'
import Navbar from '@/components/layout/Navbar'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  const handleScheduleSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SurgeryList
          key={refreshKey}
          onScheduleNew={() => setShowScheduleForm(true)}
          onEditSurgery={(surgery) => {
            // TODO: Implement edit functionality
            console.log('Edit surgery:', surgery)
          }}
        />
      </main>

      {showScheduleForm && (
        <ScheduleSurgeryForm
          onClose={() => setShowScheduleForm(false)}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </div>
  )
}
