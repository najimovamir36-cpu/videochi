import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";

import { AppError, BadRequestError, ValidationError, isAppError } from "@/server/core/errors";
import type { ApiFailure, ApiSuccess } from "@/types/api";

/** `200 OK` (or the supplied status) with the standard success envelope. */
export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data } satisfies ApiSuccess<T>, { status: 200, ...init });
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, { status: 201 });
}

export function failure(error: AppError): NextResponse<ApiFailure> {
  return NextResponse.json(
    {
      ok: false,
      error: { code: error.code, message: error.message, ...(error.fields ? { fields: error.fields } : {}) },
    } satisfies ApiFailure,
    { status: error.status },
  );
}

/** Flattens a Zod error into `{ fieldName: message }`. */
export function fieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    fields[key] ??= issue.message;
  }
  return fields;
}

/**
 * Parses and validates a JSON request body, throwing typed errors on failure.
 *
 * Returns the schema's *output* type, so fields with `.default()` are resolved
 * (non-optional) exactly as the services downstream expect them.
 */
export async function parseJsonBody<S extends ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<z.output<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new BadRequestError("Expected a JSON request body.");
  }

  const result = schema.safeParse(raw);
  if (!result.success) throw new ValidationError(fieldErrors(result.error));
  return result.data;
}

/**
 * Wraps a route handler so every thrown error becomes a consistent envelope
 * and unexpected failures never leak internals to the client.
 */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (isAppError(error)) return failure(error);

      if (error instanceof ZodError) {
        return failure(new ValidationError(fieldErrors(error)));
      }

      console.error("[api] unhandled error", error);
      return NextResponse.json(
        {
          ok: false,
          error: { code: "internal_error", message: "Something went wrong on our side." },
        } satisfies ApiFailure,
        { status: 500 },
      );
    }
  };
}
