"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  X,
  User,
  Calendar,
  Mail,
  Phone,
  Activity,
  Clock,
  UserPlus,
  Edit,
  Plus,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import EditSurgeryModal from "@/components/surgeries/EditSurgeryModal";

interface Patient {
  id: string;
  name: string;
  age: number;
  birthDate: string;
  email?: string;
  phone?: string;
  createdAt: string;
  surgeryCount: number;
}

interface Surgery {
  id: string;
  scheduledAt: string;
  type: string;
  status: string;
  notes?: string;
  surgeon: {
    id: string;
    name: string;
    email: string;
  };
  scheduledBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onScheduleSurgery?: (patientId: string) => void;
}

export default function PatientDetailsModal({
  isOpen,
  onClose,
  patient,
  onScheduleSurgery,
}: PatientDetailsModalProps) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loadingSurgeries, setLoadingSurgeries] = useState(false);
  const [showEditSurgery, setShowEditSurgery] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);

  const getAgeCategory = (age: number) => {
    if (age < 18)
      return { label: "Pediatric", color: "bg-green-100 text-green-800" };
    if (age >= 65)
      return { label: "Senior", color: "bg-purple-100 text-purple-800" };
    return { label: "Adult", color: "bg-blue-100 text-blue-800" };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "POSTPONED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchPatientSurgeries = useCallback(async () => {
    if (!patient) return;

    setLoadingSurgeries(true);
    try {
      const response = await fetch(`/api/patients/${patient.id}/surgeries`);
      if (response.ok) {
        const data = await response.json();
        setSurgeries(data);
      }
    } catch (error) {
      console.error("Error fetching patient surgeries:", error);
    } finally {
      setLoadingSurgeries(false);
    }
  }, [patient]);

  // Fetch patient surgeries when modal opens
  useEffect(() => {
    if (isOpen && patient) {
      fetchPatientSurgeries();
    }
  }, [isOpen, patient, fetchPatientSurgeries]);

  const handleEditSurgery = (surgery: Surgery) => {
    setSelectedSurgery(surgery);
    setShowEditSurgery(true);
  };

  const handleSurgeryUpdated = () => {
    fetchPatientSurgeries(); // Refresh the surgeries list
  };

  if (!isOpen || !patient) return null;

  const ageCategory = getAgeCategory(patient.age);
  const birthYear = new Date(patient.birthDate).getFullYear();

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Patient Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Patient Header */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {patient.name}
              </h3>
              <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ageCategory.color}`}
                >
                  {ageCategory.label}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Demographics */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Demographics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-600">Age</p>
                    <p className="font-medium text-gray-900">
                      {patient.age} years old
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Birth Year</p>
                    <p className="font-medium text-gray-900">{birthYear}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-900">
                      {new Date(patient.birthDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  {patient.email ? (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Email Address</p>
                        <p className="font-medium text-gray-900">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-500">No email address on file</p>
                    </div>
                  )}

                  {patient.phone ? (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Phone Number</p>
                        <p className="font-medium text-gray-900">
                          {patient.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-500">No phone number on file</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Record Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Record Information
                </h4>
                <div className="text-sm">
                  <p className="text-gray-600">Patient added to system</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(patient.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Medical History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Medical History
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onScheduleSurgery?.(patient.id)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Surgery
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Total Surgeries</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {surgeries.length}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              {/* Surgery List */}
              <div className="space-y-3">
                {loadingSurgeries ? (
                  <div className="text-center py-4 text-gray-500">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading surgeries...
                  </div>
                ) : surgeries.length > 0 ? (
                  surgeries.map((surgery) => (
                    <div
                      key={surgery.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900">
                              {surgery.type}
                            </h5>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                surgery.status
                              )}`}
                            >
                              {surgery.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(surgery.scheduledAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Surgeon: {surgery.surgeon.name}
                          </p>
                          {surgery.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              &quot;{surgery.notes}&quot;
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSurgery(surgery)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No surgeries scheduled</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onScheduleSurgery?.(patient.id)}
                      className="mt-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule First Surgery
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              onClick={() => onScheduleSurgery?.(patient.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Schedule Surgery
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Surgery Modal */}
      {showEditSurgery && selectedSurgery && (
        <EditSurgeryModal
          isOpen={showEditSurgery}
          onClose={() => {
            setShowEditSurgery(false);
            setSelectedSurgery(null);
          }}
          surgery={selectedSurgery}
          onSurgeryUpdated={handleSurgeryUpdated}
        />
      )}
    </div>
  );
}
