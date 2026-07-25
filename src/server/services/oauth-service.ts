import { ServiceUnavailableError } from "@/server/core/errors";
import type { SocialProvider } from "@/types/auth";

/**
 * Social sign-in.
 *
 * The UI is finished, but no provider is connected: completing a real flow
 * needs a client id/secret pair, a registered callback URL, and a callback
 * handler that exchanges the authorization code for tokens. Handing back an
 * authorization URL without that handler would walk the user to Google and
 * drop them on a 404, so every provider reports itself unavailable until its
 * credentials are present.
 *
 * To connect one, set the two variables below and implement
 * `GET /api/auth/oauth/[provider]/callback`.
 */

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

export const oauthService = {
  isSupported(provider: string): provider is SocialProvider {
    return provider in PROVIDERS;
  },

  isConfigured(provider: SocialProvider): boolean {
    const config = PROVIDERS[provider];
    return Boolean(process.env[config.clientIdVar] && process.env[config.clientSecretVar]);
  },

  /**
   * Resolves the provider's authorization URL, or explains why it cannot.
   * Throws `ServiceUnavailableError` while the provider has no credentials.
   */
  async createAuthorizationUrl(provider: SocialProvider): Promise<{ redirectUrl: string }> {
    const { label } = PROVIDERS[provider];

    if (!this.isConfigured(provider)) {
      throw new ServiceUnavailableError(
        `${label} sign-in is not connected yet. Sign in with your email and password instead.`,
      );
    }

    // Credentials exist but the exchange step is still missing; fail loudly
    // rather than starting a flow that cannot finish.
    throw new ServiceUnavailableError(
      `${label} credentials are configured, but the OAuth callback handler has not been implemented yet.`,
    );
  },

  listProviders(): Array<{ id: SocialProvider; label: string; configured: boolean }> {
    return (Object.keys(PROVIDERS) as SocialProvider[]).map((id) => ({
      id,
      label: PROVIDERS[id].label,
      configured: this.isConfigured(id),
    }));
  },
};
