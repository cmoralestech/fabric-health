"use client";

import { useState, useCallback } from "react";
import type { Toast, ToastType } from "@/components/ui/Toast";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      type: ToastType,
      title: string,
      description?: string,
      duration?: number
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = {
        id,
        type,
        title,
        description,
        duration,
      };

      setToasts((prev) => [...prev, toast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, description?: string) => {
      showToast("success", title, description);
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, description?: string) => {
      showToast("error", title, description);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, description?: string) => {
      showToast("warning", title, description);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, description?: string) => {
      showToast("info", title, description);
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
