/**
 * Upload constraints shared by the client dropzone and the server validators,
 * so the browser and the API can never disagree about what is accepted.
 */

export type AcceptedVideoFormat = {
  extension: string;
  label: string;
  mimeTypes: readonly string[];
};

export const ACCEPTED_VIDEO_FORMATS: readonly AcceptedVideoFormat[] = [
  { extension: ".mp4", label: "MP4", mimeTypes: ["video/mp4"] },
  { extension: ".mov", label: "MOV", mimeTypes: ["video/quicktime"] },
  { extension: ".avi", label: "AVI", mimeTypes: ["video/x-msvideo", "video/avi"] },
  { extension: ".mkv", label: "MKV", mimeTypes: ["video/x-matroska"] },
  { extension: ".webm", label: "WEBM", mimeTypes: ["video/webm"] },
] as const;

export const ACCEPTED_EXTENSIONS = ACCEPTED_VIDEO_FORMATS.map((format) => format.extension);

export const ACCEPTED_MIME_TYPES = ACCEPTED_VIDEO_FORMATS.flatMap((format) => format.mimeTypes);

/** Value for the `accept` attribute of `<input type="file">`. */
export const FILE_INPUT_ACCEPT = [...ACCEPTED_MIME_TYPES, ...ACCEPTED_EXTENSIONS].join(",");

export const UPLOAD_LIMITS = {
  /** 8 GB per file. */
  maxFileSize: 8 * 1024 * 1024 * 1024,
  /** Reject empty or truncated files early. */
  minFileSize: 64 * 1024,
  maxFilesPerBatch: 10,
  maxConcurrentUploads: 3,
  chunkSize: 8 * 1024 * 1024,
} as const;

export const UPLOAD_ERROR_MESSAGES = {
  unsupportedType: `Unsupported format. Use ${ACCEPTED_VIDEO_FORMATS.map((f) => f.label).join(", ")}.`,
  tooLarge: "This file is larger than the 8 GB limit for your plan.",
  tooSmall: "This file looks incomplete — it is under 64 KB.",
  tooMany: `You can queue up to ${UPLOAD_LIMITS.maxFilesPerBatch} files at once.`,
  network: "The connection dropped during upload. You can retry from where it stopped.",
  cancelled: "Upload cancelled.",
} as const;

/** True when the browser-reported type or the extension is in the allow-list. */
export function isAcceptedVideoFile(file: { name: string; type: string }): boolean {
  const normalizedType = file.type.toLowerCase();
  if (normalizedType && ACCEPTED_MIME_TYPES.includes(normalizedType)) return true;
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(extension);
}

export function getFileExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index === -1 ? "" : fileName.slice(index).toLowerCase();
}
