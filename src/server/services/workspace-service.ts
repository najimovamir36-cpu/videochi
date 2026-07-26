import { BadRequestError, NotFoundError } from "@/server/core/errors";
import { probeMedia } from "@/server/media/ffmpeg";
import { storage } from "@/server/storage";
import {
  billingRepository,
  clipRepository,
  exportRepository,
  notificationRepository,
  projectRepository,
  uploadRepository,
  usageRepository,
} from "@/server/repositories/media-repository";
import type { AppNotification, SearchResult } from "@/types";
import type { CreateUploadInput } from "@/server/repositories/media-repository";
import type { Clip, DashboardStat, ExportJob, Project, UsageSummary, VideoUpload } from "@/types/media";

export interface DashboardOverview {
  stats: DashboardStat[];
  usage: UsageSummary;
  uploads: VideoUpload[];
  projects: Project[];
  exports: ExportJob[];
  notifications: AppNotification[];
  unreadNotifications: number;
}

/**
 * Read-model for the dashboard. Aggregating here keeps page components free of
 * data-shaping logic and gives us one place to optimise later.
 */
/** Every account should get one at registration; this heals any that slipped through. */
async function getOrCreateUsage(ownerId: string): Promise<UsageSummary> {
  const existing = await usageRepository.findByOwner(ownerId);
  if (existing) return existing;
  return usageRepository.createDefault(ownerId);
}

