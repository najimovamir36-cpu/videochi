import type { ApiErrorCode, ApiResponse } from "@/types/api";

/** Error thrown by `apiFetch` when the API returns a failure envelope. */
export class ApiClientError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(
    message: string,
    code: ApiErrorCode = "internal_error",
    status = 500,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Thin typed wrapper around `fetch` that understands the app's response
 * envelope and normalises every failure into `ApiClientError`.
 */
export async function apiFetch<TData>(
  path: string,
  { body, headers, ...init }: ApiFetchOptions = {},
): Promise<TData> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiClientError(
      "Network unavailable. Check your connection and try again.",
      "internal_error",
      0,
    );
  }

  let payload: ApiResponse<TData> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<TData>;
  } catch {
    payload = null;
  }

  if (!payload) {
    throw new ApiClientError(
      response.ok ? "The server returned an empty response." : "The request failed.",
      "internal_error",
      response.status,
    );
  }

  if (!payload.ok) {
    throw new ApiClientError(
      payload.error.message,
      payload.error.code,
      response.status,
      payload.error.fields ?? {},
    );
  }

  return payload.data;
}

export const api = {
  get: <T>(path: string, options?: ApiFetchOptions) => apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
