"use client";

import { ArrowRight, Mail, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { useZodForm } from "@/hooks/use-zod-form";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const INITIAL_VALUES: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export function RegisterForm() {
  const { register } = useAuth();

  const form = useZodForm<RegisterFormValues, RegisterInput>({
    schema: registerSchema,
    initialValues: INITIAL_VALUES,
    onSubmit: async (values) => {
      const result = await register(values);
      toast.success("Workspace created", {
        description: `You have 60 free minutes, ${result.user.name.split(" ")[0]}. Upload your first video to get started.`,
      });
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-5" noValidate>
      <FormField id="name" label="Full name" error={form.errors.name}>
        <Input
          id="name"
          autoComplete="name"
          autoFocus
          placeholder="Alex Rivera"
          startIcon={<User />}
          invalid={Boolean(form.errors.name)}
          {...form.fieldProps("name")}
        />
      </FormField>

      <FormField id="email" label="Work email" error={form.errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          startIcon={<Mail />}
          invalid={Boolean(form.errors.email)}
          {...form.fieldProps("email")}
        />
      </FormField>

      <FormField id="password" label="Password" error={form.errors.password}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
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

      <div className="flex items-start gap-2.5">
        <Checkbox
          id="acceptTerms"
          className="mt-0.5"
          checked={form.values.acceptTerms}
          onCheckedChange={(checked) => form.setValue("acceptTerms", checked === true)}
          aria-describedby={form.errors.acceptTerms ? "acceptTerms-error" : undefined}
        />
        <div className="space-y-1">
          <Label
            htmlFor="acceptTerms"
            className="cursor-pointer text-[12.5px] font-normal leading-relaxed text-muted-foreground"
          >
            I agree to the{" "}
            <Link
              href={routes.terms}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href={routes.privacy}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </Label>
          {form.errors.acceptTerms ? (
            <p id="acceptTerms-error" role="alert" className="text-[12px] font-medium text-destructive">
              {form.errors.acceptTerms}
            </p>
          ) : null}
        </div>
      </div>

      <FormError message={form.formError} />

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        fullWidth
        loading={form.isSubmitting}
        iconRight={<ArrowRight />}
      >
        Create account
      </Button>
    </form>
  );
}
