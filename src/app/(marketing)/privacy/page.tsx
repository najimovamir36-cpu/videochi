import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  path: routes.privacy,
  description:
    "How ClipMind AI collects, processes, stores and deletes your data — including uploaded footage, transcripts and account information.",
});

const sections: LegalSection[] = [
  {
    id: "overview",
    heading: "Overview",
    body: (
      <>
        <p>
          This policy explains what {siteConfig.company.legalName} collects when you use ClipMind AI,
          why we collect it, how long we keep it, and the choices you have. It applies to the web
          application, our APIs and our marketing site.
        </p>
        <p>
          <strong>The short version:</strong> we process your footage only to produce the clips you
          ask for, we never use it to train models, and you can delete it at any time.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    heading: "Data we collect",
    body: (
      <>
        <ul>
          <li>
            <strong>Account data</strong> — name, email address, hashed password, workspace name and
            plan.
          </li>
          <li>
            <strong>Uploaded media</strong> — the video and audio files you upload, plus derived
            artefacts such as transcripts, speaker labels, clip boundaries and rendered exports.
          </li>
          <li>
            <strong>Usage data</strong> — processing minutes, storage consumed, feature usage and
            export history, used for billing and capacity planning.
          </li>
          <li>
            <strong>Technical data</strong> — IP address, browser and device type, and timestamps,
            collected in server logs for security and abuse prevention.
          </li>
          <li>
            <strong>Billing data</strong> — handled by our payment processor. We store only the last
            four digits, card brand and expiry; we never receive full card numbers.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    heading: "How we use data",
    body: (
      <>
        <p>We process data on the following legal bases:</p>
        <ul>
          <li>
            <strong>Contract</strong> — to run the analysis, rendering and delivery you requested, and
            to bill for it.
          </li>
          <li>
            <strong>Legitimate interests</strong> — to secure the platform, prevent abuse, debug
            failures and improve reliability.
          </li>
          <li>
            <strong>Consent</strong> — for product emails and optional analytics, which you can
            withdraw at any time.
          </li>
          <li>
            <strong>Legal obligation</strong> — to retain invoices and respond to lawful requests.
          </li>
        </ul>
        <p>
          We do not sell personal data, we do not share it with advertisers, and we do not use your
          uploads or transcripts to train machine learning models.
        </p>
      </>
    ),
  },
  {
    id: "subprocessors",
    heading: "Subprocessors",
    body: (
      <>
        <p>
          We use a small set of infrastructure providers to deliver the Service, each bound by a data
          processing agreement: cloud compute and GPU rendering, object storage, transactional email,
          payment processing and error monitoring.
        </p>
        <p>
          A current list of subprocessors, including the regions they operate in, is available on
          request from{" "}
          <a href={`mailto:${siteConfig.company.supportEmail}`}>
            {siteConfig.company.supportEmail}
          </a>
          . Enterprise customers receive advance notice of changes.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "Retention and deletion",
    body: (
      <>
        <ul>
          <li>
            <strong>Source uploads</strong> — retained for 30 days by default, or 12 months with the
            extended retention add-on.
          </li>
          <li>
            <strong>Rendered exports</strong> — retained while your subscription is active, then 30
            days after cancellation.
          </li>
          <li>
            <strong>Account records</strong> — deleted within 30 days of account deletion, except
            invoices which are retained for seven years as required by tax law.
          </li>
          <li>
            <strong>Server logs</strong> — rotated after 90 days.
          </li>
        </ul>
        <p>
          Deleting a project removes its media from active storage immediately and from encrypted
          backups within 35 days.
        </p>
      </>
    ),
  },
  {
    id: "security",
    heading: "Security",
    body: (
      <>
        <p>
          Media is encrypted in transit with TLS 1.3 and at rest with AES-256. Passwords are stored
          using PBKDF2-SHA256 with a per-user salt and high iteration count — we never store or log
          plaintext passwords.
        </p>
        <p>
          Access to production systems requires SSO with hardware-backed multi-factor authentication,
          is scoped to least privilege, and is audit logged. We run continuous dependency scanning and
          annual third-party penetration tests.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    heading: "Your rights",
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access, correct, export, restrict or
          delete your personal data, and to object to certain processing. You can exercise most of
          these directly from workspace settings, or by writing to{" "}
          <a href={`mailto:${siteConfig.company.supportEmail}`}>
            {siteConfig.company.supportEmail}
          </a>
          .
        </p>
        <p>
          We respond to verified requests within 30 days. If you are in the EEA or UK and are not
          satisfied with our response, you may lodge a complaint with your local supervisory
          authority.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: (
      <>
        <p>
          We use a strictly necessary session cookie to keep you signed in, and a preference cookie to
          remember interface choices. Neither is used for advertising or cross-site tracking.
        </p>
        <p>
          Product analytics, where enabled, are aggregated and contain no video content. You can opt
          out from workspace settings without losing functionality.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    heading: "International transfers",
    body: (
      <p>
        We process data in the United States and the European Union. Where data leaves the EEA or UK,
        transfers rely on Standard Contractual Clauses together with supplementary technical measures.
        Enterprise customers can pin processing and storage to a specific region.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Changes and contact",
    body: (
      <>
        <p>
          We will announce material changes to this policy by email or in-product notice at least 30
          days before they take effect.
        </p>
        <p>
          Privacy questions, data requests and DPA enquiries:{" "}
          <a href={`mailto:${siteConfig.company.supportEmail}`}>
            {siteConfig.company.supportEmail}
          </a>{" "}
          — {siteConfig.company.legalName}, {siteConfig.company.address}.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="What we collect, why we collect it, and how to get it removed."
      updatedAt={siteConfig.legal.privacyUpdatedAt}
      sections={sections}
    />
  );
}
