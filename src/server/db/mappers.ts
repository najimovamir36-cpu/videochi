import type {
  AppNotification as PrismaNotification,
  Clip as PrismaClip,
  ExportJob as PrismaExport,
  Invoice as PrismaInvoice,
  PaymentMethod as PrismaPaymentMethod,
  Project as PrismaProject,
  UsageSummary as PrismaUsage,
  User as PrismaUser,
  VideoUpload as PrismaUpload,
} from "@prisma/client";

import type { AppNotification } from "@/types";
import type { PlanId, UserRecord, UserRole } from "@/types/auth";
import type { Invoice, PaymentMethod } from "@/types/billing";
import type {
  AspectRatio,
  Clip,
  ExportJob,
  ExportResolution,
  Project,
  ProjectStatus,
  UsageSummary,
  UploadStatus,
  VideoUpload,
} from "@/types/media";

/**
 * Boundary mappers: Prisma rows carry `Date` objects and enum-like columns
 * typed as plain `string`, while the app's domain types use ISO strings and
 * narrow string unions. Every value leaving a repository passes through here so
 * the rest of the codebase keeps working against the exact same shapes it did
 * when the store was in memory.
 */

const iso = (date: Date): string => date.toISOString();

export function mapUser(row: PrismaUser): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatarUrl,
    role: row.role as UserRole,
    plan: row.plan as PlanId,
    createdAt: iso(row.createdAt),
    emailVerified: row.emailVerified,
    passwordHash: row.passwordHash,
  };
}

export function mapUpload(row: PrismaUpload): VideoUpload {
  return {
    id: row.id,
    ownerId: row.ownerId,
    fileName: row.fileName,
    size: row.size,
    mimeType: row.mimeType,
    duration: row.duration,
    status: row.status as UploadStatus,
    thumbnailColor: row.thumbnailColor,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    source: row.source as VideoUpload["source"],
  };
}

export function mapProject(row: PrismaProject): Project {
  return {
    id: row.id,
    ownerId: row.ownerId,
    uploadId: row.uploadId,
    title: row.title,
    status: row.status as ProjectStatus,
    clipCount: row.clipCount,
    duration: row.duration,
    language: row.language,
    thumbnailColor: row.thumbnailColor,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function mapClip(row: PrismaClip): Clip {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    startAt: row.startAt,
    duration: row.duration,
    score: row.score,
    aspectRatio: row.aspectRatio as AspectRatio,
    hasCaptions: row.hasCaptions,
    speakerCount: row.speakerCount,
  };
}

export function mapExport(row: PrismaExport): ExportJob {
  return {
    id: row.id,
    ownerId: row.ownerId,
    projectId: row.projectId,
    projectTitle: row.projectTitle,
    clipTitle: row.clipTitle,
    status: row.status as ExportJob["status"],
    resolution: row.resolution as ExportResolution,
    aspectRatio: row.aspectRatio as AspectRatio,
    size: row.size,
    progress: row.progress,
    createdAt: iso(row.createdAt),
    completedAt: row.completedAt ? iso(row.completedAt) : null,
  };
}

export function mapNotification(row: PrismaNotification): AppNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    kind: row.kind as AppNotification["kind"],
    read: row.read,
    createdAt: iso(row.createdAt),
  };
}

export function mapUsage(row: PrismaUsage): UsageSummary {
  return {
    creditsUsed: row.creditsUsed,
    creditsTotal: row.creditsTotal,
    storageUsed: row.storageUsed,
    storageTotal: row.storageTotal,
    minutesProcessed: row.minutesProcessed,
    minutesIncluded: row.minutesIncluded,
    renderMinutesUsed: row.renderMinutesUsed,
    renderMinutesTotal: row.renderMinutesTotal,
    resetsAt: iso(row.resetsAt),
  };
}

export function mapInvoice(row: PrismaInvoice): Invoice {
  return {
    id: row.id,
    number: row.number,
    amount: row.amount,
    status: row.status as Invoice["status"],
    issuedAt: iso(row.issuedAt),
    periodLabel: row.periodLabel,
    downloadUrl: row.downloadUrl,
  };
}

export function mapPaymentMethod(row: PrismaPaymentMethod): PaymentMethod {
  return {
    id: row.id,
    brand: row.brand as PaymentMethod["brand"],
    last4: row.last4,
    expMonth: row.expMonth,
    expYear: row.expYear,
    isDefault: row.isDefault,
  };
}
