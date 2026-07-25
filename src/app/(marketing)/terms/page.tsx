import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  path: routes.terms,
  description:
    "The terms that govern your use of ClipMind AI, including account rules, acceptable use, billing, intellectual property and liability.",
});

const sections: LegalSection[] = [
  {
    id: "agreement",
    heading: "Agreement to terms",
    body: (
      <>
        <p>
          These Terms of Service form a binding agreement between you and {siteConfig.company.legalName}
          (&ldquo;ClipMind&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) and govern your access to the
          ClipMind AI web application, APIs and related services (the &ldquo;Service&rdquo;).
        </p>
        <p>
          By creating an account, accessing the Service or clicking to accept these terms, you confirm
          that you have read them, that you are at least 16 years old, and that you have authority to
          bind the organisation you represent.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    heading: "Accounts and security",
    body: (
      <>
        <p>
          You are responsible for the accuracy of the information on your account and for all activity
          that occurs under it. Keep your credentials confidential and notify us immediately at{" "}
          <a href={`mailto:${siteConfig.company.supportEmail}`}>
            {siteConfig.company.supportEmail}
          </a>{" "}
          if you suspect unauthorised access.
        </p>
        <ul>
          <li>One person or organisation per account; seats are not transferable between people.</li>
          <li>Do not share credentials, and do not circumvent seat or usage limits.</li>
          <li>We may suspend accounts that show signs of compromise until they are secured.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-content",
    heading: "Your content and licence",
    body: (
      <>
        <p>
          You retain all ownership of the videos, audio, transcripts and other materials you upload
          (&ldquo;Your Content&rdquo;). You grant us a limited, non-exclusive, worldwide licence to
          host, process, transcode, analyse and transmit Your Content strictly for the purpose of
          operating the Service and producing the outputs you request.
        </p>
        <p>
          <strong>We do not use Your Content to train models</strong>, and we do not disclose it to
          third parties except to subprocessors acting under contract to deliver the Service.
        </p>
        <p>
          You are responsible for holding all rights necessary to upload Your Content, including any
          rights of contributors, performers and rights-holders in the underlying material.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Upload material you do not have the rights to process.</li>
          <li>
            Create content that is unlawful, defamatory, harassing, or that depicts the sexual
            exploitation of minors.
          </li>
          <li>
            Generate deceptive media that impersonates a real person in order to mislead, defraud or
            manipulate.
          </li>
          <li>Reverse engineer, resell or benchmark the Service without written permission.</li>
          <li>
            Interfere with the integrity of the Service, including probing, scanning or overloading
            our infrastructure.
          </li>
        </ul>
        <p>
          We may remove content or suspend access for violations, with notice where practical and
          immediately where the violation poses legal or security risk.
        </p>
      </>
    ),
  },
  {
    id: "plans-billing",
    heading: "Plans, credits and billing",
    body: (
      <>
        <p>
          Paid plans are billed in advance on a monthly or annual cycle and include a set number of
          processing minutes per cycle. Minutes reset at the start of each cycle and, except for
          purchased top-ups, do not roll over.
        </p>
        <ul>
          <li>Upgrades take effect immediately and are prorated for the remainder of the cycle.</li>
          <li>Downgrades and cancellations take effect at the end of the current cycle.</li>
          <li>
            Fees are exclusive of taxes. You are responsible for any VAT, GST or sales tax that
            applies in your jurisdiction.
          </li>
          <li>
            Trials convert to a paid subscription at the end of the trial period unless cancelled
            beforehand.
          </li>
        </ul>
        <p>
          Failed payments may result in suspension of processing while your existing projects remain
          accessible for 30 days.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    heading: "Availability and support",
    body: (
      <>
        <p>
          We aim for continuous availability and publish live status at{" "}
          <a href={siteConfig.links.status}>{siteConfig.links.status.replace("https://", "")}</a>.
          Enterprise agreements may include a contractual uptime commitment; other plans are provided
          on an as-available basis.
        </p>
        <p>
          Planned maintenance is announced in advance where it is expected to affect processing
          capacity.
        </p>
      </>
    ),
  },
  {
    id: "our-ip",
    heading: "Our intellectual property",
    body: (
      <p>
        The Service, including its software, models, interface design, documentation and trademarks,
        remains our exclusive property. These terms grant you a right to use the Service, not any
        ownership interest in it. Feedback you send us may be used to improve the Service without
        obligation to you.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "Termination",
    body: (
      <>
        <p>
          You may stop using the Service and delete your account at any time from workspace settings.
          We may terminate or suspend access if you materially breach these terms, if required by law,
          or if continuing to provide the Service would create legal or security risk.
        </p>
        <p>
          On termination, your right to use the Service ends immediately. We will delete Your Content
          in accordance with our retention schedule, and you may request an export beforehand.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    heading: "Disclaimers and limitation of liability",
    body: (
      <>
        <p>
          The Service is provided &ldquo;as is&rdquo;. AI outputs are probabilistic: transcripts,
          clip selections, captions and translations may contain errors, and you are responsible for
          reviewing output before publishing it.
        </p>
        <p>
          To the maximum extent permitted by law, our aggregate liability arising out of or relating
          to the Service is limited to the amounts you paid us in the twelve months preceding the
          claim. We are not liable for indirect, incidental, special or consequential damages, or for
          lost profits, revenue or data.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes and governing law",
    body: (
      <>
        <p>
          We may update these terms as the Service evolves. Material changes will be announced by
          email or in-product notice at least 30 days before taking effect, and continued use after
          that date constitutes acceptance.
        </p>
        <p>
          These terms are governed by the laws of the State of California, excluding its conflict of
          law rules. The state and federal courts located in San Francisco County, California have
          exclusive jurisdiction over disputes.
        </p>
        <p>
          Questions about these terms? Write to{" "}
          <a href={`mailto:${siteConfig.company.supportEmail}`}>
            {siteConfig.company.supportEmail}
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="The rules for using ClipMind AI — written to be read, not skimmed past."
      updatedAt={siteConfig.legal.termsUpdatedAt}
      sections={sections}
    />
  );
}
