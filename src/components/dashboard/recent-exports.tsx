import { Download, Film } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { TimeAgo } from "@/components/shared/time-ago";
import { VideoThumbnail } from "@/components/shared/video-thumbnail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { routes } from "@/config/routes";
import { formatBytes } from "@/lib/format";
import type { ExportJob } from "@/types/media";

export interface RecentExportsProps {
  exports: ExportJob[];
  limit?: number;
  title?: string;
}

/** Vertical list of render jobs with live progress for in-flight items. */
export function RecentExports({ exports, limit, title = "Recent exports" }: RecentExportsProps) {
  const rows = typeof limit === "number" ? exports.slice(0, limit) : exports;

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-[12px] text-muted-foreground">
            {exports.filter((job) => job.status === "completed").length} ready to download
          </p>
        </div>
        {typeof limit === "number" && exports.length > limit ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.exports}>View all</Link>
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-2.5">
        {rows.length === 0 ? (
          <EmptyState
            icon={Film}
            title="No exports yet"
            description="Once a project finishes analysis, render a clip and it will show up here."
          />
        ) : (
          rows.map((job) => (
            <div
              key={job.id}
              id={job.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <VideoThumbnail
                color={
                  job.status === "failed"
                    ? "#f43f5e"
                    : job.status === "completed"
                      ? "#7c5cff"
                      : "#22d3ee"
                }
                aspect="vertical"
                className="w-11 shrink-0 rounded-lg"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{job.clipTitle}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                  {job.projectTitle} · {job.resolution} · {job.aspectRatio}
                </p>

                {job.status === "rendering" ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={job.progress} animated className="h-1 flex-1" />
                    <span className="text-[10.5px] tabular text-muted-foreground">
                      {job.progress}%
                    </span>
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2.5 text-[11px] text-muted-foreground">
                    <StatusPill status={job.status} />
                    {job.size > 0 ? <span className="tabular">{formatBytes(job.size)}</span> : null}
                    <TimeAgo iso={job.completedAt ?? job.createdAt} />
                  </div>
                )}
              </div>

              {job.status === "completed" ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Download ${job.clipTitle}`}
                  className="shrink-0"
                >
                  <Download />
                </Button>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
