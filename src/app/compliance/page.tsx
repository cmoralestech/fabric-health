"use client";

import {
  Shield,
  Lock,
  Eye,
  FileCheck,
  Users,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SimpleFooter } from "@/components/layout/Footer";
import Link from "next/link";

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  SurgeryManager
                </h1>
                <p className="text-sm text-gray-600">
                  Healthcare Compliance & Security
                </p>
              </div>
            </Link>
            <Link
              href="/auth/signin"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HIPAA Compliant Healthcare Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            SurgeryManager is built with healthcare compliance at its core,
            implementing comprehensive security measures to protect patient
            health information and ensure regulatory compliance.
          </p>
        </div>

        {/* Compliance Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">HIPAA Compliant</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-green-700 text-sm">
                Full compliance with HIPAA Privacy and Security Rules for
                protecting patient health information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-800">
                Enterprise Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-700 text-sm">
                Bank-level encryption, secure authentication, and comprehensive
                audit logging.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-purple-800">Audit Ready</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-purple-700 text-sm">
                Complete audit trails, documentation, and compliance reporting
                capabilities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* HIPAA Compliance Details */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              HIPAA Compliance Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  Administrative Safeguards
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Assigned Security Officer
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Workforce Training Program
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Access Management Procedures
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Security Incident Procedures
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Contingency Planning
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-5 h-5 text-blue-600 mr-2" />
                  Physical Safeguards
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Facility Access Controls
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Workstation Use Restrictions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Device and Media Controls
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Secure Data Disposal
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Environmental Protections
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileCheck className="w-5 h-5 text-purple-600 mr-2" />
                  Technical Safeguards
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Unique User Identification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Automatic Logoff
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Encryption & Decryption
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Audit Controls
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Transmission Security
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Lock className="w-6 h-6 text-blue-600 mr-3" />
              Security Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Data Encryption
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• TLS 1.3 encryption for all data in transit</li>
                    <li>• AES-256 encryption for data at rest</li>
                    <li>
                      • End-to-end encryption for sensitive communications
                    </li>
                    <li>• Encrypted database storage with key rotation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Access Controls
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Multi-factor authentication (MFA)</li>
                    <li>• Role-based access control (RBAC)</li>
                    <li>• Principle of least privilege</li>
                    <li>• Regular access reviews and audits</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Monitoring & Logging
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Real-time security monitoring</li>
                    <li>• Comprehensive audit logging</li>
                    <li>• Automated threat detection</li>
                    <li>• 24/7 security operations center</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Data Protection
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Regular automated backups</li>
                    <li>• Disaster recovery procedures</li>
                    <li>• Data loss prevention (DLP)</li>
                    <li>• Secure data disposal processes</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Rights */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              Patient Rights & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                Under HIPAA, patients have specific rights regarding their
                protected health information (PHI). SurgeryManager is committed
                to upholding these rights:
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Rights Include:
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Right to access your medical records</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Right to request corrections to your records</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Right to request restrictions on information use
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Right to receive confidential communications</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Right to file complaints</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    How We Protect Your Information:
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <Lock className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Minimum necessary principle - only access what&apos;s
                        needed
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Authorized personnel only access</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Secure transmission and storage</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Regular security training for all staff</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Immediate incident response procedures</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Disclaimers */}
        <Card className="mb-12 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-amber-800 flex items-center">
              <AlertTriangle className="w-6 h-6 text-amber-600 mr-3" />
              Important Medical Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-amber-800">
              <div className="bg-white/50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">
                  Medical Information Disclaimer
                </h3>
                <p className="text-sm">
                  SurgeryManager is a healthcare management tool designed to
                  assist healthcare professionals in organizing and managing
                  patient information. This system does not provide medical
                  advice, diagnosis, or treatment recommendations. Always
                  consult with qualified healthcare professionals for medical
                  decisions and patient care.
                </p>
              </div>

              <div className="bg-white/50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Emergency Procedures</h3>
                <p className="text-sm">
                  This system is not intended for use in medical emergencies or
                  life-threatening situations. In case of emergency, contact
                  emergency services immediately. Do not rely on this system for
                  critical, time-sensitive medical decisions.
                </p>
              </div>

              <div className="bg-white/50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">System Limitations</h3>
                <p className="text-sm">
                  While we maintain high availability and security standards,
                  this system may experience downtime for maintenance or
                  technical issues. Healthcare providers should have backup
                  procedures in place for accessing critical patient information
                  when the system is unavailable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Contact & Compliance Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Privacy & Security
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong>Privacy Officer:</strong>
                    <br />
                    compliance@surgerymanager.com
                    <br />
                    1-800-SURGERY (1-800-787-4379)
                  </p>
                  <p>
                    <strong>Security Team:</strong>
                    <br />
                    security@surgerymanager.com
                    <br />
                    24/7 Security Hotline: 1-800-SEC-HELP
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Legal & Compliance
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong>Legal Department:</strong>
                    <br />
                    legal@surgerymanager.com
                  </p>
                  <p>
                    <strong>Compliance Reporting:</strong>
                    <br />
                    Report security incidents or compliance concerns
                    <br />
                    compliance-report@surgerymanager.com
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Resources
              </h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Privacy Policy <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
                <Link
                  href="/terms-of-service"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Terms of Service <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
                <Link
                  href="/security-report"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Security Report <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <SimpleFooter
          lastUpdated={new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </main>
    </div>
  );
}
