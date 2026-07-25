import type { Metadata } from "next";
import { ArrowUpRight, UploadCloud } from "lucide-react";
import Link from "next/link";

import { RecentExports } from "@/components/dashboard/recent-exports";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { UploadsTable } from "@/components/dashboard/uploads-table";
import { UsagePanel } from "@/components/dashboard/usage-panel";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";

export const metadata: Metadata = buildMetadata({
  title: "Dashboard",
  path: routes.dashboard,
  description: "Your ClipMind AI workspace overview.",
  noIndex: true,
});

export default async function DashboardPage() {
  const { user } = await requireSession();
  const { stats, usage, uploads, exports, projects } = await workspaceService.getOverview(user.id);

  const clipsThisCycle = projects.reduce((sum, project) => sum + project.clipCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <WelcomeCard user={user} usage={usage} clipsThisCycle={clipsThisCycle} />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <UploadsTable uploads={uploads} limit={5} />
          <RecentExports exports={exports} limit={4} />
        </div>

        <div className="flex flex-col gap-6">
          <UsagePanel usage={usage} />

          <div className="glass rounded-2xl p-5 shadow-soft">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">
              Start a new project
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Drop in a podcast, interview or webinar and ClipMind will queue it for analysis.
            </p>

            {/* `asChild` forwards styling to the link, so icons go inside it. */}
            <Button asChild variant="gradient" fullWidth className="mt-4">
              <Link href={routes.uploads}>
                <UploadCloud />
                Upload footage
              </Link>
            </Button>

            <Button asChild variant="ghost" fullWidth className="mt-2">
              <Link href={routes.projects}>
                Browse projects
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
