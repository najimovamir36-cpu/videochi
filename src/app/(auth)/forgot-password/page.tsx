import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Reset your password",
  path: routes.forgotPassword,
  description: "Request a password reset link for your ClipMind AI account.",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email on your account and we will send a secure link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href={routes.login}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
