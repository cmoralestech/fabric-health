'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface TestData {
  users: any[]
  patients: any[]
  surgeries: any[]
  counts: {
    users: number
    patients: number
    surgeries: number
  }
}

export default function TestDataPage() {
  const [data, setData] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/test-data')
        if (response.ok) {
          const testData = await response.json()
          setData(testData)
        } else {
          setError('Failed to fetch test data')
        }
      } catch (err) {
        setError('Error fetching data: ' + err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Data Verification</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.counts.users}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.counts.patients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Surgeries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.counts.surgeries}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data?.users.map((user) => (
                  <div key={user.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-blue-600">{user.role}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data?.patients.map((patient) => (
                  <div key={patient.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-600">Age: {patient.age}</div>
                    <div className="text-xs text-gray-500">{patient.email}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Surgeries */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Surgeries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data?.surgeries.map((surgery) => (
                  <div key={surgery.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{surgery.type}</div>
                    <div className="text-sm text-gray-600">
                      Patient: {surgery.patient.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Surgeon: {surgery.surgeon.name}
                    </div>
                    <div className="text-xs text-green-600">{surgery.status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">Demo Login Credentials:</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Admin:</strong> admin@hospital.com / password123</div>
            <div><strong>Surgeon:</strong> surgeon@hospital.com / password123</div>
            <div><strong>Staff:</strong> staff@hospital.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  )
}
