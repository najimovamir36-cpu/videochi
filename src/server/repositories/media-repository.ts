import { prisma } from "@/server/db/client";
import {
  mapClip,
  mapExport,
  mapInvoice,
  mapNotification,
  mapPaymentMethod,
  mapProject,
  mapUpload,
  mapUsage,
} from "@/server/db/mappers";
import { ensureSeeded } from "@/server/db/seed";
import { createId } from "@/lib/utils";
import type { AppNotification } from "@/types";
import type { Invoice, PaymentMethod } from "@/types/billing";
import type { Clip, ExportJob, Project, UsageSummary, VideoUpload } from "@/types/media";

export interface CreateUploadInput {
  ownerId: string;
  fileName: string;
  size: number;
  mimeType: string;
  source: VideoUpload["source"];
}

const PALETTE = ["#7c5cff", "#22d3ee", "#ec4899", "#f59e0b", "#34d399", "#38bdf8", "#a78bfa"];

/** Stable colour per id so thumbnails never flicker between renders. */
function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 100_000;
  return PALETTE[hash % PALETTE.length] as string;
}

export const uploadRepository = {
  async listByOwner(ownerId: string, limit?: number): Promise<VideoUpload[]> {
    await ensureSeeded();
    const rows = await prisma.videoUpload.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(mapUpload);
  },

  async findById(id: string): Promise<VideoUpload | null> {
    await ensureSeeded();
    const row = await prisma.videoUpload.findUnique({ where: { id } });
    return row ? mapUpload(row) : null;
  },

  async create(input: CreateUploadInput): Promise<VideoUpload> {
    await ensureSeeded();
    const id = createId("upl");
    const row = await prisma.videoUpload.create({
      data: {
        id,
        ownerId: input.ownerId,
        fileName: input.fileName,
        size: input.size,
        mimeType: input.mimeType,
        duration: 0,
        status: "queued",
        thumbnailColor: colorFor(id),
        source: input.source,
      },
    });
    return mapUpload(row);
  },

  async update(id: string, patch: Partial<Omit<VideoUpload, "id">>): Promise<VideoUpload | null> {
    await ensureSeeded();
    const existing = await prisma.videoUpload.findUnique({ where: { id } });
    if (!existing) return null;
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = patch;
    const row = await prisma.videoUpload.update({ where: { id }, data: rest });
    return mapUpload(row);
  },

  /** Records where the uploaded bytes live on disk. */
  async setStorageKey(id: string, storageKey: string): Promise<void> {
    await prisma.videoUpload.update({ where: { id }, data: { storageKey } });
  },

  async getStorageKey(id: string): Promise<string | null> {
    const row = await prisma.videoUpload.findUnique({ where: { id }, select: { storageKey: true } });
    return row?.storageKey ?? null;
  },

  async remove(id: string): Promise<boolean> {
    await ensureSeeded();
    try {
      await prisma.videoUpload.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async totalStorage(ownerId: string): Promise<number> {
    await ensureSeeded();
    const result = await prisma.videoUpload.aggregate({
      where: { ownerId },
      _sum: { size: true },
    });
    return result._sum.size ?? 0;
  },
};

export const projectRepository = {
  async listByOwner(ownerId: string, limit?: number): Promise<Project[]> {
    await ensureSeeded();
    const rows = await prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(mapProject);
  },

  async findById(id: string): Promise<Project | null> {
    await ensureSeeded();
    const row = await prisma.project.findUnique({ where: { id } });
    return row ? mapProject(row) : null;
  },

  async create(
    input: Omit<Project, "id" | "createdAt" | "updatedAt" | "thumbnailColor">,
  ): Promise<Project> {
    await ensureSeeded();
    const id = createId("prj");
    const row = await prisma.project.create({
      data: { ...input, id, thumbnailColor: colorFor(id) },
    });
    return mapProject(row);
  },

  async update(id: string, patch: Partial<Omit<Project, "id">>): Promise<Project | null> {
    await ensureSeeded();
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return null;
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = patch;
    const row = await prisma.project.update({ where: { id }, data: rest });
    return mapProject(row);
  },

  /** Persists the full transcript text produced by the analysis pipeline. */
  async setTranscript(id: string, transcript: string): Promise<void> {
    await prisma.project.update({ where: { id }, data: { transcript } });
  },
};

export interface CreateClipInput {
  projectId: string;
  title: string;
  startAt: number;
  duration: number;
  score: number;
  aspectRatio: Clip["aspectRatio"];
  hasCaptions?: boolean;
  speakerCount?: number;
  reason?: string;
}

export const clipRepository = {
  async listByProject(projectId: string): Promise<Clip[]> {
    await ensureSeeded();
    const rows = await prisma.clip.findMany({
      where: { projectId },
      orderBy: { score: "desc" },
    });
    return rows.map(mapClip);
  },

  async findById(id: string): Promise<Clip | null> {
    await ensureSeeded();
    const row = await prisma.clip.findUnique({ where: { id } });
    return row ? mapClip(row) : null;
  },

  async create(input: CreateClipInput): Promise<Clip> {
    await ensureSeeded();
    const row = await prisma.clip.create({
      data: {
        id: createId("clp"),
        projectId: input.projectId,
        title: input.title,
        startAt: input.startAt,
        duration: input.duration,
        score: input.score,
        aspectRatio: input.aspectRatio,
        hasCaptions: input.hasCaptions ?? false,
        speakerCount: input.speakerCount ?? 1,
        reason: input.reason ?? null,
      },
    });
    return mapClip(row);
  },
};

export interface CreateExportInput {
  ownerId: string;
  projectId: string;
  clipId: string;
  projectTitle: string;
  clipTitle: string;
  resolution: ExportJob["resolution"];
  aspectRatio: ExportJob["aspectRatio"];
}

export const exportRepository = {
  async listByOwner(ownerId: string, limit?: number): Promise<ExportJob[]> {
    await ensureSeeded();
    const rows = await prisma.exportJob.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(mapExport);
  },

  async findById(id: string): Promise<ExportJob | null> {
    await ensureSeeded();
    const row = await prisma.exportJob.findUnique({ where: { id } });
    return row ? mapExport(row) : null;
  },

  async create(input: CreateExportInput): Promise<ExportJob> {
    await ensureSeeded();
    const row = await prisma.exportJob.create({
      data: {
        id: createId("exp"),
        ownerId: input.ownerId,
        projectId: input.projectId,
        clipId: input.clipId,
        projectTitle: input.projectTitle,
        clipTitle: input.clipTitle,
        status: "queued",
        resolution: input.resolution,
        aspectRatio: input.aspectRatio,
        size: 0,
        progress: 0,
      },
    });
    return mapExport(row);
  },

  async update(id: string, patch: Partial<Omit<ExportJob, "id">>): Promise<ExportJob | null> {
    await ensureSeeded();
    const { createdAt: _createdAt, completedAt, ...rest } = patch;
    const row = await prisma.exportJob.update({
      where: { id },
      data: {
        ...rest,
        ...(completedAt !== undefined ? { completedAt: completedAt ? new Date(completedAt) : null } : {}),
      },
    });
    return mapExport(row);
  },

  async setStorageKey(id: string, storageKey: string): Promise<void> {
    await prisma.exportJob.update({ where: { id }, data: { storageKey } });
  },

  async getStorageKey(id: string): Promise<string | null> {
    const row = await prisma.exportJob.findUnique({ where: { id }, select: { storageKey: true } });
    return row?.storageKey ?? null;
  },
};

export interface CreateNotificationInput {
  ownerId: string;
  title: string;
  body: string;
  kind: AppNotification["kind"];
}

export const notificationRepository = {
  async list(ownerId: string, limit = 10): Promise<AppNotification[]> {
    await ensureSeeded();
    const rows = await prisma.appNotification.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(mapNotification);
  },

  async create(input: CreateNotificationInput): Promise<AppNotification> {
    await ensureSeeded();
    const row = await prisma.appNotification.create({
      data: {
        id: createId("ntf"),
        ownerId: input.ownerId,
        title: input.title,
        body: input.body,
        kind: input.kind,
        read: false,
      },
    });
    return mapNotification(row);
  },

  async markAllRead(ownerId: string): Promise<void> {
    await ensureSeeded();
    await prisma.appNotification.updateMany({ where: { ownerId }, data: { read: true } });
  },

  async unreadCount(ownerId: string): Promise<number> {
    await ensureSeeded();
    return prisma.appNotification.count({ where: { ownerId, read: false } });
  },
};

export const usageRepository = {
  async findByOwner(ownerId: string): Promise<UsageSummary | null> {
    await ensureSeeded();
    const row = await prisma.usageSummary.findUnique({ where: { ownerId } });
    return row ? mapUsage(row) : null;
  },

  /** Starting usage row for a brand-new account, sized to the free plan's limits. */
  async createDefault(ownerId: string): Promise<UsageSummary> {
    const DAY = 24 * 60 * 60 * 1000;
    const row = await prisma.usageSummary.create({
      data: {
        ownerId,
        creditsUsed: 0,
        creditsTotal: 60,
        storageUsed: 0,
        storageTotal: 5 * 1024 * 1024 * 1024,
        minutesProcessed: 0,
        minutesIncluded: 60,
        renderMinutesUsed: 0,
        renderMinutesTotal: 60,
        resetsAt: new Date(Date.now() + 30 * DAY),
      },
    });
    return mapUsage(row);
  },
};

export const billingRepository = {
  async listInvoices(): Promise<Invoice[]> {
    await ensureSeeded();
    const rows = await prisma.invoice.findMany({ orderBy: { issuedAt: "desc" } });
    return rows.map(mapInvoice);
  },

  async listPaymentMethods(): Promise<PaymentMethod[]> {
    await ensureSeeded();
    const rows = await prisma.paymentMethod.findMany();
    return rows.map(mapPaymentMethod);
  },
};
