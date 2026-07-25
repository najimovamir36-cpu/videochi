import {
  UPLOAD_ERROR_MESSAGES,
  UPLOAD_LIMITS,
  getFileExtension,
  isAcceptedVideoFile,
} from "@/config/uploads";
import type { UploadRejection } from "@/types/upload";

export interface FileValidationResult {
  accepted: File[];
  rejected: UploadRejection[];
}

/**
 * Client-side gate applied before any bytes leave the browser.
 * The API re-validates the same rules — this only saves the user time.
 */
export function validateFiles(files: readonly File[], existingCount = 0): FileValidationResult {
  const accepted: File[] = [];
  const rejected: UploadRejection[] = [];
  let slots = Math.max(0, UPLOAD_LIMITS.maxFilesPerBatch - existingCount);

  for (const file of files) {
    if (slots === 0) {
      rejected.push({ fileName: file.name, reason: UPLOAD_ERROR_MESSAGES.tooMany });
      continue;
    }

    if (!isAcceptedVideoFile(file)) {
      rejected.push({ fileName: file.name, reason: UPLOAD_ERROR_MESSAGES.unsupportedType });
      continue;
    }

    if (file.size > UPLOAD_LIMITS.maxFileSize) {
      rejected.push({ fileName: file.name, reason: UPLOAD_ERROR_MESSAGES.tooLarge });
      continue;
    }

    if (file.size < UPLOAD_LIMITS.minFileSize) {
      rejected.push({ fileName: file.name, reason: UPLOAD_ERROR_MESSAGES.tooSmall });
      continue;
    }

    accepted.push(file);
    slots -= 1;
  }

  return { accepted, rejected };
}

/** Best-effort mime type, falling back to the extension when the OS reports none. */
export function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  const extension = getFileExtension(file.name);
  const map: Record<string, string> = {
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
    ".webm": "video/webm",
  };
  return map[extension] ?? "application/octet-stream";
}

/** Extracts `File` objects from a drop event, including directory entries. */
export function filesFromDataTransfer(dataTransfer: DataTransfer): File[] {
  if (dataTransfer.files.length > 0) return Array.from(dataTransfer.files);
  return Array.from(dataTransfer.items)
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
}
