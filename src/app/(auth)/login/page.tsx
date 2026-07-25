import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";
import { authService } from "@/server/services/auth-service";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  path: routes.login,
  description: "Sign in to your ClipMind AI workspace to upload footage and export viral shorts.",
  noIndex: true,
});

export default function LoginPage() {
  const demo = authService.getDemoCredentials();

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to pick up where your clips left off."
      footer={
        <>
          New to ClipMind?{" "}
          <Link
            href={routes.register}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Create a free account
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <SocialAuthButtons />
        <AuthDivider label="or sign in with email" />

        <Suspense fallback={<Skeleton className="h-[19rem] w-full rounded-2xl" />}>
          <LoginForm />
        </Suspense>

        <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3">
          <span className="mt-px grid size-7 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
            <KeyRound className="size-3.5" />
          </span>
          <div className="text-[12px] leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Demo workspace</p>
            <p className="mt-0.5 font-mono text-[11.5px]">
              {demo.email} · {demo.password}
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
