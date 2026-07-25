"use client";

import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { api } from "@/lib/api-client";
import { useZodForm } from "@/hooks/use-zod-form";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/settings";
import type { AuthResponse } from "@/types/auth";

interface PasswordFormValues {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_VALUES: PasswordFormValues = {
  currentPassword: "",
  password: "",
  confirmPassword: "",
};

/** Rotates the account password, re-authenticating with the current one. */
export function PasswordForm() {
  const form = useZodForm<PasswordFormValues, ChangePasswordInput>({
    schema: changePasswordSchema,
    initialValues: INITIAL_VALUES,
    onSubmit: async (values) => {
      await api.patch<AuthResponse>(routes.api.password, values);
      toast.success("Password changed", {
        description: "Your session stays signed in on this device.",
      });
      form.reset();
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-5" noValidate>
      <FormField id="currentPassword" label="Current password" error={form.errors.currentPassword}>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          placeholder="Enter your current password"
          invalid={Boolean(form.errors.currentPassword)}
          {...form.fieldProps("currentPassword")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="password" label="New password" error={form.errors.password}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            invalid={Boolean(form.errors.password)}
            {...form.fieldProps("password")}
          />
        </FormField>

        <FormField id="confirmPassword" label="Confirm password" error={form.errors.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat the new password"
            invalid={Boolean(form.errors.confirmPassword)}
            {...form.fieldProps("confirmPassword")}
          />
        </FormField>
      </div>

      <PasswordStrengthMeter password={form.values.password} />

      <FormError message={form.formError} />

      <div>
        <Button type="submit" variant="gradient" loading={form.isSubmitting} icon={<ShieldCheck />}>
          Change password
        </Button>
      </div>
    </form>
  );
}
