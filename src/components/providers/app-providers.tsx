"use client";

import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

/**
 * Single client boundary for app-wide context.
 * Keeping it in one component means the root layout stays a server component.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={220} skipDelayDuration={400}>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}
