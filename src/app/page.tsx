'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Calendar, Shield, Users, Clock } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">SurgeryManager</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Surgery Management
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your healthcare operations with our secure, intuitive surgery scheduling and management system.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/auth/register">
                <Button size="lg" className="w-full">
                  Start Managing Surgeries
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to manage surgeries
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built with healthcare professionals in mind
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-8 w-8 text-blue-600 mx-auto" />
                <CardTitle>Schedule Surgeries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Easily schedule new surgeries with comprehensive patient and surgeon information.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600 mx-auto" />
                <CardTitle>Manage Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Keep track of patient information including age, birth date, and contact details.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-600 mx-auto" />
                <CardTitle>Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track surgery status from scheduled to completed with real-time updates.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600 mx-auto" />
                <CardTitle>Secure & Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built with healthcare security standards and data protection in mind.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-24 bg-blue-50 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Try the Demo
            </h2>
            <p className="text-gray-600 mb-6">
              Experience the system with pre-configured demo accounts
            </p>
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Administrator</h3>
                <p className="text-sm text-gray-500">admin@hospital.com</p>
                <p className="text-sm text-gray-500">password123</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Surgeon</h3>
                <p className="text-sm text-gray-500">surgeon@hospital.com</p>
                <p className="text-sm text-gray-500">password123</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Staff</h3>
                <p className="text-sm text-gray-500">staff@hospital.com</p>
                <p className="text-sm text-gray-500">password123</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              &copy; 2024 SurgeryManager. Built for healthcare professionals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}