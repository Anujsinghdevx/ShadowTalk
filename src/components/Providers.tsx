"use client"

import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/context/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
