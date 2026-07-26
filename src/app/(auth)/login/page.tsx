import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PassphraseForm } from "@/components/auth/passphrase-form";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  path: routes.login,
  description: "Enter the passphrase to open your ClipMind AI workspace.",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <AuthShell title="Welcome" description="Enter the passphrase to continue.">
      <Suspense fallback={<Skeleton className="h-[16rem] w-full rounded-2xl" />}>
        <PassphraseForm />
      </Suspense>
    </AuthShell>
  );
}
