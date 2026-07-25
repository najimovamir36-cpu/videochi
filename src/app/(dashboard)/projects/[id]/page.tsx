import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectDetail } from "@/components/dashboard/project-detail";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatDuration } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { AppError } from "@/server/core/errors";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";

export const metadata: Metadata = buildMetadata({
  title: "Project",
  path: routes.projects,
  description: "Clips generated from your source footage.",
  noIndex: true,
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { user } = await requireSession();
  const { id } = await params;

  let detail;
  try {
    detail = await workspaceService.getProjectDetail(user.id, id);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  const { project, clips } = detail;

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href={routes.projects}>
          <ArrowLeft className="size-4" />
          All projects
        </Link>
      </Button>

      <PageHeader
        title={project.title}
        description={`${project.clipCount} clips · ${project.language} · ${formatDuration(project.duration)}`}
      />

      <ProjectDetail initialProject={project} initialClips={clips} />
    </div>
  );
}
