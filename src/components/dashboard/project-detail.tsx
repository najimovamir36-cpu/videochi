"use client";

import { Captions, Clock, Download, Loader2, Scissors, Sparkles, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { StatusPill } from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AspectRatio, Clip, ExportJob, ExportResolution, Project } from "@/types/media";

const ASPECT_RATIOS: AspectRatio[] = ["9:16", "1:1", "4:5", "16:9"];
const RESOLUTIONS: ExportResolution[] = ["720p", "1080p", "1440p", "4K"];

const selectClass =
  "rounded-lg border border-white/[0.1] bg-white/[0.03] px-2.5 py-1.5 text-[12px] font-medium text-foreground/90 outline-none transition-colors hover:border-white/[0.18] focus:border-primary/60";

interface ExportState {
  exportId?: string;
  status: ExportJob["status"] | "starting";
  progress: number;
}

type ExportMap = Record<string, ExportState>;

function timecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ProjectDetail({
  initialProject,
  initialClips,
}: {
  initialProject: Project;
  initialClips: Clip[];
}) {
  const [project, setProject] = useState(initialProject);
  const [clips, setClips] = useState(initialClips);
  const [exports, setExports] = useState<ExportMap>({});
  const [resolution, setResolution] = useState<ExportResolution>("1080p");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // While the project is still analyzing, poll for the finished clips.
  useEffect(() => {
    if (project.status !== "analyzing") return;
    const timer = setInterval(async () => {
      try {
        const detail = await api.get<{ project: Project; clips: Clip[] }>(
          `/api/projects/${project.id}`,
        );
        setProject(detail.project);
        setClips(detail.clips);
        if (detail.project.status !== "analyzing") clearInterval(timer);
      } catch {
        /* transient — keep polling */
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [project.status, project.id]);

  const activeExportIds = Object.values(exports)
    .filter((e) => e.status === "queued" || e.status === "rendering" || e.status === "starting")
    .map((e) => e.exportId)
    .filter(Boolean) as string[];

  // Poll the export list while any render is in flight, matching by job id.
  useEffect(() => {
    if (activeExportIds.length === 0) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const jobs = await api.get<ExportJob[]>("/api/exports");
        setExports((current) => {
          const next = { ...current };
          for (const [clipId, state] of Object.entries(next)) {
            const job = jobs.find((j) => j.id === state.exportId);
            if (job) next[clipId] = { exportId: job.id, status: job.status, progress: job.progress };
          }
          return next;
        });
      } catch {
        /* transient */
      }
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [activeExportIds.length]);

  const startExport = useCallback(async (clip: Clip) => {
    setExports((c) => ({ ...c, [clip.id]: { status: "starting", progress: 0 } }));
    try {
      const job = await api.post<ExportJob>("/api/exports", {
        clipId: clip.id,
        resolution,
        aspectRatio,
      });
      setExports((c) => ({
        ...c,
        [clip.id]: { exportId: job.id, status: job.status, progress: job.progress },
      }));
      toast.success("Render started", {
        description: `“${clip.title}” is rendering in ${resolution} ${aspectRatio}.`,
      });
    } catch (error) {
      setExports((c) => {
        const next = { ...c };
        delete next[clip.id];
        return next;
      });
      const message = error instanceof ApiClientError ? error.message : "Could not start the render.";
      toast.error(message);
    }
  }, [resolution, aspectRatio]);

  const analyzing = project.status === "analyzing";

  return (
    <div className="flex flex-col gap-6">
      {analyzing ? (
        <div className="glass edge-light flex items-center gap-3 rounded-2xl p-4 text-[13px] text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          Analyzing your video and finding the best moments — clips will appear here automatically.
        </div>
      ) : null}

      {clips.length === 0 && !analyzing ? (
        <div className="glass edge-light rounded-2xl p-8 text-center text-[13px] text-muted-foreground">
          {project.status === "failed"
            ? "Analysis failed for this project. Try re-uploading the video."
            : "No clips were found in this video."}
        </div>
      ) : null}

      {clips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[12px] font-medium text-muted-foreground">Export as</span>
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Aspect ratio</span>
            <select
              className={selectClass}
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio} value={ratio}>
                  {ratio}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Resolution</span>
            <select
              className={selectClass}
              value={resolution}
              onChange={(e) => setResolution(e.target.value as ExportResolution)}
            >
              {RESOLUTIONS.map((res) => (
                <option key={res} value={res}>
                  {res}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="grid gap-3">
        {clips.map((clip) => {
          const state = exports[clip.id];
          const rendering =
            state?.status === "starting" ||
            state?.status === "queued" ||
            state?.status === "rendering";
          const completed = state?.status === "completed";

          return (
            <article
              key={clip.id}
              className="glass edge-light flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Scissors className="size-3.5" />
                  </span>
                  <h3 className="truncate text-[14px] font-medium">{clip.title}</h3>
                  <Badge variant="accent" className="shrink-0 gap-1 py-0.5">
                    <Sparkles className="size-3" />
                    {clip.score}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-9 text-[11.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 tabular">
                    <Clock className="size-3" />
                    {timecode(clip.startAt)}–{timecode(clip.startAt + clip.duration)}
                  </span>
                  <span className="tabular">{clip.duration}s</span>
                  <span>{clip.aspectRatio}</span>
                  {clip.hasCaptions ? (
                    <span className="inline-flex items-center gap-1">
                      <Captions className="size-3" />
                      Captions
                    </span>
                  ) : null}
                  {clip.speakerCount > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3" />
                      {clip.speakerCount}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 pl-9 sm:pl-0">
                {state && state.status !== "completed" && state.status !== "failed" ? (
                  <span className="text-[11.5px] text-muted-foreground tabular">
                    {state.status === "rendering" ? `${state.progress}%` : "Queued"}
                  </span>
                ) : null}

                {completed && state?.exportId ? (
                  <Button asChild variant="gradient" size="sm">
                    <a href={`/api/exports/${state.exportId}/content`} download>
                      <Download className="size-4" />
                      Download
                    </a>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startExport(clip)}
                    disabled={rendering}
                  >
                    {rendering ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Rendering
                      </>
                    ) : state?.status === "failed" ? (
                      "Retry export"
                    ) : (
                      <>
                        <Download className="size-4" />
                        Export
                      </>
                    )}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
        <StatusPill status={project.status} />
        <span>· {clips.length} clips</span>
      </div>
    </div>
  );
}
