import { MoreHorizontal, UploadCloud } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { TimeAgo } from "@/components/shared/time-ago";
import { VideoThumbnail } from "@/components/shared/video-thumbnail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { formatBytes, formatDuration } from "@/lib/format";
import type { VideoUpload } from "@/types/media";

export interface UploadsTableProps {
  uploads: VideoUpload[];
  title?: string;
  /** Show only the first N rows and link to the full list. */
  limit?: number;
}

const SOURCE_LABEL: Record<VideoUpload["source"], string> = {
  device: "Device",
  youtube: "YouTube",
  drive: "Drive",
  url: "URL",
};

/**
 * Source-footage list. Renders as a real table on desktop and stacked cards on
 * mobile, so nothing is horizontally cut off on small screens.
 */
export function UploadsTable({ uploads, title = "Uploaded videos", limit }: UploadsTableProps) {
  const rows = typeof limit === "number" ? uploads.slice(0, limit) : uploads;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-[12px] text-muted-foreground">
            {uploads.length} {uploads.length === 1 ? "file" : "files"} in this workspace
          </p>
        </div>
        {typeof limit === "number" && uploads.length > limit ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.uploads}>View all</Link>
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="p-0 pb-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={UploadCloud}
              title="No uploads yet"
              description="Drop in a podcast, interview or webinar recording and ClipMind will find the moments worth posting."
              action={
                <Button asChild variant="gradient">
                  <Link href={routes.uploads}>Upload your first video</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-y border-white/[0.06] text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    <th scope="col" className="px-6 py-2.5 font-medium">
                      File
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Duration
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Size
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Source
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Added
                    </th>
                    <th scope="col" className="px-6 py-2.5 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((upload) => (
                    <tr
                      key={upload.id}
                      id={upload.id}
                      className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <VideoThumbnail
                            color={upload.thumbnailColor}
                            className="w-16 rounded-lg"
                          />
                          <span className="min-w-0">
                            <span className="block max-w-[16rem] truncate text-[13px] font-medium">
                              {upload.fileName}
                            </span>
                            <span className="block text-[11.5px] text-muted-foreground">
                              {upload.mimeType}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill status={upload.status} />
                      </td>
                      <td className="px-3 py-3 text-[12.5px] tabular text-muted-foreground">
                        {upload.duration > 0 ? formatDuration(upload.duration) : "—"}
                      </td>
                      <td className="px-3 py-3 text-[12.5px] tabular text-muted-foreground">
                        {formatBytes(upload.size)}
                      </td>
                      <td className="px-3 py-3 text-[12.5px] text-muted-foreground">
                        {SOURCE_LABEL[upload.source]}
                      </td>
                      <td className="px-3 py-3 text-[12.5px] text-muted-foreground">
                        <TimeAgo iso={upload.createdAt} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${upload.fileName}`}
                        >
                          <MoreHorizontal />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="flex flex-col gap-2.5 px-4 pb-3 md:hidden">
              {rows.map((upload) => (
                <li
                  key={upload.id}
                  id={`m-${upload.id}`}
                  className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <VideoThumbnail color={upload.thumbnailColor} className="w-20 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{upload.fileName}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
                      <span className="tabular">{formatBytes(upload.size)}</span>
                      {upload.duration > 0 ? (
                        <span className="tabular">{formatDuration(upload.duration)}</span>
                      ) : null}
                      <TimeAgo iso={upload.createdAt} />
                    </div>
                    <div className="mt-2">
                      <StatusPill status={upload.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
