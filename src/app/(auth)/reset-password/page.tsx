import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Choose a new password",
  path: routes.resetPassword,
  description: "Set a new password for your ClipMind AI account.",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Pick a strong password you don't use anywhere else. You'll be signed in as soon as it's set."
      footer={
        <>
          Changed your mind?{" "}
          <Link
            href={routes.login}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
