'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

// Full footer for public/marketing pages
export function FullFooter() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">SurgeryManager</h3>
            </div>
            <p className="text-sm text-gray-600">
              HIPAA-compliant healthcare management platform for medical professionals.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal & Compliance</h3>
            <div className="space-y-2">
              <Link
                href="/compliance"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                HIPAA Compliance
              </Link>
              <Link
                href="/privacy-policy"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/security-report"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Security Report
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Privacy Officer: privacy@surgerymanager.com</p>
              <p>Support: 1-800-SURGERY</p>
              <p>Security: security@surgerymanager.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              &copy; 2024 SurgeryManager. All rights reserved. Built for healthcare professionals.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>🔒 HIPAA Compliant</span>
              <span>•</span>
              <span>🛡️ SOC 2 Certified</span>
              <span>•</span>
              <span>⚡ 99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Simple footer for legal/compliance pages
export function SimpleFooter({ lastUpdated, effectiveDate }: { 
  lastUpdated?: string, 
  effectiveDate?: string 
}) {
  return (
    <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
      {lastUpdated && (
        <p>
          Last updated: {lastUpdated}
        </p>
      )}
      {effectiveDate && (
        <p>
          This document is effective as of {effectiveDate}
        </p>
      )}
      <p className="mt-2">
        © 2024 SurgeryManager. All rights reserved.
      </p>
      <div className="flex justify-center space-x-4 mt-3">
        <Link href="/compliance" className="text-blue-600 hover:text-blue-700 text-xs">
          Compliance
        </Link>
        <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 text-xs">
          Privacy
        </Link>
        <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-700 text-xs">
          Terms
        </Link>
      </div>
    </div>
  )
}

// Minimal footer for authentication pages
export function MinimalFooter() {
  return (
    <footer className="mt-8 py-6 border-t border-gray-200">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/compliance" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            HIPAA Compliance
          </Link>
          <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          © 2024 SurgeryManager. Healthcare professionals trust us with their data.
        </p>
        <div className="flex justify-center items-center space-x-2 text-xs text-gray-400 mt-2">
          <span>🔒 HIPAA Secure</span>
          <span>•</span>
          <span>🛡️ SOC 2 Certified</span>
        </div>
      </div>
    </footer>
  )
}

// App footer for authenticated application pages (subtle, non-intrusive)
export function AppFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-xs text-gray-500">
              © 2024 SurgeryManager
            </p>
            <div className="flex space-x-3">
              <Link href="/compliance" className="text-xs text-gray-400 hover:text-gray-600">
                Compliance
              </Link>
              <Link href="/privacy-policy" className="text-xs text-gray-400 hover:text-gray-600">
                Privacy
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>🔒 HIPAA Compliant</span>
            <span>•</span>
            <span>System Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
