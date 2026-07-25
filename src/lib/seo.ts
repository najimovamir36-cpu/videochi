import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

interface BuildMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Builds page metadata from the site config so titles, canonicals and social
 * cards stay consistent across every route.
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  keywords = [],
  noIndex = false,
}: BuildMetadataOptions = {}): Metadata {
  const resolvedTitle = title ? `${title} — ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;
  const url = new URL(path, siteConfig.url).toString();

  return {
    title: resolvedTitle,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title: resolvedTitle,
      description,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      creator: "@clipmindai",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

/** JSON-LD describing the product, injected on the landing page. */
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan with 60 minutes of AI processing per month",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1284",
    },
  };
}

/** JSON-LD for the landing page FAQ section. */
export function faqJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.company.legalName,
    url: siteConfig.url,
    email: siteConfig.company.supportEmail,
    sameAs: [siteConfig.links.twitter, siteConfig.links.github, siteConfig.links.linkedin],
  };
}
