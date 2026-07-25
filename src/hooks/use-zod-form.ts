"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";

import { ApiClientError } from "@/lib/api-client";

type FieldErrors<TValues> = Partial<Record<keyof TValues & string, string>>;

export interface UseZodFormOptions<TValues, TOutput> {
  // Only the schema's *output* is pinned to `TOutput`; the input side is left
  // open so schemas with `.default()`/`.optional()` fields (whose input type is
  // wider than their output) still satisfy the constraint.
  schema: ZodType<TOutput, ZodTypeDef, unknown>;
  initialValues: TValues;
  onSubmit: (values: TOutput) => Promise<void> | void;
}

export interface UseZodForm<TValues> {
  values: TValues;
  errors: FieldErrors<TValues>;
  formError: string | null;
  isSubmitting: boolean;
  isDirty: boolean;
  setValue: <TKey extends keyof TValues & string>(key: TKey, value: TValues[TKey]) => void;
  setValues: (patch: Partial<TValues>) => void;
  setFormError: (message: string | null) => void;
  handleBlur: (key: keyof TValues & string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  reset: () => void;
  fieldProps: <TKey extends keyof TValues & string>(
    key: TKey,
  ) => {
    name: TKey;
    value: string;
    onChange: (event: { target: { value: string } }) => void;
    onBlur: () => void;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  };
}

/**
 * Dependency-free typed form controller.
 *
 * Validation reuses the same Zod schema the API enforces, so client and server
 * rules can never drift. Field errors surface on blur and on submit; API field
 * errors are merged into the same map.
 */
export function useZodForm<TValues extends object, TOutput>({
  schema,
  initialValues,
  onSubmit,
}: UseZodFormOptions<TValues, TOutput>): UseZodForm<TValues> {
  const [values, setValuesState] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<TValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const isDirty = useMemo(
    () =>
      (Object.keys(initialValues) as (keyof TValues)[]).some(
        (key) => values[key] !== initialValues[key],
      ),
    [initialValues, values],
  );

  const validateField = useCallback(
    (key: string, candidate: TValues) => {
      const result = schema.safeParse(candidate);
      if (result.success) {
        setErrors((current) => {
          const next = { ...current };
          delete next[key as keyof TValues & string];
          return next;
        });
        return;
      }

      const issue = result.error.issues.find((entry) => entry.path[0] === key);
      setErrors((current) => ({
        ...current,
        [key]: issue?.message,
      }) as FieldErrors<TValues>);
    },
    [schema],
  );

  const setValue = useCallback(
    <TKey extends keyof TValues & string>(key: TKey, value: TValues[TKey]) => {
      setValuesState((current) => {
        const next = { ...current, [key]: value };
        if (touched.has(key)) validateField(key, next);
        return next;
      });
      setFormError(null);
    },
    [touched, validateField],
  );

  const setValues = useCallback((patch: Partial<TValues>) => {
    setValuesState((current) => ({ ...current, ...patch }));
  }, []);

  const handleBlur = useCallback(
    (key: keyof TValues & string) => {
      setTouched((current) => new Set(current).add(key));
      validateField(key, values);
    },
    [validateField, values],
  );

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setFormError(null);
    setTouched(new Set());
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) return;

      setFormError(null);

      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        setErrors(collectErrors(parsed.error));
        setTouched(new Set(Object.keys(values)));
        return;
      }

      setErrors({});
      setIsSubmitting(true);

      try {
        await onSubmit(parsed.data);
      } catch (error) {
        if (error instanceof ApiClientError) {
          if (Object.keys(error.fields).length > 0) {
            setErrors(error.fields as FieldErrors<TValues>);
          }
          setFormError(error.message);
        } else if (error instanceof ZodError) {
          setErrors(collectErrors(error));
        } else {
          setFormError(
            error instanceof Error ? error.message : "Something went wrong. Please try again.",
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onSubmit, schema, values],
  );

  const fieldProps = useCallback(
    <TKey extends keyof TValues & string>(key: TKey) => ({
      name: key,
      value: String(values[key] ?? ""),
      onChange: (event: { target: { value: string } }) =>
        setValue(key, event.target.value as TValues[TKey]),
      onBlur: () => handleBlur(key),
      "aria-invalid": Boolean(errors[key]),
      "aria-describedby": errors[key] ? `${key}-error` : undefined,
    }),
    [errors, handleBlur, setValue, values],
  );

  return {
    values,
    errors,
    formError,
    isSubmitting,
    isDirty,
    setValue,
    setValues,
    setFormError,
    handleBlur,
    handleSubmit,
    reset,
    fieldProps,
  };
}

function collectErrors<TValues>(error: ZodError): FieldErrors<TValues> {
  const collected: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    collected[key] ??= issue.message;
  }
  return collected as FieldErrors<TValues>;
}
