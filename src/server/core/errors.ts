import type { ApiErrorCode } from "@/types/api";

/** Base class for every error the application raises deliberately. */
export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "The request could not be processed.") {
    super("bad_request", message, 400);
  }
}

export class ValidationError extends AppError {
  constructor(fields: Record<string, string>, message = "Please fix the highlighted fields.") {
    super("validation_error", message, 422, fields);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You need to sign in to continue.") {
    super("unauthorized", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource.") {
    super("forbidden", message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "We could not find what you were looking for.") {
    super("not_found", message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "That resource already exists.") {
    super("conflict", message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many attempts. Try again in a moment.") {
    super("rate_limited", message, 429);
  }
}

/**
 * A dependency the feature needs has not been configured yet (for example an
 * OAuth provider without credentials). Distinct from a 500: nothing is broken.
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = "This feature is not available yet.") {
    super("service_unavailable", message, 503);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
