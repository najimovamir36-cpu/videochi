"use client";

import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { useZodForm } from "@/hooks/use-zod-form";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

interface ForgotPasswordValues {
  email: string;
}

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useZodForm<ForgotPasswordValues, ForgotPasswordInput>({
    schema: forgotPasswordSchema,
    initialValues: { email: "" },
    onSubmit: async (values) => {
      await requestPasswordReset(values);
      setSentTo(values.email);
    },
  });

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-success/12 text-success ring-1 ring-success/20">
          <MailCheck className="size-6" />
        </span>

        <div className="space-y-2">
          <h2 className="font-display text-lg font-semibold">Check your inbox</h2>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            If an account exists for <span className="text-foreground">{sentTo}</span>, we have sent a
            reset link. It expires in 30 minutes.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              setSentTo(null);
              form.reset();
            }}
          >
            Use a different email
          </Button>
          <Button asChild variant="ghost" fullWidth>
            <Link href={routes.login}>
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-5" noValidate>
      <FormField id="email" label="Email" error={form.errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          startIcon={<Mail />}
          invalid={Boolean(form.errors.email)}
          {...form.fieldProps("email")}
        />
      </FormField>

      <FormError message={form.formError} />

      <Button type="submit" variant="gradient" size="lg" fullWidth loading={form.isSubmitting}>
        Send reset link
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
