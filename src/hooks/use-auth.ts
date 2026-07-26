"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { routes } from "@/config/routes";
import { api } from "@/lib/api-client";
import type { AuthResponse } from "@/types/auth";
import type { PassphraseInput } from "@/lib/validations/auth";

/**
 * Client-side authentication actions.
 * Errors bubble up as `ApiClientError` so forms can map field-level messages.
 */
export function useAuth() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const enterWithPassphrase = useCallback(
    async (input: PassphraseInput, redirectTo: string = routes.dashboard) => {
      setIsPending(true);
      try {
        const result = await api.post<AuthResponse>(routes.api.passphrase, input);
        router.replace(redirectTo);
        router.refresh();
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    setIsPending(true);
    try {
      await api.post(routes.api.logout);
      router.replace(routes.login);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }, [router]);

  return {
    enterWithPassphrase,
    logout,
    isPending,
  };
}
