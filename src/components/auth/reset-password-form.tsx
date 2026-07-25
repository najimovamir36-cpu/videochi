"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { useZodForm } from "@/hooks/use-zod-form";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

interface ResetPasswordValues {
  token: string;
  password: string;
  confirmPassword: string;
}

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const form = useZodForm<ResetPasswordValues, ResetPasswordInput>({
    schema: resetPasswordSchema,
    initialValues: { token, password: "", confirmPassword: "" },
    onSubmit: async (values) => {
      const result = await resetPassword(values);
      toast.success("Password updated", {
        description: `Welcome back, ${result.user.name.split(" ")[0]}. You're signed in.`,
      });
    },
  });

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="space-y-2">
          <h2 className="font-display text-lg font-semibold">Invalid reset link</h2>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            This link is missing its token. Request a fresh one and try again.
          </p>
        </div>
        <Button asChild variant="outline" fullWidth>
          <Link href={routes.forgotPassword}>Request a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-5" noValidate>
      <FormField id="password" label="New password" error={form.errors.password}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          autoFocus
          placeholder="At least 8 characters"
          invalid={Boolean(form.errors.password)}
          {...form.fieldProps("password")}
        />
        <PasswordStrengthMeter password={form.values.password} className="mt-1" />
      </FormField>

      <FormField id="confirmPassword" label="Confirm password" error={form.errors.confirmPassword}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          invalid={Boolean(form.errors.confirmPassword)}
          {...form.fieldProps("confirmPassword")}
        />
      </FormField>

      <FormError message={form.formError} />

      <Button type="submit" variant="gradient" size="lg" fullWidth loading={form.isSubmitting}>
        Set new password
      </Button>

      <Button asChild variant="ghost" fullWidth>
        <Link href={routes.login}>
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </Button>
    </form>
  );
}
