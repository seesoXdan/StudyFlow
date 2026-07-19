"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect, useRef, type ReactNode } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ensureDefaultSubjects, rolloverIncomplete } from "@/lib/repositories";
import { PwaRegister } from "@/components/pwa-register";

/** Seeds the default subjects once the workspace is ready. */
function DataBootstrap() {
  const { ready, configured } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (!ready || !configured || done.current) return;
    done.current = true;
    ensureDefaultSubjects().catch((err) =>
      console.error("[StudyFlow] seeding subjects failed", err)
    );
    // Move yesterday's unfinished study/homework forward to today.
    rolloverIncomplete().catch((err) =>
      console.error("[StudyFlow] rollover failed", err)
    );
  }, [ready, configured]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <DataBootstrap />
        <PwaRegister />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{ className: "rounded-2xl" }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
