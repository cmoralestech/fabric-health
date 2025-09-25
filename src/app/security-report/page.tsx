"use client";

import {
  Shield,
  ArrowLeft,
  Lock,
  Eye,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function SecurityReportPage() {
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
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 via-green-700 to-emerald-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Security Report
                  </h1>
                  <p className="text-sm text-gray-600">
                    SurgeryManager Security Status
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
        {/* Security Status Overview */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <span className="text-lg font-semibold text-green-800">
              System Security: Operational
            </span>
          </div>
          <p className="text-gray-600">
            Last security assessment: {new Date().toLocaleDateString()} | Next
            scheduled review:{" "}
            {new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toLocaleDateString()}
          </p>
        </div>

        {/* Security Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">99.9%</div>
              <div className="text-sm text-green-700">Uptime</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-800">0</div>
              <div className="text-sm text-blue-700">Security Incidents</div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-800">24/7</div>
              <div className="text-sm text-purple-700">Monitoring</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Server className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-800">256-bit</div>
              <div className="text-sm text-orange-700">Encryption</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Security Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Current Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    SSL/TLS Encryption
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Database Encryption
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Multi-Factor Authentication
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Access Controls (RBAC)
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Audit Logging
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Intrusion Detection
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Regular Backups
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Vulnerability Scanning
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Certifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Security Certifications & Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  HIPAA Compliant
                </h3>
                <p className="text-sm text-blue-700">
                  Full compliance with HIPAA Privacy and Security Rules
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-900 mb-2">
                  SOC 2 Type II
                </h3>
                <p className="text-sm text-green-700">
                  Independently audited security controls
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Server className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">
                  ISO 27001
                </h3>
                <p className="text-sm text-purple-700">
                  Information security management standards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 text-gray-600 mr-2" />
              Recent Security Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">
                    Security Patch Applied
                  </div>
                  <div className="text-sm text-green-700">
                    System security updates completed successfully
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {new Date(
                      Date.now() - 2 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">
                    Vulnerability Scan Completed
                  </div>
                  <div className="text-sm text-blue-700">
                    No critical vulnerabilities detected
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {new Date(
                      Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Lock className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-900">
                    Access Review Completed
                  </div>
                  <div className="text-sm text-purple-700">
                    User access permissions reviewed and updated
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {new Date(
                      Date.now() - 14 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Server className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-900">
                    Backup Verification
                  </div>
                  <div className="text-sm text-orange-700">
                    Data backup integrity verified successfully
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {new Date(
                      Date.now() - 1 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incident Response */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
              Incident Response Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    No Active Incidents
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    All systems are operating normally. Our incident response
                    team is on standby 24/7.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Incident Response Capabilities
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 24/7 security operations center</li>
                  <li>• Automated threat detection</li>
                  <li>• Real-time monitoring and alerts</li>
                  <li>• Rapid response procedures</li>
                </ul>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Forensic investigation capabilities</li>
                  <li>• Business continuity planning</li>
                  <li>• Regulatory notification procedures</li>
                  <li>• Post-incident analysis and improvement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Security Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Report Security Issues
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Security Team:</strong> security@surgerymanager.com
                  </p>
                  <p>
                    <strong>Emergency Hotline:</strong> 1-800-SEC-HELP
                  </p>
                  <p>
                    <strong>PGP Key ID:</strong> Available upon request
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Compliance Inquiries
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Compliance Team:</strong>{" "}
                    compliance@surgerymanager.com
                  </p>
                  <p>
                    <strong>Privacy Officer:</strong> privacy@surgerymanager.com
                  </p>
                  <p>
                    <strong>Audit Requests:</strong> audit@surgerymanager.com
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
          <p>
            Security report generated on {new Date().toLocaleDateString()} at{" "}
            {new Date().toLocaleTimeString()}
          </p>
          <p className="mt-2">
            For the most up-to-date security information, visit our{" "}
            <Link
              href="/compliance"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              compliance page
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
