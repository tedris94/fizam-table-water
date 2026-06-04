# 11 · Deploy to Netlify (Next.js + Payload + SQLite)

Netlify is a serverless platform optimized for Next.js. This guide covers deploying **Fizam Table Water** from GitHub to Netlify.

---

## Why Netlify is better than Namecheap for Next.js

| Feature | Namecheap (Shared) | Netlify |
|---------|-------------------|---------|
| **Sharp support** | Complex (venv symlink, LD_LIBRARY_PATH) | Built-in (modern runtime) |
| **Build time** | Manual scripts + SSH | Automatic CI/CD |
| **Cold starts** | N/A | <1s |
| **Scaling** | Capped by slot | Unlimited (serverless) |
| **SSL/HTTPS** | Manual renewal | Free, auto-renew |
| **Deploy speed** | Minutes (FTP) | Seconds (Git push) |

---

## Step 1 — Connect GitHub to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up / log in.
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub**, select `tedris94/fizam-table-water` repo.
4. Netlify auto-detects the build:
   - Build command: `pnpm run build`
   - Publish directory: `.next`
   - (These are in `netlify.toml` — no manual config needed)

---

## Step 2 — Set environment variables

In Netlify **Site settings** → **Build & deploy** → **Environment**:

**Public:**
- `NEXT_PUBLIC_SITE_URL`: `https://fizam.ng`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: (your Paystack test/live key)

**Secret** (use Netlify UI to set these, not git):
- `PAYLOAD_SECRET`: (long random string; generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
- `DATABASE_URI`: `file:./data/fizam.db`
- `PAYSTACK_SECRET_KEY`: (your Paystack secret)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`: (email config)

---

## Step 3 — Handle SQLite database

### Option A — Commit DB to Git (simplest, if <100 MB)

1. Ensure `data/fizam.db` is in the repo (you have it locally).
2. Commit and push:
   ```bash
   git add data/fizam.db
   git commit -m "feat: add seeded database"
   git push
   ```
3. On Netlify deploy, the DB is pulled into the build automatically.
4. Done — no extra steps.

**Pros:** Zero config, instant access to data.  
**Cons:** DB updates require commits; not ideal for user-generated content (orders, applications).

### Option B — Use Migrations + Create Admin via UI

1. Ensure `data/fizam.db` is **not** in the repo (or `.gitignore` it).
2. On first Netlify deploy, Payload migrations run automatically and create schema.
3. Visit `/admin` → create the first super-admin user via the UI.
4. Subsequent deploys preserve the DB (Netlify persistent filesystem for `/data`).

**Pros:** Clean git history; DB persists.  
**Cons:** Requires manual admin creation; may need to restore data dumps.

---

## Step 4 — First Deploy

1. Push to `main` branch (or connect a branch in Netlify).
2. Netlify auto-builds:
   - Runs `pnpm run build`
   - Publishes `.next` folder
   - Deploys to `https://fizam-table-water.netlify.app` (or custom domain)

3. Verify:
   ```bash
   curl -sI https://fizam-table-water.netlify.app/ | head -5
   curl -sI https://fizam-table-water.netlify.app/admin | head -5
   ```

---

## Step 5 — Custom domain (fizam.ng)

1. In Netlify **Site settings** → **Domain management** → **Add custom domain**.
2. Add `fizam.ng`.
3. Update Namecheap DNS to point to Netlify:
   - Go to Namecheap → Domain → **Nameservers** (or A record).
   - Change to Netlify's nameservers (shown in Netlify UI).
   - Or set A record to Netlify's IP (show in Netlify).
4. Netlify auto-provisions SSL cert (Let's Encrypt).
5. Wait ~5–10 minutes for DNS propagation.

---

## Step 6 — Set up Payload globals (Site Settings)

Once `/admin` is live:

1. Log in with your super-admin credentials.
2. Go **Globals** → **Site Settings**.
3. Fill in:
   - **Default Meta Title** (for Google): "Fizam — Table Water Nigeria"
   - **Default Meta Description**: (150–160 chars)
   - **Google Site Verification**: (if using Google Search Console)
   - **Social URLs**: Facebook, Instagram, Twitter
4. Save.

---

## Step 7 — Monitor builds and errors

In Netlify UI:

- **Deploys** tab: View build logs.
- **Functions** tab: Monitor serverless function errors (if used).
- **Analytics** tab: Track traffic.

If deploy fails, check:
1. Build log for `pnpm` / `pnpm run build` errors.
2. Node version compatibility (should be 24.x).
3. Missing env vars (Netlify shows warnings).

---

## Step 8 — Update Payload CMS after data changes

If you modify collections (e.g., add a new field in `src/collections/Products.ts`):

1. Locally: `pnpm run generate:types` (regenerate TypeScript types).
2. Commit and push to GitHub.
3. Netlify auto-rebuilds and deploys.
4. If DB schema changed, run migrations:
   ```bash
   pnpm payload migrate:create describe_your_change
   git add src/migrations/
   git commit && git push
   ```
   On next Netlify deploy, migrations run automatically.

---

## Comparison: Data persistence strategies

| Strategy | Git commit | Deploy speed | Data loss risk | Ideal for |
|----------|-----------|--------------|----------------|-----------|
| **Option A (commit DB)** | Yes | Fast | Low | Static content, demos |
| **Option B (migrations)** | No | Fast | None (persists) | Production, user data |
| **Option B + Git LFS** | Yes (compressed) | Medium | None | Large DB files |

For **production fizam.ng**, use **Option B**: let migrations create schema, and Netlify's persistent filesystem keeps the DB between deploys.

---

## Troubleshooting

### Build fails: "pnpm: command not found"
- Netlify uses Node 18 by default. Add `PNPM_VERSION=9.15.4` and `NODE_VERSION=24.15.0` to env vars.

### `/admin` shows "Create First User"
- Migrations haven't run, or DB is missing. Check build logs.
- Option A: push `data/fizam.db` to Git.
- Option B: wait for migrations, then create admin via UI.

### Sharp errors
- Netlify's runtime has sharp pre-installed. If errors occur, check build log for mismatched versions.
- Ensure `sharp` in `package.json` matches your local build.

### Database not persisting
- Netlify Functions are ephemeral. For file-based SQLite, the `/data` folder must be at the app root (not in a temp folder).
- Check `DATABASE_URI` env var is `file:./data/fizam.db` (relative path from app root).

---

## Next steps

1. Connect GitHub repo to Netlify (Step 1).
2. Set environment variables (Step 2).
3. Choose DB strategy: commit or migrations (Step 3).
4. Push to main branch; Netlify deploys automatically.
5. Verify `/admin` works; create first admin if needed.
6. Update Namecheap DNS to point to Netlify (Step 5).
7. Configure globals in Payload CMS (Step 6).

---

## Files in the repo

| File | Role |
|------|------|
| `netlify.toml` | Netlify build config (build command, env, redirects) |
| `.github/workflows/fizamdeploy.yml` | GitHub Actions (no longer needed for Netlify) |
| `src/payload.config.ts` | Payload CMS config (supports Netlify) |
| `docs/10-SEO-GOOGLE.md` | SEO setup (same for Netlify) |
