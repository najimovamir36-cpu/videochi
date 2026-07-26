import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import nodemailer, { type Transporter } from "nodemailer";

import { env } from "@/server/core/env";

/**
 * Outbound email.
 *
 * When SMTP credentials are configured the message goes out over a real SMTP
 * connection. Otherwise it falls back to a file transport that writes the
 * rendered `.eml` under `storage/mail/` and logs the path — so the reset flow
 * is fully exercisable in development without a mail account, and wiring a real
 * provider later is just setting the `SMTP_*` variables.
 */

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export function isSmtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
}

let cachedTransport: Transporter | null = null;

function smtpTransport(): Transporter {
  cachedTransport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  return cachedTransport;
}

export async function sendMail(mail: Mail): Promise<{ delivered: "smtp" | "file"; location: string }> {
  if (isSmtpConfigured()) {
    const info = await smtpTransport().sendMail({
      from: env.SMTP_FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return { delivered: "smtp", location: String(info.messageId) };
  }

  // File fallback: render a minimal RFC-822 message and drop it on disk. On
  // Vercel nothing written to disk survives past the request, so there's no
  // STORAGE_DIR worth writing under — fall back to the OS temp dir and log
  // the full message so it's at least inspectable in the function's logs.
  const dir = env.BLOB_READ_WRITE_TOKEN
    ? path.join(tmpdir(), "clipmind-mail")
    : path.join(process.cwd(), env.STORAGE_DIR, "mail");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${sanitize(mail.to)}.eml`);
  const eml = [
    `From: ${env.SMTP_FROM}`,
    `To: ${mail.to}`,
    `Subject: ${mail.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="utf-8"',
    "",
    mail.html,
  ].join("\r\n");
  await writeFile(file, eml, "utf8");
  console.info(`[mail] SMTP not configured — wrote ${file}`);
  if (env.BLOB_READ_WRITE_TOKEN) console.info(`[mail] message body:\n${eml}`);
  return { delivered: "file", location: file };
}

function sanitize(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, "_").slice(0, 40);
}
