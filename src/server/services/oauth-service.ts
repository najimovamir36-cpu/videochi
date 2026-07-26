import { ServiceUnavailableError, UnauthorizedError } from "@/server/core/errors";
import { env } from "@/server/core/env";
import type { SocialProvider } from "@/types/auth";

/**
 * Social sign-in.
 *
 * Google is fully wired: `createAuthorizationUrl` builds a real Google OAuth
 * URL, `exchangeCodeForProfile` trades the callback's `code` for the user's
 * verified email/name/picture. GitHub and Apple are still stubs — connecting
 * one means adding its provider config below plus a token-exchange branch in
 * `exchangeCodeForProfile` (same shape as Google's).
 */

export interface OAuthProfile {
  email: string;
  name: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

interface ProviderConfig {
  label: string;
  clientIdVar: string;
  clientSecretVar: string;
}

const PROVIDERS: Record<SocialProvider, ProviderConfig> = {
  google: {
    label: "Google",
    clientIdVar: "GOOGLE_CLIENT_ID",
    clientSecretVar: "GOOGLE_CLIENT_SECRET",
  },
  github: {
    label: "GitHub",
    clientIdVar: "GITHUB_CLIENT_ID",
    clientSecretVar: "GITHUB_CLIENT_SECRET",
  },
  apple: {
    label: "Apple",
    clientIdVar: "APPLE_CLIENT_ID",
    clientSecretVar: "APPLE_CLIENT_SECRET",
  },
};

function callbackUrl(provider: SocialProvider): string {
  return `${env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/${provider}/callback`;
}

interface GoogleTokenResponse {
  access_token: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export const oauthService = {
  isSupported(provider: string): provider is SocialProvider {
    return provider in PROVIDERS;
  },

  isConfigured(provider: SocialProvider): boolean {
    const config = PROVIDERS[provider];
    return Boolean(process.env[config.clientIdVar] && process.env[config.clientSecretVar]);
  },

  /** Resolves the provider's authorization URL, or explains why it cannot. */
  async createAuthorizationUrl(provider: SocialProvider, state: string): Promise<{ redirectUrl: string }> {
    const { label } = PROVIDERS[provider];

    if (!this.isConfigured(provider)) {
      throw new ServiceUnavailableError(
        `${label} sign-in is not connected yet. Sign in with your email and password instead.`,
      );
    }

    if (provider === "google") {
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
      url.searchParams.set("redirect_uri", callbackUrl(provider));
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "openid email profile");
      url.searchParams.set("state", state);
      url.searchParams.set("access_type", "online");
      url.searchParams.set("prompt", "select_account");
      return { redirectUrl: url.toString() };
    }

    // Credentials exist but the exchange step is still missing; fail loudly
    // rather than starting a flow that cannot finish.
    throw new ServiceUnavailableError(
      `${label} credentials are configured, but the OAuth callback handler has not been implemented yet.`,
    );
  },

  /** Trades an authorization `code` for the signed-in user's profile. */
  async exchangeCodeForProfile(provider: SocialProvider, code: string): Promise<OAuthProfile> {
    if (provider !== "google") {
      throw new ServiceUnavailableError(`${PROVIDERS[provider].label} sign-in is not implemented yet.`);
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: callbackUrl(provider),
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new UnauthorizedError(
        `Google sign-in failed${tokenData.error_description ? `: ${tokenData.error_description}` : "."}`,
      );
    }

    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userInfoResponse.ok) {
      throw new UnauthorizedError("Could not read your Google profile.");
    }

    const profile = (await userInfoResponse.json()) as GoogleUserInfo;
    if (!profile.email) {
      throw new UnauthorizedError("Your Google account has no email address to sign in with.");
    }

    return {
      email: profile.email,
      name: profile.name?.trim() || profile.email.split("@")[0]!,
      avatarUrl: profile.picture ?? null,
      emailVerified: profile.email_verified ?? false,
    };
  },

  listProviders(): Array<{ id: SocialProvider; label: string; configured: boolean }> {
    return (Object.keys(PROVIDERS) as SocialProvider[]).map((id) => ({
      id,
      label: PROVIDERS[id].label,
      configured: this.isConfigured(id),
    }));
  },
};
