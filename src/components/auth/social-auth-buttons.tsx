"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AppleIcon, GitHubIcon, GoogleIcon } from "@/components/auth/provider-icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { SocialProvider } from "@/types/auth";

const PROVIDERS: Array<{ id: SocialProvider; label: string; Icon: typeof GoogleIcon }> = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "github", label: "GitHub", Icon: GitHubIcon },
  { id: "apple", label: "Apple", Icon: AppleIcon },
];

/**
 * OAuth entry points. Each button asks the API for an authorization URL; when a
 * provider has no credentials configured the API responds with a clear reason
 * that is surfaced to the user instead of failing silently.
 */
export function SocialAuthButtons({ className }: { className?: string }) {
  const { signInWithProvider } = useAuth();
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);

  const onSelect = async (provider: SocialProvider, label: string) => {
    setPendingProvider(provider);
    try {
      const { redirectUrl } = await signInWithProvider(provider);
      window.location.assign(redirectUrl);
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : `Could not start ${label} sign-in. Try again.`;
      toast.error(`${label} sign-in unavailable`, { description: message });
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <div className={cn("grid grid-cols-3 gap-2.5", className)}>
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          size="lg"
          loading={pendingProvider === id}
          disabled={pendingProvider !== null && pendingProvider !== id}
          onClick={() => onSelect(id, label)}
          aria-label={`Continue with ${label}`}
          className="gap-2"
        >
          {pendingProvider === id ? null : <Icon className="size-4" />}
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}
