# 08 · Deploying to Namecheap (cPanel + Node.js)

Recipe for **local development builds** and **production** on Namecheap Stellar–style shared hosting (one Node.js app per domain; Next.js + Payload share one process).

**Recommended production path:** build on **GitHub Actions** (Linux), download the artifact ZIP, upload to cPanel. That avoids Windows symlink issues with `output: 'standalone'` and matches `next.config.ts` (`BUILD_STANDALONE=1`).

---

## Prerequisites

| Item | Notes |
|------|--------|
| Node | **v24.x** — pinned in `.nvmrc` / CI to match cPanel (e.g. **24.15.0** when Namecheap offers it). |
| Package manager | **pnpm** only (`pnpm-lock.yaml`). Do **not** use `npm install` in this repo. |
| GitHub | Repo connected (e.g. `tedris94/fizam-table-water`) for Actions workflow. |

**Why does cPanel show Node 14 as “recommended”?** That is a **legacy default** on many shared hosts so very old apps keep working. It is **not** advice for a modern Next.js 15 app. Pick the **latest Node 24.x** your host lists (e.g. **24.15.0**) — same as `.nvmrc` and GitHub Actions.

Project files that matter for deploy:

- `.github/workflows/namecheap-standalone-zip.yml` — CI bundle.
- `scripts/package-namecheap-standalone.sh` — same steps as CI (Linux/WSL).
- `scripts/namecheap-DEPLOY.txt` — copied into the artifact as `DEPLOY_NAMECHEAP.txt`.
- Root `app.js` — **only** used if you deploy a **full tree** where `.next/standalone/server.js` still lives under `.next/standalone/`. The **CI flat ZIP** does **not** use `app.js`; use **`server.js`** as startup (see below).

---

## A. Local machine (daily dev)

From the project root:

```powershell
cd C:\wamp64\www\fizam.ng
node -v                    # expect same as .nvmrc (e.g. v24.15.0)
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
pnpm dev
```

- **`.npmrc`** sets `confirm-modules-purge=false` so `pnpm install` does not hang on prompts.
- If **`pnpm install`** fails with **`EPERM` / `unlink … .node`**: stop **`pnpm dev`** (and any other process using this folder), then remove `node_modules` and run `pnpm install` again.

Normal production build (not standalone):

```powershell
pnpm run build
pnpm start
```

**Standalone on Windows** often fails without Developer Mode / symlink rights. For a local **standalone** bundle matching production, use **WSL**, **Linux**, or **GitHub Actions** (recommended).

---

## B. Production bundle — GitHub Actions (recommended)

1. Push your branch to GitHub.
2. **Actions** → **Namecheap standalone ZIP** → **Run workflow**.
3. Optional input: **`NEXT_PUBLIC_SITE_URL`** (default `https://fizam.ng`, no trailing slash). This value is **baked into the client** at build time.
4. When the run finishes, open it → **Artifacts** → download **`fizam-namecheap-standalone`**.
5. Unzip the GitHub download once. Upload/extract into your cPanel app root (`server.js` at the top level). **Required:** the artifact includes **`next-dist/`** (not `.next`) because GitHub drops dot-folders — on the server run **`mv next-dist .next`** before starting the app.

Optional repo secret **`CI_BUILD_PAYLOAD_SECRET`**: used only during `next build`. If unset, CI generates a random value. **Always set a real `PAYLOAD_SECRET` in cPanel** for production (do not rely on the CI-only value).

---

## C. Production bundle — local (Linux or WSL only)

Mirrors CI:

```bash
cd /path/to/fizam.ng
corepack enable && corepack prepare pnpm@9.15.4 --activate
pnpm install --frozen-lockfile
export BUILD_STANDALONE=1
export NEXT_PUBLIC_SITE_URL=https://fizam.ng   # no trailing slash
export PAYLOAD_SECRET=$(openssl rand -hex 48)  # build-time only
bash scripts/package-namecheap-standalone.sh
(cd .next/standalone && zip -r ~/fizam-cpanel-upload.zip .)
```

Upload **`fizam-cpanel-upload.zip`** the same way as the Actions artifact.

---

## D. cPanel File Manager

Example home path from hosting: **`/home/CPANEL_USER/fizam.ng`** (your user may differ).

