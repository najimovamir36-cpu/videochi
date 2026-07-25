import type { Metadata } from "next";
import { UploadCloud } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  path: routes.projects,
  description: "Every clip collection generated from your source footage.",
  noIndex: true,
});

export default async function ProjectsPage() {
  const { user } = await requireSession();
  const projects = await workspaceService.listProjects(user.id);

  const totalClips = projects.reduce((sum, project) => sum + project.clipCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Projects"
        description={`${projects.length} projects · ${formatNumber(totalClips)} clips generated`}
        actions={
          <Button asChild variant="gradient">
            <Link href={routes.uploads}>
              <UploadCloud />
              New project
            </Link>
          </Button>
        }
      />

      <ProjectsGrid projects={projects} />
    </div>
  );
}
