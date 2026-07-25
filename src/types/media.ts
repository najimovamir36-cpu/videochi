export type UploadStatus =
  | "queued"
  | "uploading"
  | "paused"
  | "processing"
  | "ready"
  | "failed"
  | "cancelled";

export type ProjectStatus = "draft" | "analyzing" | "ready" | "failed";

export type ExportStatus = "queued" | "rendering" | "completed" | "failed";

export type AspectRatio = "9:16" | "1:1" | "16:9" | "4:5";

export type ExportResolution = "720p" | "1080p" | "1440p" | "4K";

export interface VideoUpload {
  id: string;
  ownerId: string;
  fileName: string;
  /** Size in bytes. */
  size: number;
  mimeType: string;
  /** Duration in seconds. */
  duration: number;
  status: UploadStatus;
  thumbnailColor: string;
  createdAt: string;
  updatedAt: string;
  source: "device" | "youtube" | "drive" | "url";
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  /** Start offset in the source video, in seconds. */
  startAt: number;
  /** Clip length in seconds. */
  duration: number;
  /** 0–100 predicted virality score. */
  score: number;
  aspectRatio: AspectRatio;
  hasCaptions: boolean;
  speakerCount: number;
}

export interface Project {
  id: string;
  ownerId: string;
  uploadId: string;
  title: string;
  status: ProjectStatus;
  clipCount: number;
  /** Source duration in seconds. */
  duration: number;
  language: string;
  thumbnailColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportJob {
  id: string;
  ownerId: string;
  projectId: string;
  projectTitle: string;
  clipTitle: string;
  status: ExportStatus;
  resolution: ExportResolution;
  aspectRatio: AspectRatio;
  /** Rendered file size in bytes, 0 while queued. */
  size: number;
  /** 0–100. */
  progress: number;
  createdAt: string;
  completedAt: string | null;
}

/** Aggregated numbers powering the dashboard statistic cards. */
export interface UsageSummary {
  creditsUsed: number;
  creditsTotal: number;
  storageUsed: number;
  storageTotal: number;
  minutesProcessed: number;
  minutesIncluded: number;
  renderMinutesUsed: number;
  renderMinutesTotal: number;
  /** Current billing period reset date, ISO string. */
  resetsAt: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  /** Percent change vs. previous period. */
  delta: number;
  format: "number" | "compact" | "duration" | "bytes";
  hint: string;
}
