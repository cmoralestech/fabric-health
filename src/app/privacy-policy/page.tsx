"use client";

import { Shield, ArrowLeft, Calendar, Lock, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Privacy Policy
                  </h1>
                  <p className="text-sm text-gray-600">
                    SurgeryManager HIPAA Notice
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
            Notice of Privacy Practices
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            This Notice describes how medical information about you may be used
            and disclosed and how you can get access to this information through
            SurgeryManager.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Your Health Information Rights
                </h2>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Federal law requires us to maintain the privacy and security
                  of your protected health information (PHI) and to provide you
                  with this notice of our legal duties and privacy practices
                  concerning your PHI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use and Disclose Health Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 text-gray-600 mr-2" />
              How We Use and Disclose Your Health Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Treatment
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                We may use and disclose your PHI to provide, coordinate, or
                manage your healthcare and related services. This includes
                communication among healthcare providers regarding your
                treatment and coordination of care.
              </p>
              <p className="text-gray-500 text-xs italic">
                Example: Sharing surgical information between your surgeon and
                anesthesiologist.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Payment
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                We may use and disclose your PHI to obtain payment for
                healthcare services provided to you, including billing, claims
                management, and collection activities.
              </p>
              <p className="text-gray-500 text-xs italic">
                Example: Submitting claims to your insurance company for
                surgical procedures.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Healthcare Operations
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                We may use and disclose your PHI for healthcare operations,
                including quality assessment, staff training, licensing, and
                business management activities.
              </p>
              <p className="text-gray-500 text-xs italic">
                Example: Reviewing surgical outcomes for quality improvement
                purposes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Other Uses and Disclosures
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Required by Law:</strong> When disclosure is required
                  by federal, state, or local law
                </p>
                <p>
                  <strong>Public Health:</strong> For disease prevention and
                  health surveillance activities
                </p>
                <p>
                  <strong>Health Oversight:</strong> To health oversight
                  agencies for authorized activities
                </p>
                <p>
                  <strong>Legal Proceedings:</strong> In response to court
                  orders or legal processes
                </p>
                <p>
                  <strong>Emergency Situations:</strong> To prevent serious harm
                  to you or others
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              Your Rights Regarding Your Health Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Right to Access
                </h3>
                <p className="text-gray-600 text-sm">
                  You have the right to inspect and obtain a copy of your PHI
                  that we maintain. We may charge a reasonable fee for copying
                  and mailing costs.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Right to Amendment
                </h3>
                <p className="text-gray-600 text-sm">
                  You have the right to request that we amend your PHI if you
                  believe it is incorrect or incomplete. We may deny your
                  request under certain circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Right to Restrictions
                </h3>
                <p className="text-gray-600 text-sm">
                  You have the right to request restrictions on how we use or
                  disclose your PHI. We are not required to agree to these
                  restrictions, except in certain circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Right to Confidential Communications
                </h3>
                <p className="text-gray-600 text-sm">
                  You have the right to request that we communicate with you
                  about your PHI in a certain way or at a certain location.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Right to Accounting
                </h3>
                <p className="text-gray-600 text-sm">
                  You have the right to receive an accounting of disclosures of
                  your PHI made by us for certain purposes during the six years
                  prior to your request.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Right to Notification
                </h3>
                <p className="text-gray-600 text-sm">
                  You have the right to be notified of any breach of your
                  unsecured PHI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 text-blue-600 mr-2" />
              How We Protect Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Technical Safeguards
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• End-to-end encryption (TLS 1.3)</li>
                  <li>• Multi-factor authentication</li>
                  <li>• Automatic session timeouts</li>
                  <li>• Regular security updates</li>
                  <li>• Intrusion detection systems</li>
                  <li>• Secure data backups</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Administrative Safeguards
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Role-based access controls</li>
                  <li>• Regular staff training</li>
                  <li>• Comprehensive audit logging</li>
                  <li>• Incident response procedures</li>
                  <li>• Business associate agreements</li>
                  <li>• Regular risk assessments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Retention and Disposal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <strong>Retention Period:</strong> We retain your PHI for the
                period required by law and as necessary for treatment, payment,
                and healthcare operations. Medical records are typically
                retained for a minimum of 7 years after the last treatment date.
              </p>
              <p>
                <strong>Secure Disposal:</strong> When PHI is no longer needed,
                we dispose of it securely through approved methods that ensure
                the information cannot be reconstructed or retrieved.
              </p>
              <p>
                <strong>Data Portability:</strong> Upon request, we can provide
                your PHI in a commonly used electronic format for transfer to
                another healthcare provider.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Complaints and Contact */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-amber-800">Filing Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-amber-800">
              <p className="text-sm">
                If you believe your privacy rights have been violated, you may
                file a complaint with us or with the Secretary of the Department
                of Health and Human Services.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">
                    Contact Our Privacy Officer
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>Privacy Officer</p>
                    <p>SurgeryManager</p>
                    <p>Email: privacy@surgerymanager.com</p>
                    <p>Phone: 1-800-PRIVACY</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Contact HHS</h3>
                  <div className="text-sm space-y-1">
                    <p>Office for Civil Rights</p>
                    <p>U.S. Department of Health and Human Services</p>
                    <p>Website: www.hhs.gov/ocr/privacy/hipaa/complaints</p>
                    <p>Phone: 1-800-368-1019</p>
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium">
                We will not retaliate against you for filing a complaint.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to This Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              We reserve the right to change this Notice and make the new Notice
              effective for all PHI we maintain. When we make material changes
              to this Notice, we will:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Post the updated Notice on our website</li>
              <li>• Make copies available at our facilities</li>
              <li>• Notify users through the system when they log in</li>
              <li>• Send email notifications to registered users</li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
          <p>This Notice is effective as of January 1, 2024</p>
          <p className="mt-2">© 2024 SurgeryManager. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
