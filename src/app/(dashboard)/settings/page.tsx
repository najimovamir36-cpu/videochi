import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { SettingsSection } from "@/components/settings/settings-section";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";
import { requireSession } from "@/server/services/session-service";

export const metadata: Metadata = buildMetadata({
  title: "Settings",
  path: routes.settings,
  description: "Manage your ClipMind AI profile and account security.",
  noIndex: true,
});

export default async function SettingsPage() {
  const { user } = await requireSession();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your profile and account security." />

      <div className="grid gap-5 lg:max-w-2xl">
        <SettingsSection
          title="Profile"
          description="The name shown across your workspace and on exported clips."
        >
          <ProfileForm user={user} />
        </SettingsSection>

        <SettingsSection
          title="Password"
          description="Choose a strong password you don't use anywhere else."
        >
          <PasswordForm />
        </SettingsSection>
      </div>
    </div>
  );
}
