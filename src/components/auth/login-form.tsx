"use client";

import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";
import { useAuth } from "@/hooks/use-auth";
import { useZodForm } from "@/hooks/use-zod-form";
import { safeRedirectPath } from "@/lib/redirect";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

const INITIAL_VALUES: LoginFormValues = { email: "", password: "", remember: true };

export function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  // `next` is attacker-controlled, so it is filtered down to a same-origin path.
  const redirectTo = safeRedirectPath(searchParams.get("next"), routes.dashboard);

  const form = useZodForm<LoginFormValues, LoginInput>({
    schema: loginSchema,
    initialValues: INITIAL_VALUES,
    onSubmit: async (values) => {
      const result = await login(values, redirectTo);
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}`);
    },
  });

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

      <FormField
        id="password"
        label="Password"
        error={form.errors.password}
        hint={
          <Link
            href={routes.forgotPassword}
            className="text-[11.5px] font-medium text-primary transition-colors hover:text-primary/80"
          >
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          invalid={Boolean(form.errors.password)}
          {...form.fieldProps("password")}
        />
      </FormField>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="remember"
          checked={form.values.remember}
          onCheckedChange={(checked) => form.setValue("remember", checked === true)}
        />
        <Label htmlFor="remember" className="cursor-pointer text-[13px] text-muted-foreground">
          Remember me for 7 days
        </Label>
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
        Sign in
      </Button>
    </form>
  );
}
