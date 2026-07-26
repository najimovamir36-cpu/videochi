"use client";

import { ArrowRight, KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { useZodForm } from "@/hooks/use-zod-form";
import { safeRedirectPath } from "@/lib/redirect";
import { passphraseSchema, type PassphraseInput } from "@/lib/validations/auth";

interface PassphraseFormValues {
  passphrase: string;
}

const INITIAL_VALUES: PassphraseFormValues = { passphrase: "" };

/**
 * The entire sign-in surface: one shared passphrase gates the whole app.
 * Entering it correctly always creates a brand-new, blank workspace — there
 * is no per-account password, registration, or social sign-in.
 */
export function PassphraseForm() {
  const { enterWithPassphrase } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("next"), routes.dashboard);

  const oauthError = searchParams.get("error");
  useEffect(() => {
    if (!oauthError) return;
    toast.error("Sign-in failed", { description: oauthError });
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url);
  }, [oauthError]);

  const form = useZodForm<PassphraseFormValues, PassphraseInput>({
    schema: passphraseSchema,
    initialValues: INITIAL_VALUES,
    onSubmit: async (values) => {
      await enterWithPassphrase(values, redirectTo);
      toast.success("Welcome in");
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-5" noValidate>
      <FormField id="passphrase" label="Passphrase" error={form.errors.passphrase}>
        <PasswordInput
          id="passphrase"
          autoComplete="off"
          autoFocus
          placeholder="Enter the passphrase"
          invalid={Boolean(form.errors.passphrase)}
          {...form.fieldProps("passphrase")}
        />
      </FormField>

      <FormError message={form.formError} />

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        fullWidth
        loading={form.isSubmitting}
        iconRight={<ArrowRight />}
      >
        Enter
      </Button>

      <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3">
        <span className="mt-px grid size-7 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
          <KeyRound className="size-3.5" />
        </span>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          No account needed — the right passphrase opens a fresh workspace.
        </p>
      </div>
    </form>
  );
}
