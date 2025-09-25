"use client";

import { Button } from "@/components/ui/Button";
import {
  User,
  Calendar,
  Phone,
  Mail,
  Activity,
  Eye,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

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

interface PatientTableViewProps {
  patients: Patient[];
  onViewPatient?: (patient: Patient) => void;
  onScheduleSurgery?: (patientId: string) => void;
}

export default function PatientTableView({
  patients,
  onViewPatient,
  onScheduleSurgery,
}: PatientTableViewProps) {
  const [hasScroll, setHasScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getAgeCategory = (age: number) => {
    if (age < 18)
      return { label: "Pediatric", color: "bg-green-100 text-green-800" };
    if (age >= 65)
      return { label: "Senior", color: "bg-purple-100 text-purple-800" };
    return { label: "Adult", color: "bg-blue-100 text-blue-800" };
  };

  // Check if horizontal scroll is needed
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const hasHorizontalScroll =
          scrollRef.current.scrollWidth > scrollRef.current.clientWidth;
        setHasScroll(hasHorizontalScroll);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [patients]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Scroll indicator */}
      {hasScroll && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-center text-blue-700">
          <ArrowRight className="w-4 h-4 mr-2" />
          <span className="text-sm">
            Scroll horizontally to see all columns
          </span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </div>
      )}

      {/* Horizontal scroll container with better scrollbar */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-[760px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[160px]">
                  Patient
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                  Age
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                  Date of Birth
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                  Contact
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                  Surgeries
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[90px]">
                  Added
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => {
                const ageCategory = getAgeCategory(patient.age);
                const birthYear = new Date(patient.birthDate).getFullYear();

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Patient Info */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <div className="ml-2 min-w-0">
                          <div
                            className="text-sm font-medium text-gray-900 truncate max-w-[100px]"
                            title={patient.name}
                          >
                            {patient.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {patient.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Age & Category */}
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${ageCategory.color}`}
                        >
                          {ageCategory.label.charAt(0)}
                        </span>
                        <div className="text-sm text-gray-900">
                          {patient.age}
                        </div>
                      </div>
                    </td>

                    {/* Date of Birth */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(patient.birthDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{birthYear}</div>
                    </td>

                    {/* Contact */}
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {patient.email && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Mail className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                            <span
                              className="truncate max-w-[80px]"
                              title={patient.email}
                            >
                              {patient.email.split("@")[0]}
                            </span>
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                            <span>{patient.phone.slice(-4)}</span>
                          </div>
                        )}
                        {!patient.email && !patient.phone && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Medical History */}
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-slate-700">
                        {patient.surgeryCount}
                      </span>
                    </td>

                    {/* Added Date */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {new Date(patient.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-slate-50 hover:border-slate-300 px-2 py-1 text-xs transition-colors"
                          onClick={() => onViewPatient?.(patient)}
                          title={`View ${patient.name}'s complete medical profile and surgery history`}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 px-2 py-1 text-xs transition-colors"
                          onClick={() => onScheduleSurgery?.(patient.id)}
                          title={`Schedule a new surgery for ${patient.name}`}
                        >
                          <UserPlus className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state for table */}
      {patients.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No patients found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search filters.
          </p>
        </div>
      )}
    </div>
  );
}
