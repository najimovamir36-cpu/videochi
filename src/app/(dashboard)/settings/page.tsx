import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { SettingsSection } from "@/components/settings/settings-section";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";
import { requireSession } from "@/server/services/session-service";

export const metadata: Metadata = buildMetadata({
  title: "Settings",
  path: routes.settings,
  description: "Manage your ClipMind AI profile.",
  noIndex: true,
});

export default async function SettingsPage() {
  const { user } = await requireSession();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your workspace profile." />

      <div className="grid gap-5 lg:max-w-2xl">
        <SettingsSection
          title="Profile"
          description="The name shown across your workspace and on exported clips."
        >
          <ProfileForm user={user} />
        </SettingsSection>
      </div>
    </div>
  );
}