export const workspaceService = {
  async getOverview(ownerId: string): Promise<DashboardOverview> {
    const [uploads, projects, exportJobs, usage, notifications, unreadNotifications] =
      await Promise.all([
        uploadRepository.listByOwner(ownerId),
        projectRepository.listByOwner(ownerId),
        exportRepository.listByOwner(ownerId),
        getOrCreateUsage(ownerId),
        notificationRepository.list(ownerId, 6),
        notificationRepository.unreadCount(ownerId),
      ]);


    const readyProjects = projects.filter((project) => project.status === "ready");
    const completedExports = exportJobs.filter((job) => job.status === "completed");
    const totalClips = projects.reduce((sum, project) => sum + project.clipCount, 0);
    const sourceSeconds = uploads.reduce((sum, upload) => sum + upload.duration, 0);

    const stats: DashboardStat[] = [
      {
        id: "clips",
        label: "Clips generated",
        value: totalClips,
        delta: 24.6,
        format: "number",
        hint: `across ${readyProjects.length} analysed projects`,
      },
      {
        id: "uploads",
        label: "Videos uploaded",
        value: uploads.length,
        delta: 12.5,
        format: "number",
        hint: `${formatHours(sourceSeconds)} of source footage`,
      },
      {
        id: "exports",
        label: "Exports delivered",
        value: completedExports.length,
        delta: 8.3,
        format: "number",
        hint: "1080p and 4K vertical renders",
      },
      {
        id: "watch-time",
        label: "Minutes processed",
        value: usage.minutesProcessed,
        delta: 31.2,
        format: "compact",
        hint: `of ${usage.minutesIncluded.toLocaleString("en-US")} included this cycle`,
      },
    ];

    return {
      stats,
      usage,
      uploads,
      projects,
      exports: exportJobs,
      notifications,
      unreadNotifications,
    };
  },

  async listUploads(ownerId: string): Promise<VideoUpload[]> {
    return uploadRepository.listByOwner(ownerId);
  },

  async listProjects(ownerId: string): Promise<Project[]> {
    return projectRepository.listByOwner(ownerId);
  },

  /** One project plus its clips, enforcing ownership. */
  async getProjectDetail(
    ownerId: string,
    projectId: string,
  ): Promise<{ project: Project; clips: Clip[] }> {
    const project = await projectRepository.findById(projectId);
    if (!project || project.ownerId !== ownerId) {
      throw new NotFoundError("That project does not exist.");
    }
    const clips = await clipRepository.listByProject(project.id);
    return { project, clips };
  },

  async listExports(ownerId: string): Promise<ExportJob[]> {
    return exportRepository.listByOwner(ownerId);
  },

  async getUsage(ownerId: string): Promise<UsageSummary> {
    return getOrCreateUsage(ownerId);
  },

  async getBilling() {
    const [invoices, paymentMethods] = await Promise.all([
      billingRepository.listInvoices(),
      billingRepository.listPaymentMethods(),
    ]);
    return { invoices, paymentMethods };
  },

  async registerUpload(input: CreateUploadInput): Promise<VideoUpload> {
    return uploadRepository.create(input);
  },

  /** Loads one upload, enforcing that it belongs to the caller. */
  async getUpload(ownerId: string, uploadId: string): Promise<VideoUpload> {
    const upload = await uploadRepository.findById(uploadId);
    if (!upload) throw new NotFoundError("That upload does not exist.");

    // Deliberately a 404, not a 403: confirming existence would let one account
    // probe another's upload ids.
    if (upload.ownerId !== ownerId) throw new NotFoundError("That upload does not exist.");

    return upload;
  },

  /**
   * Marks a transfer finished. The bytes are now on disk at `storageKey`. A byte
   * count that disagrees with the registered size means the connection dropped
   * mid-flight, so the partial file is discarded and the upload is failed rather
   * than silently accepted as complete.
   *
   * On success the file is probed with ffprobe for its true duration, which
   * replaces the placeholder `0` recorded at registration time.
   */
  async completeUpload(
    ownerId: string,
    uploadId: string,
    receivedBytes: number,
    storageKey: string,
  ): Promise<VideoUpload> {
    const upload = await this.getUpload(ownerId, uploadId);

    if (receivedBytes !== upload.size) {
      await storage.remove(storageKey);
      await uploadRepository.update(upload.id, { status: "failed" });
      throw new BadRequestError(
        `Incomplete upload: expected ${upload.size} bytes but received ${receivedBytes}.`,
      );
    }

    await uploadRepository.setStorageKey(upload.id, storageKey);

    // Probe for real duration; a corrupt or non-media file fails the upload.
    let duration = 0;
    try {
      duration = await storage.withLocalCopy(storageKey, async (path) => {
        const info = await probeMedia(path);
        return info.duration;
      });
    } catch {
      await storage.remove(storageKey);
      await uploadRepository.update(upload.id, { status: "failed" });
      throw new BadRequestError("The uploaded file could not be read as a video.");
    }

    const updated = await uploadRepository.update(upload.id, { status: "ready", duration });
    if (!updated) throw new NotFoundError("That upload does not exist.");

    return updated;
  },

  /** Resolves the on-disk storage key for a caller's upload, or null if unset. */
  async getUploadStorageKey(ownerId: string, uploadId: string): Promise<string | null> {
    await this.getUpload(ownerId, uploadId);
    return uploadRepository.getStorageKey(uploadId);
  },

  async listNotifications(ownerId: string): Promise<AppNotification[]> {
    return notificationRepository.list(ownerId, 8);
  },

  async markNotificationsRead(ownerId: string): Promise<void> {
    return notificationRepository.markAllRead(ownerId);
  },

  /** Powers the top-bar search. Matches project titles, file names and clips. */
  async search(ownerId: string, query: string): Promise<SearchResult[]> {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];

    const [projects, uploads, exportJobs] = await Promise.all([
      projectRepository.listByOwner(ownerId),
      uploadRepository.listByOwner(ownerId),
      exportRepository.listByOwner(ownerId),
    ]);

    const results: SearchResult[] = [
      ...projects
        .filter((project) => project.title.toLowerCase().includes(term))
        .map((project) => ({
          id: project.id,
          title: project.title,
          subtitle: `${project.clipCount} clips · ${project.language}`,
          href: `/projects#${project.id}`,
          kind: "project" as const,
        })),
      ...uploads
        .filter((upload) => upload.fileName.toLowerCase().includes(term))
        .map((upload) => ({
          id: upload.id,
          title: upload.fileName,
          subtitle: `Upload · ${upload.status}`,
          href: `/uploads#${upload.id}`,
          kind: "upload" as const,
        })),
      ...exportJobs
        .filter((job) => job.clipTitle.toLowerCase().includes(term))
        .map((job) => ({
          id: job.id,
          title: job.clipTitle,
          subtitle: `${job.resolution} · ${job.projectTitle}`,
          href: `/exports#${job.id}`,
          kind: "export" as const,
        })),
    ];

    return results.slice(0, 8);
  },
};

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return `${hours.toFixed(1)} hours`;
}
