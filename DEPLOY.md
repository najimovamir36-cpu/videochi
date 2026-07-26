# Deploying ClipMind AI to Railway

Railway runs a **persistent container** with a real filesystem and no request
time limit, so ClipMind's SQLite database, on-disk media storage, and the
ffmpeg render pipeline all work with **no code changes**. A mounted Volume keeps
the database and uploaded/rendered videos safe across deploys and restarts.

The repo already contains everything Railway needs:

- `railway.toml` — build + start commands (runs `prisma migrate deploy` on boot)
- `postinstall` script — generates the Prisma client after install
- ffmpeg/ffprobe binaries come from `ffmpeg-static` / `ffprobe-static` (npm), so
  no system ffmpeg is required.

---

## Step 1 — Push the repo to GitHub

Already done. Make sure the latest commit (with `railway.toml`, `DEPLOY.md`, and
the `postinstall` script) is pushed.

## Step 2 — Create the Railway project

1. Go to <https://railway.app> and sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → pick this repository.
3. Railway detects Next.js and starts the first build. Let it run — it will fail
   or crash-loop until you finish Steps 3 and 4. That's expected.

## Step 3 — Add a persistent Volume  ⚠️ required

Without a volume the SQLite DB and all uploads are wiped on every deploy.

1. Open the service → **Variables/Settings → Volumes → New Volume**.
2. **Mount path:** `/data`

## Step 4 — Set environment variables

Service → **Variables** → add these:

| Variable | Value | Notes |
|---|---|---|
| `AUTH_SECRET` | `Ya6TBBf42HhUwvGlM2VEvmrO3Za02bexAT_GeoNL7Cs` | Session signing key. **Required in production.** A fresh random value was generated for you — or make your own with `openssl rand -base64 32`. |
| `DATABASE_URL` | `file:/data/prod.db` | SQLite file on the volume. |
| `STORAGE_DIR` | `/data/storage` | Uploaded + rendered media on the volume. |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.up.railway.app` | Set after Step 5 once you know the domain, then redeploy (it is baked into the client at build time). |

**Optional** (leave unset to run in the free, keyless mode):

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Free high-quality AI pipeline (Whisper + Llama). Get one at <https://console.groq.com> (no card). Without it, analysis uses the free ffmpeg fallback. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Real password-reset emails. Without them, emails are written to `/data/storage/mail/` as `.eml` files. |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_CREATOR` / `STRIPE_PRICE_STUDIO` | Live billing. Without them, billing runs in display-only mode. |

## Step 5 — Generate a public domain

Service → **Settings → Networking → Generate Domain**. Copy the
`https://…up.railway.app` URL, put it in `NEXT_PUBLIC_APP_URL` (Step 4), and
**Redeploy**.

## Step 6 — Verify

Open the domain and sign in with the demo account:

- **Email:** `demo@clipmind.ai`
- **Password:** `ClipMind2026!`

Upload a video → it auto-analyzes → clips appear → export a clip → download the
9:16 vertical short. The database seeds itself on first load.

---

### Notes

- **First boot** runs `prisma migrate deploy`, which creates the schema on the
  volume. The app self-seeds the demo data lazily on first DB access.
- **Uploads limit:** Railway does not cap request body size, but very large
  uploads are still bound by container memory/time — fine for typical videos.
- **Costs:** Railway's free trial covers light use; beyond that it is usage-based
  (the container only needs to be up while serving). Keyless mode keeps AI at $0.
