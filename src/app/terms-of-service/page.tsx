"use client";

import {
  FileText,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Shield,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/compliance"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Terms of Service
                  </h1>
                  <p className="text-sm text-gray-600">
                    SurgeryManager User Agreement
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/auth/signin"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Effective Date: January 1, 2024 | Last Updated:{" "}
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            These Terms of Service govern your use of SurgeryManager, a
            healthcare management platform designed for medical professionals
            and healthcare organizations.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  Medical Disclaimer
                </h2>
                <p className="text-red-800 text-sm leading-relaxed">
                  SurgeryManager is a healthcare management tool and does not
                  provide medical advice, diagnosis, or treatment. This platform
                  is not intended for use in medical emergencies. Always consult
                  with qualified healthcare professionals for medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              By accessing or using SurgeryManager, you agree to be bound by
              these Terms of Service and all applicable laws and regulations. If
              you do not agree with any of these terms, you are prohibited from
              using this service.
            </p>
            <p>
              These terms apply to all users of the service, including
              healthcare professionals, administrative staff, and authorized
              personnel within healthcare organizations.
            </p>
          </CardContent>
        </Card>

        {/* Authorized Use */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              2. Authorized Use and User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Authorized Users
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                SurgeryManager is intended exclusively for use by:
              </p>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>• Licensed healthcare professionals</li>
                <li>• Authorized healthcare administrative staff</li>
                <li>• IT personnel supporting healthcare operations</li>
                <li>
                  • Individuals with valid invitation codes from healthcare
                  organizations
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                User Responsibilities
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • Maintain the confidentiality of your login credentials
                </li>
                <li>
                  • Use the platform only for legitimate healthcare purposes
                </li>
                <li>
                  • Comply with all applicable healthcare regulations, including
                  HIPAA
                </li>
                <li>
                  • Report security incidents or suspected breaches immediately
                </li>
                <li>• Keep your contact information and profile up to date</li>
                <li>• Log out properly when finished using the system</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Prohibited Activities
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Unauthorized access to patient health information</li>
                <li>
                  • Sharing login credentials with unauthorized individuals
                </li>
                <li>• Attempting to breach system security measures</li>
                <li>• Using the system for non-healthcare related purposes</li>
                <li>
                  • Downloading or exporting data without proper authorization
                </li>
                <li>
                  • Interfering with system operations or other users' access
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* HIPAA Compliance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              3. HIPAA Compliance and PHI Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              As a user of SurgeryManager, you acknowledge and agree to comply
              with all applicable provisions of the Health Insurance Portability
              and Accountability Act (HIPAA) and other healthcare privacy
              regulations.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Your HIPAA Obligations
              </h3>
              <ul className="space-y-2">
                <li>
                  • Access PHI only when necessary for treatment, payment, or
                  healthcare operations
                </li>
                <li>
                  • Maintain the confidentiality of all patient information
                </li>
                <li>• Report any suspected or actual breaches of PHI</li>
                <li>
                  • Complete required HIPAA training and stay current with
                  regulations
                </li>
                <li>
                  • Use minimum necessary standards when accessing or sharing
                  PHI
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Business Associate Agreement
              </h3>
              <p>
                If you represent a covered entity using SurgeryManager, the
                appropriate Business Associate Agreement must be executed
                separately. Contact our legal team for BAA execution and
                compliance documentation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Availability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. System Availability and Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Service Availability
              </h3>
              <p>
                While we strive to maintain high availability, SurgeryManager
                may experience downtime for maintenance, updates, or due to
                technical issues. We aim for 99.9% uptime but cannot guarantee
                uninterrupted service.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Emergency Procedures
              </h3>
              <p>
                Healthcare organizations must maintain backup procedures for
                accessing critical patient information when the system is
                unavailable. SurgeryManager is not intended for use in
                life-threatening emergencies.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Data Accuracy
              </h3>
              <p>
                While we implement measures to ensure data integrity, users are
                responsible for verifying the accuracy of information entered
                into and retrieved from the system. Always cross-reference
                critical information with other sources when making healthcare
                decisions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Export and Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>5. Data Export and Security Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Export Permissions
              </h3>
              <p>
                Data export capabilities are restricted based on user roles and
                organizational policies. Only authorized users may export
                patient health information, and all exports are logged for audit
                purposes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Export Security Requirements
              </h3>
              <ul className="space-y-2">
                <li>
                  • Exported files contain PHI and must be handled according to
                  HIPAA requirements
                </li>
                <li>
                  • Users are responsible for secure storage and disposal of
                  downloaded files
                </li>
                <li>
                  • Sharing exported data without proper authorization is
                  strictly prohibited
                </li>
                <li>
                  • Export activities are monitored and logged for compliance
                  purposes
                </li>
                <li>
                  • Exported data must be deleted when no longer needed for
                  authorized purposes
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>6. Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              SurgeryManager and its original content, features, and
              functionality are owned by SurgeryManager and are protected by
              international copyright, trademark, patent, trade secret, and
              other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works
              of, publicly display, publicly perform, republish, download,
              store, or transmit any of the material on our service without
              prior written consent.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-amber-800">
              7. Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-amber-800">
            <p className="text-sm">
              IN NO EVENT SHALL SURGERYMANAGER BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
              WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
            <p className="text-sm">
              Our liability to you for any damages arising from or related to
              these terms or your use of the service shall not exceed the amount
              you have paid us in the twelve months preceding the claim.
            </p>
            <p className="text-sm font-semibold">
              MEDICAL DECISIONS: We are not liable for any medical decisions
              made based on information from our platform. Always consult
              qualified healthcare professionals.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>8. Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              We may terminate or suspend your account immediately, without
              prior notice or liability, for any reason whatsoever, including
              without limitation if you breach the Terms of Service.
            </p>
            <p>
              Upon termination, your right to use the service will cease
              immediately. All provisions of the Terms of Service which by their
              nature should survive termination shall survive termination.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>9. Governing Law and Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              These Terms shall be interpreted and governed by the laws of the
              United States and applicable state laws, without regard to
              conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these terms or your use of the service
              shall be resolved through binding arbitration in accordance with
              the rules of the American Arbitration Association.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>10. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <p>
                  <strong>Legal Department</strong>
                </p>
                <p>Email: legal@surgerymanager.com</p>
                <p>Phone: 1-800-SURGERY</p>
              </div>
              <div>
                <p>
                  <strong>Compliance Team</strong>
                </p>
                <p>Email: compliance@surgerymanager.com</p>
                <p>Phone: 1-800-COMPLY</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>11. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will try to
              provide at least 30 days notice prior to any new terms taking
              effect.
            </p>
            <p>
              What constitutes a material change will be determined at our sole
              discretion. By continuing to access or use our service after those
              revisions become effective, you agree to be bound by the revised
              terms.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
          <p>These Terms of Service are effective as of January 1, 2024</p>
          <p className="mt-2">© 2024 SurgeryManager. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
