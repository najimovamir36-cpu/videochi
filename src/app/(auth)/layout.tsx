import type { ReactNode } from "react";

import { AuthSidePanel } from "@/components/auth/auth-side-panel";
import { PageTransition } from "@/components/motion/page-transition";
import { AmbientGlow } from "@/components/shared/aurora-background";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <AuthSidePanel />

      <main
        id="main"
        className="relative flex items-center justify-center px-5 py-12 sm:px-8 sm:py-16"
      >
        <AmbientGlow className="lg:hidden" />
        <PageTransition className="flex w-full justify-center">{children}</PageTransition>
      </main>
    </div>
  );
}
