"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { routes } from "@/config/routes";
import { api } from "@/lib/api-client";
import type { AuthResponse, SocialProvider } from "@/types/auth";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/validations/auth";

/**
 * Client-side authentication actions.
 * Errors bubble up as `ApiClientError` so forms can map field-level messages.
 */
export function useAuth() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const login = useCallback(
    async (input: LoginInput, redirectTo: string = routes.dashboard) => {
      setIsPending(true);
      try {
        const result = await api.post<AuthResponse>(routes.api.login, input);
        router.replace(redirectTo);
        router.refresh();
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (input: RegisterInput, redirectTo: string = routes.dashboard) => {
      setIsPending(true);
      try {
        const result = await api.post<AuthResponse>(routes.api.register, input);
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

  const requestPasswordReset = useCallback(async (input: ForgotPasswordInput) => {
    setIsPending(true);
    try {
      return await api.post<{ sent: true; devToken: string | null }>(
        routes.api.forgotPassword,
        input,
      );
    } finally {
      setIsPending(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (input: ResetPasswordInput, redirectTo: string = routes.dashboard) => {
      setIsPending(true);
      try {
        const result = await api.post<AuthResponse>(routes.api.resetPassword, input);
        router.replace(redirectTo);
        router.refresh();
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [router],
  );

  const signInWithProvider = useCallback(async (provider: SocialProvider) => {
    setIsPending(true);
    try {
      return await api.post<{ redirectUrl: string }>(`/api/auth/oauth/${provider}`);
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    signInWithProvider,
    isPending,
  };
}
