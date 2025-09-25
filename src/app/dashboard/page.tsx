"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import SurgeryList from "@/components/surgeries/SurgeryList";
import ScheduleSurgeryForm from "@/components/surgeries/ScheduleSurgeryForm";
import EditSurgeryModal from "@/components/surgeries/EditSurgeryModal";
import Navbar from "@/components/layout/Navbar";
import { AppFooter } from "@/components/layout/Footer";
import { X } from "lucide-react";

interface Surgery {
  id: string;
  scheduledAt: string;
  type: string;
  status: string;
  notes?: string;
  patient: {
    id: string;
    name: string;
    age: number;
    email?: string;
    phone?: string;
  };
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

export default function Dashboard() {
  const { status } = useSession();
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Check if disclaimer should be shown on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const disclaimerDismissed = sessionStorage.getItem(
        "medical-disclaimer-dismissed"
      );
      if (!disclaimerDismissed) {
        setShowDisclaimer(true);
      }
    }
  }, []);

  // Handle disclaimer dismissal
  const handleDismissDisclaimer = () => {
    setShowDisclaimer(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("medical-disclaimer-dismissed", "true");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading Surgery Manager...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const handleScheduleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditSurgery = (surgery: Surgery) => {
    setSelectedSurgery(surgery);
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedSurgery(null);
  };

  const handleEditSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    handleEditClose();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto py-4 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-200px)]">
        <SurgeryList
          key={refreshKey}
          onScheduleNew={() => setShowScheduleForm(true)}
          onEditSurgery={handleEditSurgery}
        />
      </main>

      {showScheduleForm && (
        <ScheduleSurgeryForm
          onClose={() => setShowScheduleForm(false)}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {showEditModal && (
        <EditSurgeryModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          surgery={selectedSurgery}
          onSurgeryUpdated={handleEditSuccess}
        />
      )}

      {/* Dismissible medical disclaimer */}
      {showDisclaimer && (
        <div className="fixed bottom-4 right-4 max-w-xs animate-in slide-in-from-right duration-300">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-start justify-between">
              <p className="text-xs text-amber-700 pr-2">
                ⚠️ For healthcare management only. Not for medical emergencies.
                <a
                  href="/compliance"
                  className="underline hover:text-amber-800 ml-1"
                >
                  View disclaimers
                </a>
              </p>
              <button
                onClick={handleDismissDisclaimer}
                className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
                title="Dismiss disclaimer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      <AppFooter />
    </div>
  );
}
