"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavBar } from "./NavBar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("SW registration failed: ", err);
      });
    }
  }, []);

  return (
    <AuthProvider>
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </AuthProvider>
  );
}
