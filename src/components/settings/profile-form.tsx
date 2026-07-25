"use client";

import { Check, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { api } from "@/lib/api-client";
import { useZodForm } from "@/hooks/use-zod-form";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/settings";
import type { User } from "@/types/auth";

interface ProfileFormValues {
  name: string;
}

/** Updates the display name shown across the workspace. */
export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();

  const form = useZodForm<ProfileFormValues, UpdateProfileInput>({
    schema: updateProfileSchema,
    initialValues: { name: user.name },
    onSubmit: async (values) => {
      await api.patch<User>(routes.api.profile, values);
      toast.success("Profile updated");
      // Refresh so the sidebar, top bar and welcome card pick up the new name.
      router.refresh();
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="name" label="Display name" error={form.errors.name}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your name"
            startIcon={<UserIcon />}
            invalid={Boolean(form.errors.name)}
            {...form.fieldProps("name")}
          />
        </FormField>

        <FormField id="email" label="Email" hint="Contact support to change your email">
          <Input id="email" type="email" value={user.email} readOnly disabled />
        </FormField>
      </div>

      <FormError message={form.formError} />

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          variant="gradient"
          loading={form.isSubmitting}
          disabled={!form.isDirty}
          icon={<Check />}
        >
          Save changes
        </Button>

        {form.isDirty ? (
          <Button type="button" variant="ghost" onClick={form.reset}>
            Discard
          </Button>
        ) : null}
      </div>
    </form>
  );
}
