import type { Metadata } from "next";
import Link from "next/link";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Create your account",
  path: routes.register,
  description:
    "Create a free ClipMind AI account and get 60 minutes of AI clip generation every month — no credit card required.",
});

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your workspace"
      description="60 free minutes every month. No credit card, no watermark on paid plans."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={routes.login}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <SocialAuthButtons />
        <AuthDivider label="or sign up with email" />
        <RegisterForm />
      </div>
    </AuthShell>
  );
}
