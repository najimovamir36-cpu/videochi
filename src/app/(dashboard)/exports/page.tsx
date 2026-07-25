import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { RecentExports } from "@/components/dashboard/recent-exports";
import { routes } from "@/config/routes";
import { formatBytes } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";

export const metadata: Metadata = buildMetadata({
  title: "Exports",
  path: routes.exports,
  description: "Download your rendered vertical clips.",
  noIndex: true,
});

export default async function ExportsPage() {
  const { user } = await requireSession();
  const exportJobs = await workspaceService.listExports(user.id);

  const completed = exportJobs.filter((job) => job.status === "completed");
  const deliveredBytes = completed.reduce((sum, job) => sum + job.size, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Exports"
        description={`${completed.length} of ${exportJobs.length} renders complete · ${formatBytes(
          deliveredBytes,
        )} delivered`}
      />

      <RecentExports exports={exportJobs} title="All exports" />
    </div>
  );
}
