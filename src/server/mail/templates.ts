import type { Mail } from "@/server/mail/mailer";

/**
 * Transactional email templates. Kept as plain string builders (no template
 * engine) so they render identically in every runtime and are trivial to audit.
 */

const BRAND = "ClipMind AI";

export function passwordResetEmail(params: { to: string; name: string; resetUrl: string }): Mail {
  const { to, name, resetUrl } = params;
  const firstName = name.split(" ")[0] || "there";

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#0f172a">
    <h1 style="font-size:20px;margin:0 0 16px">Reset your ${BRAND} password</h1>
    <p style="margin:0 0 16px;line-height:1.6">Hi ${escapeHtml(firstName)}, we received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
    <p style="margin:0 0 24px">
      <a href="${resetUrl}" style="display:inline-block;background:#7c5cff;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">Reset password</a>
    </p>
    <p style="margin:0 0 8px;line-height:1.6;color:#475569;font-size:13px">If the button doesn't work, paste this link into your browser:</p>
    <p style="margin:0 0 24px;word-break:break-all;font-size:13px"><a href="${resetUrl}" style="color:#7c5cff">${resetUrl}</a></p>
    <p style="margin:0;color:#94a3b8;font-size:12px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
  </div>`.trim();

  const text = [
    `Hi ${firstName},`,
    "",
    `We received a request to reset your ${BRAND} password.`,
    "Open this link to choose a new one (expires in 30 minutes):",
    resetUrl,
    "",
    "If you didn't request this, you can safely ignore this email.",
  ].join("\n");

  return { to, subject: `Reset your ${BRAND} password`, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
