/**
 * XHR-based upload transport.
 *
 * `fetch` cannot report request-body progress, so uploads use XMLHttpRequest —
 * the only browser API that exposes byte-level upload progress, which the UI
 * needs for percentage, speed and ETA.
 */

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  /** 0–100. */
  percent: number;
}

export interface UploadTransportOptions {
  url: string;
  file: Blob;
  method?: "POST" | "PUT";
  headers?: Record<string, string>;
  onProgress?: (event: UploadProgressEvent) => void;
  signal?: AbortSignal;
}

export class UploadAbortedError extends Error {
  constructor() {
    super("Upload cancelled.");
    this.name = "UploadAbortedError";
  }
}

export class UploadTransportError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UploadTransportError";
    this.status = status;
  }
}

export function uploadFile<TResponse = unknown>({
  url,
  file,
  method = "PUT",
  headers = {},
  onProgress,
  signal,
}: UploadTransportOptions): Promise<TResponse> {
  return new Promise<TResponse>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadAbortedError());
      return;
    }

    const request = new XMLHttpRequest();
    request.open(method, url, true);
    request.responseType = "json";

    for (const [key, value] of Object.entries(headers)) {
      request.setRequestHeader(key, value);
    }

    const onAbort = () => request.abort();
    signal?.addEventListener("abort", onAbort, { once: true });

    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: event.total === 0 ? 0 : (event.loaded / event.total) * 100,
      });
    });

    request.addEventListener("load", () => {
      cleanup();

      const payload = request.response as { ok?: boolean; data?: TResponse; error?: { message?: string } } | null;

      if (request.status >= 200 && request.status < 300 && payload?.ok) {
        resolve(payload.data as TResponse);
        return;
      }

      reject(
        new UploadTransportError(
          payload?.error?.message ?? `Upload failed with status ${request.status}.`,
          request.status,
        ),
      );
    });

    request.addEventListener("error", () => {
      cleanup();
      reject(new UploadTransportError("The connection dropped during upload.", 0));
    });

    request.addEventListener("timeout", () => {
      cleanup();
      reject(new UploadTransportError("The upload timed out.", 408));
    });

    request.addEventListener("abort", () => {
      cleanup();
      reject(new UploadAbortedError());
    });

    request.send(file);
  });
}

/** Exponential moving average, used to smooth jittery transfer-rate samples. */
export function smoothRate(previous: number, sample: number, weight = 0.25): number {
  if (previous <= 0) return sample;
  return previous * (1 - weight) + sample * weight;
}
