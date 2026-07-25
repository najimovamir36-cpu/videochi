import { prisma } from "@/server/db/client";
import { hashPassword } from "@/server/security/password";

/**
 * Seeds a realistic demo workspace so every screen has meaningful content on
 * first run. Idempotent: if the demo user already exists the seed is a no-op,
 * so it is safe to call on every cold start.
 *
 * Offsets are relative to "now" at seed time, which keeps the demo data feeling
 * fresh whenever the database is first created.
 */

export const DEMO_ACCOUNT = {
  name: "Alex Rivera",
  email: "demo@clipmind.ai",
  password: "ClipMind2026!",
} as const;

const DEMO_USER_ID = "usr_demo000001";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function ago(base: number, offset: number): Date {
  return new Date(base - offset);
}

function mimeFromName(fileName: string): string {
  if (fileName.endsWith(".mp4")) return "video/mp4";
  if (fileName.endsWith(".mov")) return "video/quicktime";
  if (fileName.endsWith(".mkv")) return "video/x-matroska";
  if (fileName.endsWith(".webm")) return "video/webm";
  if (fileName.endsWith(".avi")) return "video/x-msvideo";
  return "application/octet-stream";
}

let seedPromise: Promise<void> | null = null;

/** Idempotent, concurrency-safe seeding. */
export function ensureSeeded(): Promise<void> {
  seedPromise ??= runSeed();
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
  if (existing) return;

  const base = Date.now();

  await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      name: DEMO_ACCOUNT.name,
      email: DEMO_ACCOUNT.email,
      avatarUrl: null,
      role: "owner",
      plan: "creator",
      emailVerified: true,
      passwordHash: await hashPassword(DEMO_ACCOUNT.password),
      createdAt: ago(base, 96 * DAY),
    },
  });

  const uploads: Array<[string, string, number, number, string, string, number, string]> = [
    ["upl_01", "the-founder-mindset-ep142.mp4", 4_912_345_678, 7_412, "ready", "#7c5cff", 3 * HOUR, "device"],
    ["upl_02", "series-a-teardown-interview.mov", 2_733_221_100, 4_268, "ready", "#22d3ee", 11 * HOUR, "device"],
    ["upl_03", "growth-webinar-q3-final.mp4", 1_884_002_210, 3_120, "processing", "#ec4899", 26 * HOUR, "youtube"],
    ["upl_04", "designing-for-trust-panel.mkv", 6_120_884_320, 8_940, "ready", "#f59e0b", 2 * DAY + 4 * HOUR, "device"],
    ["upl_05", "remote-culture-roundtable.webm", 998_112_440, 2_015, "ready", "#34d399", 3 * DAY, "drive"],
    ["upl_06", "ai-tooling-deep-dive.mp4", 3_402_998_112, 5_602, "failed", "#f43f5e", 4 * DAY + 6 * HOUR, "url"],
    ["upl_07", "product-launch-dry-run.avi", 1_233_884_002, 1_845, "ready", "#a78bfa", 6 * DAY, "device"],
    ["upl_08", "customer-story-northwind.mp4", 742_009_884, 1_268, "ready", "#38bdf8", 8 * DAY, "device"],
  ];

  for (const [id, fileName, size, duration, status, color, offset, source] of uploads) {
    await prisma.videoUpload.create({
      data: {
        id,
        ownerId: DEMO_USER_ID,
        fileName,
        size,
        mimeType: mimeFromName(fileName),
        duration,
        status,
        thumbnailColor: color,
        source,
        createdAt: ago(base, offset),
        updatedAt: ago(base, Math.max(0, offset - 40 * MINUTE)),
      },
    });
  }

  const projects: Array<[string, string, string, string, number, number, string, string, number]> = [
    ["prj_01", "upl_01", "The Founder Mindset — Ep. 142", "ready", 18, 7_412, "English", "#7c5cff", 3 * HOUR],
    ["prj_02", "upl_02", "Series A Teardown Interview", "ready", 12, 4_268, "English", "#22d3ee", 10 * HOUR],
    ["prj_03", "upl_03", "Growth Webinar — Q3", "analyzing", 0, 3_120, "English", "#ec4899", 25 * HOUR],
    ["prj_04", "upl_04", "Designing for Trust — Panel", "ready", 24, 8_940, "Spanish", "#f59e0b", 2 * DAY],
    ["prj_05", "upl_05", "Remote Culture Roundtable", "ready", 9, 2_015, "English", "#34d399", 3 * DAY],
    ["prj_06", "upl_06", "AI Tooling Deep Dive", "failed", 0, 5_602, "English", "#f43f5e", 4 * DAY],
    ["prj_07", "upl_07", "Product Launch Dry Run", "ready", 7, 1_845, "German", "#a78bfa", 6 * DAY],
    ["prj_08", "upl_08", "Customer Story — Northwind", "ready", 6, 1_268, "English", "#38bdf8", 8 * DAY],
  ];

  for (const [id, uploadId, title, status, clipCount, duration, language, color, offset] of projects) {
    await prisma.project.create({
      data: {
        id,
        ownerId: DEMO_USER_ID,
        uploadId,
        title,
        status,
        clipCount,
        duration,
        language,
        thumbnailColor: color,
        createdAt: ago(base, offset),
        updatedAt: ago(base, Math.max(0, offset - 25 * MINUTE)),
      },
    });

    // Seed a handful of clips per ready project so the detail view has real
    // rows matching the clip count (deterministic — no Math.random).
    if (status === "ready" && clipCount > 0) {
      const count = Math.min(clipCount, 6);
      const span = Math.max(60, Math.floor(duration / (count + 1)));
      for (let i = 0; i < count; i += 1) {
        const clipDuration = 24 + ((i * 7) % 30);
        const startAt = Math.min(duration - clipDuration, (i + 1) * span);
        await prisma.clip.create({
          data: {
            id: `clp_${id.slice(4)}_${i + 1}`,
            projectId: id,
            title: `Highlight ${i + 1}`,
            startAt: Math.max(0, startAt),
            duration: clipDuration,
            score: 96 - i * 6,
            aspectRatio: "9:16",
            hasCaptions: true,
            speakerCount: 1,
            createdAt: ago(base, offset),
          },
        });
      }
    }
  }

  const exports: Array<[string, string, string, string, string, string, string, number, number, number]> = [
    ["exp_01", "prj_01", "The Founder Mindset — Ep. 142", "Why most founders quit at month 9", "completed", "4K", "9:16", 184_221_004, 100, 42 * MINUTE],
    ["exp_02", "prj_01", "The Founder Mindset — Ep. 142", "The hiring mistake nobody admits", "completed", "1080p", "9:16", 62_884_120, 100, 2 * HOUR],
    ["exp_03", "prj_02", "Series A Teardown Interview", "How we cut burn by 40% in 6 weeks", "rendering", "4K", "9:16", 0, 64, 8 * MINUTE],
    ["exp_04", "prj_04", "Designing for Trust — Panel", "Trust is a design decision", "completed", "1440p", "1:1", 121_004_882, 100, 26 * HOUR],
    ["exp_05", "prj_05", "Remote Culture Roundtable", "Async beats meetings — here's proof", "completed", "1080p", "9:16", 48_221_338, 100, 2 * DAY],
    ["exp_06", "prj_07", "Product Launch Dry Run", "Launch day checklist in 45 seconds", "queued", "1080p", "4:5", 0, 0, 4 * MINUTE],
    ["exp_07", "prj_08", "Customer Story — Northwind", "From 12 hours to 20 minutes", "failed", "4K", "9:16", 0, 38, 5 * DAY],
  ];

  for (const [id, projectId, projectTitle, clipTitle, status, resolution, aspectRatio, size, progress, offset] of exports) {
    await prisma.exportJob.create({
      data: {
        id,
        ownerId: DEMO_USER_ID,
        projectId,
        projectTitle,
        clipTitle,
        status,
        resolution,
        aspectRatio,
        size,
        progress,
        createdAt: ago(base, offset),
        completedAt: status === "completed" ? ago(base, Math.max(0, offset - 6 * MINUTE)) : null,
      },
    });
  }

  const notifications: Array<[string, string, string, string, boolean, number]> = [
    ["ntf_01", "18 clips are ready", "The Founder Mindset — Ep. 142 finished analysis with 6 high-scoring moments.", "analysis", false, 34 * MINUTE],
    ["ntf_02", "4K export completed", "“Why most founders quit at month 9” is ready to download.", "export", false, 42 * MINUTE],
    ["ntf_03", "Render queue moving", "Series A Teardown Interview is 64% rendered.", "export", false, 3 * HOUR],
    ["ntf_04", "Credits topped up", "Your Creator plan renewed with 1,200 fresh credits.", "billing", true, 2 * DAY],
    ["ntf_05", "New: speaker diarization", "Multi-speaker tracking now runs automatically on every upload.", "system", true, 5 * DAY],
  ];

  for (const [id, title, body, kind, read, offset] of notifications) {
    await prisma.appNotification.create({
      data: { id, ownerId: DEMO_USER_ID, title, body, kind, read, createdAt: ago(base, offset) },
    });
  }

  const invoices: Array<[string, string, number, string, string, number]> = [
    ["inv_01", "CM-2026-0714", 39, "paid", "Jul 1 – Jul 31, 2026", 24 * DAY],
    ["inv_02", "CM-2026-0613", 39, "paid", "Jun 1 – Jun 30, 2026", 54 * DAY],
    ["inv_03", "CM-2026-0512", 39, "paid", "May 1 – May 31, 2026", 85 * DAY],
    ["inv_04", "CM-2026-0411", 19, "paid", "Apr 1 – Apr 30, 2026", 115 * DAY],
  ];

  for (const [id, number, amount, status, periodLabel, offset] of invoices) {
    await prisma.invoice.create({
      data: {
        id,
        ownerId: DEMO_USER_ID,
        number,
        amount,
        status,
        periodLabel,
        downloadUrl: `/api/billing/invoices/${id}`,
        issuedAt: ago(base, offset),
      },
    });
  }

  await prisma.paymentMethod.create({
    data: { id: "pm_01", ownerId: DEMO_USER_ID, brand: "visa", last4: "4242", expMonth: 8, expYear: 2029, isDefault: true },
  });

  await prisma.usageSummary.create({
    data: {
      ownerId: DEMO_USER_ID,
      creditsUsed: 742,
      creditsTotal: 1_200,
      storageUsed: 214 * 1024 * 1024 * 1024,
      storageTotal: 500 * 1024 * 1024 * 1024,
      minutesProcessed: 1_284,
      minutesIncluded: 2_000,
      renderMinutesUsed: 386,
      renderMinutesTotal: 600,
      resetsAt: new Date(base + 7 * DAY),
    },
  });
}

export { DEMO_USER_ID };
