import type { UploadStatus } from "@/types/media";

/** Client-side representation of a file moving through the upload queue. */
export interface UploadTask {
  id: string;
  file: File;
  fileName: string;
  size: number;
  mimeType: string;
  extension: string;
  status: UploadStatus;
  /** 0–100. */
  progress: number;
  /** Bytes already transferred. */
  uploadedBytes: number;
  /** Bytes per second, smoothed. */
  speed: number;
  /** Seconds remaining, derived from `speed`. */
  etaSeconds: number;
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
}

export type UploadTaskPatch = Partial<Omit<UploadTask, "id" | "file">>;

export interface UploadRejection {
  fileName: string;
  reason: string;
}

export interface UploadQueueSummary {
  total: number;
  active: number;
  completed: number;
  failed: number;
  totalBytes: number;
  uploadedBytes: number;
  /** 0–100 across the whole queue. */
  progress: number;
}
