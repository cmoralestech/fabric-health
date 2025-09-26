"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/contexts/ToastContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
