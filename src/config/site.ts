/**
 * Single source of truth for brand + marketing metadata.
 * Imported by SEO helpers, footer, navigation and structured data.
 */

export const siteConfig = {
  name: "ClipMind AI",
  shortName: "ClipMind",
  tagline: "Upload long videos. Get viral shorts automatically.",
  description:
    "ClipMind AI turns podcasts, interviews, webinars and YouTube videos into ready-to-post vertical shorts — with viral moment detection, animated captions, auto reframe and 4K export.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  locale: "en_US",
  company: {
    legalName: "ClipMind Labs, Inc.",
    address: "2261 Market Street, San Francisco, CA 94114",
    supportEmail: "support@clipmind.ai",
    salesEmail: "sales@clipmind.ai",
    pressEmail: "press@clipmind.ai",
    phone: "+1 (415) 555-0134",
  },
  links: {
    twitter: "https://twitter.com/clipmindai",
    github: "https://github.com/clipmindai",
    linkedin: "https://www.linkedin.com/company/clipmindai",
    youtube: "https://www.youtube.com/@clipmindai",
    docs: "/docs",
    status: "https://status.clipmind.ai",
  },
  keywords: [
    "AI video editing",
    "viral clips generator",
    "podcast to shorts",
    "auto captions",
    "auto reframe",
    "YouTube shorts AI",
    "TikTok clip generator",
    "video repurposing",
  ],
  legal: {
    termsUpdatedAt: "2026-06-01",
    privacyUpdatedAt: "2026-06-01",
  },
} as const;

export type SiteConfig = typeof siteConfig;
