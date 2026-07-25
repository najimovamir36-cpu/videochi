import { ChevronRight, FolderKanban, Layers, Languages } from "lucide-react";
import Link from "next/link";

import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { TimeAgo } from "@/components/shared/time-ago";
import { VideoThumbnail } from "@/components/shared/video-thumbnail";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatDuration } from "@/lib/format";
import type { Project } from "@/types/media";

/** Card grid of clip projects. */
export function ProjectsGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="A project is created automatically for every video you upload. Add your first recording to get started."
        action={
          <Button asChild variant="gradient">
            <Link href={routes.uploads}>Upload a video</Link>
          </Button>
        }
      />
    );
  }

  return (
    <Stagger stagger={0.06} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <StaggerItem key={project.id} className="h-full">
          <Link
            href={`${routes.projects}/${project.id}`}
            id={project.id}
            className="glass edge-light group flex h-full flex-col overflow-hidden rounded-2xl shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-lifted"
          >
            <VideoThumbnail
              color={project.thumbnailColor}
              duration={project.duration}
              aspect="video"
              className="rounded-none border-0 border-b border-white/[0.06]"
            />

            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-[14px] font-medium leading-snug">
                  {project.title}
                </h3>
                <ChevronRight className="-mr-1 mt-0.5 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="size-3" />
                  {project.clipCount} clips
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="size-3" />
                  {project.language}
                </span>
                <span className="tabular">{formatDuration(project.duration)}</span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                <StatusPill status={project.status} />
                <TimeAgo iso={project.updatedAt} className="text-[11px] text-muted-foreground" />
              </div>
            </div>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
