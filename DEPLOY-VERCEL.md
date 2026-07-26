# Deploying ClipMind AI to Vercel

Vercel functions are **serverless**: no persistent filesystem, and each
invocation is capped at a maximum duration. ClipMind's data model accounts for
this —

- **Database** is Postgres (works unchanged; `DATABASE_URL` just needs to
  point at a real Postgres instead of a local file).
- **Media storage** switches to **Vercel Blob** automatically when
  `BLOB_READ_WRITE_TOKEN` is set — see `src/server/storage/index.ts`. Nothing
  else in the app needs to change; every route that reads/writes media goes
  through that one seam.
- **Background work** (AI analysis after upload, ffmpeg render after export)
  runs via Next's `after()` API, which Vercel keeps the function alive for
  (up to `maxDuration`) instead of killing it the instant the response is
  sent — a plain fire-and-forget promise would get cut off.

See also [DEPLOY.md](./DEPLOY.md) if you'd rather deploy to Railway, which has
a persistent container and needs less of this (only the database is required
there; media storage can stay on local disk).

---

## Step 1 — Push the repo to GitHub

Already done if you're reading this from the repo. Make sure the latest
commit is pushed.

## Step 2 — Import the project on Vercel

1. Go to <https://vercel.com/new> and sign in with GitHub.
2. Import this repository. Vercel detects Next.js automatically — accept the
   defaults for build command (`next build`) and output.
3. Don't deploy yet — add the storage and env vars first (Steps 3–4), or the
   first build will crash-loop on a missing `DATABASE_URL`.

## Step 3 — Add Postgres

Project → **Storage** tab → **Create Database → Postgres** (this provisions a
Neon-backed Postgres instance and wires `DATABASE_URL` into your project's
env vars automatically — no separate account needed).

## Step 4 — Add Vercel Blob

Project → **Storage** tab → **Create Database → Blob** → creates a store and
adds `BLOB_READ_WRITE_TOKEN` to your env vars automatically. This is what
switches the app's storage backend from disk to Blob (see
`src/server/storage/index.ts`) — without it, uploads would silently vanish on
the next cold start.

## Step 5 — Set the remaining environment variables

Project → **Settings → Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `AUTH_SECRET` | *(generate with `openssl rand -base64 32`)* | Session signing key. **Required in production.** |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.vercel.app` | Set after your first deploy once you know the domain, then redeploy — it's baked into the client at build time. |

`DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` are already set from Steps 3–4.

**Optional** (leave unset to run in the free, keyless mode):

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Free high-quality AI pipeline (Whisper + Llama). Get one at <https://console.groq.com> (no card). Without it, analysis uses the free ffmpeg fallback. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Real password-reset emails. Without them, the reset link is written to the function's logs instead (nothing persists to disk on Vercel). |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_CREATOR` / `STRIPE_PRICE_STUDIO` | Live billing. Without them, billing runs in display-only mode. |

## Step 6 — Deploy

Trigger a deploy (push a commit, or **Deployments → Redeploy**). The repo's
`package.json` has a `vercel-build` script (`prisma migrate deploy && next
build`) — Vercel auto-detects and runs that instead of the plain `build`
script, so the Postgres schema is applied on every deploy, not just the
first. (`postinstall` still runs `prisma generate` beforehand, same as
always.)

Then generate a domain if you haven't already (Vercel assigns one on first
deploy), set `NEXT_PUBLIC_APP_URL` to it (Step 5), and redeploy.

## Step 7 — Verify

Open the domain and sign in with the demo account:

- **Email:** `demo@clipmind.ai`
- **Password:** `ClipMind2026!`

Upload a video → it auto-analyzes → clips appear → export a clip → download
the 9:16 vertical short. The database seeds itself on first load.

---

### Function duration limits — read this before uploading long videos

`after()` keeps the function alive for background work, but it's still bound
by `maxDuration` (set to 300s on the upload-content and export routes — see
`src/app/api/uploads/[id]/content/route.ts` and `src/app/api/exports/route.ts`).
Vercel's actual ceiling depends on your plan:

- **Hobby:** capped at 60s regardless of what `maxDuration` says — long
  transcriptions or renders will be killed mid-flight. Fine for short demo
  clips; not reliable for real videos.
- **Pro:** up to 300s standard, or up to 800s with Fluid Compute enabled
  (Project Settings → Functions → Fluid Compute).

If you plan to process videos longer than a couple of minutes, either raise
`maxDuration` (and enable Fluid Compute on Pro) or move this workload off
Vercel entirely (Railway has no such limit — see DEPLOY.md).

### Notes

- **Cold starts**: the ffmpeg/ffprobe binaries (`ffmpeg-static`/
  `ffprobe-static`) are pulled in via `serverExternalPackages` in
  `next.config.ts` — this must stay, or Vercel's bundler rewrites `__dirname`
  and the binaries can't find themselves at runtime.
- **Costs**: Vercel's free tier covers light use; Postgres and Blob usage
  beyond the free allowance is billed by Vercel. Keyless AI mode keeps the
  pipeline itself at $0 either way.
- **Local testing against Blob**: you can point your local `.env` at the same
  `BLOB_READ_WRITE_TOKEN` and a dev Postgres branch to exercise the exact
  production code path before deploying.
