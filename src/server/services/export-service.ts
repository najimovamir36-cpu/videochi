import { NotFoundError } from "@/server/core/errors";
import { renderClip } from "@/server/pipeline/render";
import {
  clipRepository,
  exportRepository,
  notificationRepository,
  projectRepository,
  uploadRepository,
} from "@/server/repositories/media-repository";
import { makeKey } from "@/server/storage/local-storage";
import type { AspectRatio, ExportJob, ExportResolution } from "@/types/media";

/**
 * Renders clips into downloadable files.
 *
 * Like analysis, the ffmpeg render runs in the background: the export row is
 * created `queued`, moves to `rendering`, then `completed` (with the real file
 * size) or `failed`. The client polls the export's status.
 */

export interface CreateExportInput {
  ownerId: string;
  clipId: string;
  resolution?: ExportResolution;
  aspectRatio?: AspectRatio;
}

export const exportService = {
  async createExport(input: CreateExportInput): Promise<ExportJob> {
    const clip = await clipRepository.findById(input.clipId);
    if (!clip) throw new NotFoundError("That clip does not exist.");

    const project = await projectRepository.findById(clip.projectId);
    if (!project || project.ownerId !== input.ownerId) {
      throw new NotFoundError("That clip does not exist.");
    }

    const sourceKey = await uploadRepository.getStorageKey(project.uploadId);
    if (!sourceKey) throw new NotFoundError("The source video is no longer available.");

    const resolution = input.resolution ?? "1080p";
    const aspectRatio = input.aspectRatio ?? clip.aspectRatio;

    const job = await exportRepository.create({
      ownerId: input.ownerId,
      projectId: project.id,
      clipId: clip.id,
      projectTitle: project.title,
      clipTitle: clip.title,
      resolution,
      aspectRatio,
    });

    void this.runRender(job.id, {
      sourceKey,
      startAt: clip.startAt,
      duration: clip.duration,
      resolution,
      aspectRatio,
    })
      .then(async () => {
        await notificationRepository.create({
          ownerId: input.ownerId,
          title: `${resolution} export ready`,
          body: `“${clip.title}” is rendered and ready to download.`,
          kind: "export",
        });
      })
      .catch(async (error) => {
        console.error(`[export] render failed for ${job.id}`, error);
        await exportRepository.update(job.id, { status: "failed" }).catch(() => {});
        await notificationRepository
          .create({
            ownerId: input.ownerId,
            title: "Export failed",
            body: `We couldn't render “${clip.title}”. Please try again.`,
            kind: "export",
          })
          .catch(() => {});
      });

    return job;
  },

  async runRender(
    exportId: string,
    input: {
      sourceKey: string;
      startAt: number;
      duration: number;
      resolution: ExportResolution;
      aspectRatio: AspectRatio;
    },
  ): Promise<void> {
    await exportRepository.update(exportId, { status: "rendering", progress: 10 });

    const outKey = makeKey("exports", exportId, "clip.mp4");
    const size = await renderClip({
      sourceKey: input.sourceKey,
      outKey,
      startAt: input.startAt,
      duration: input.duration,
      resolution: input.resolution,
      aspectRatio: input.aspectRatio,
    });

    await exportRepository.setStorageKey(exportId, outKey);
    await exportRepository.update(exportId, {
      status: "completed",
      progress: 100,
      size,
      completedAt: new Date().toISOString(),
    });
  },

  /** Resolves the on-disk key for a caller's completed export. */
  async getExportStorageKey(ownerId: string, exportId: string): Promise<string | null> {
    const job = await exportRepository.findById(exportId);
    if (!job || job.ownerId !== ownerId) throw new NotFoundError("That export does not exist.");
    return exportRepository.getStorageKey(exportId);
  },
};