1. Open **File Manager** → your **application root** (the folder that will hold `server.js`).
2. Upload the artifact files (or a ZIP you made locally from the extracted artifact).
3. **Extract** here so **`server.js`** and **`package.json`** sit **directly** in that folder (not nested inside another folder).
4. In **Terminal** (if available):

   ```bash
   mkdir -p data && chmod 775 data
   ```

   SQLite uses **`data/fizam.db`** by default (see `.env.example` / `DATABASE_URI`).

---

## E. cPanel → Setup Node.js App

**Create** (or edit) the application:

| Field | Value |
|--------|--------|
| Node.js version | Same as **.nvmrc** / CI (e.g. **24.15.0**) — or any **24.x** that satisfies `engines` |
| Application mode | **Production** |
| Application root | Folder where you extracted the ZIP (e.g. `fizam.ng` or full path `/home/USER/fizam.ng`). |
| Application URL | **`fizam.ng`**, path **empty** for site root. |
| Application startup file | **`server.js`** ← Next standalone entry (flat artifact). |

Do **not** set startup to **`app.js`** unless you intentionally deployed the **full repo layout** with `.next/standalone/server.js` still under `.next/standalone/` (Passenger `app.js` wrapper in repo root).

Then **Environment variables** → add everything you need from **`.env.example`** (production values), especially:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | **`https://fizam.ng`** — Paystack callback base, links, Payload `serverURL`. Must match the live URL. |
| `PAYLOAD_SECRET` | Long random secret (required). |
| `PAYSTACK_SECRET_KEY` | Live or test secret from Paystack. |
| `DATABASE_URI` | Optional; default file DB under `./data/fizam.db`. |
| `SMTP_*`, `CONTACT_NOTIFY_EMAIL`, etc. | Optional; see `.env.example`. |

**Save**, then **Restart** the Node application.

---

## F. SSL

cPanel → **SSL/TLS Status** → run **AutoSSL** for the domain. Use **HTTPS** everywhere; align `NEXT_PUBLIC_SITE_URL` with `https://…`.

---

## G. Smoke tests

After deploy:

- **`https://fizam.ng`** — homepage.
- **`https://fizam.ng/admin`** — Payload admin (create super-admin on first run if prompted).
- **`https://fizam.ng/order`** — checkout (needs `PAYSTACK_SECRET_KEY` for payment init).

**Diagnostics:** public **`/diagnostics`** redirects to **`/dashboard/diagnostics`** (super admin after login). Do not expect a public env checklist at `/diagnostics` anymore.

---

## H. Updates (redeploy)

1. Merge/push to GitHub.
2. Run **Namecheap standalone ZIP** again (or rebuild locally on Linux/WSL).
3. Upload/extract the new artifact. Before extract, delete **`node_modules`**, **`.next`**, **`next-dist`**, and leftover **`src/`** from old deploys. After extract run **`mv next-dist .next`**, then **Restart** Node.

Rebuild whenever you change **`NEXT_PUBLIC_*`** variables — they are inlined at build time.

---

## I. Backups

Download **`data/fizam.db`** regularly (File Manager or backup tool). Losing it loses CMS content, products, orders, and users.

---

## J. Troubleshooting

| Symptom | Check |
|---------|--------|
| 502 / Internal Server Error | Startup file **`server.js`** (not default `app.js` unless you ship the updated `app.js` wrapper). **`PAYLOAD_SECRET`** set in cPanel env. After deploy, `tail stderr.log` — if timestamp is old, Passenger is not running this folder. |
| 502 / app won’t start | Startup file is **`server.js`** at app root; `node_modules` came with standalone; **Restart** after env changes. |
| Paystack / wrong domain | `NEXT_PUBLIC_SITE_URL` exactly **`https://fizam.ng`** (rebuild if changed). |
| SQLite errors | `data/` exists and is **writable** (`chmod 775 data`). |
| Windows `pnpm install` EPERM | Stop dev server; delete `node_modules`; retry. |

For a short copy-paste checklist inside the artifact, see **`DEPLOY_NAMECHEAP.txt`** after extracting the inner ZIP (generated from `scripts/namecheap-DEPLOY.txt` at build time).
