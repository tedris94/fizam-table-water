# Vercel Deployment Setup

## Changes Made

- ✅ Removed Namecheap FTP deployment (old secrets deleted)
- ✅ Switched to Vercel deployment via GitHub Actions
- ✅ Made Payload CMS optional for frontend-only deployments
- ✅ App now runs without local database in production

## GitHub Secrets Required

Add these secrets to your GitHub repository settings:

1. **VERCEL_TOKEN** - Personal authentication token from Vercel
   - Get from: https://vercel.com/account/tokens
   
2. **VERCEL_ORG_ID** - Your Vercel organization ID
   - Get from: Vercel dashboard settings
   
3. **VERCEL_PROJECT_ID** - Your Vercel project ID
   - Get from: Vercel project settings

## Environment Variables for Vercel

Set these in your Vercel project settings:

### Required
- `PAYLOAD_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `NEXT_PUBLIC_SITE_URL` - Full site URL **with `https://`** (e.g. `https://fizam.ng` or `https://fizam-table-water.vercel.app`). Values without a protocol break dynamic pages at runtime.

### Optional (for CMS functionality on Vercel)
- `DATABASE_URI` - **Remote only on Vercel** (e.g. Turso `libsql://...`). Do **not** use `file:./data/fizam.db` on Vercel — it is ephemeral and breaks serverless. Without a remote URI, the marketing site still runs; `/admin` needs Turso.
- `DISABLE_PAYLOAD` - Set to `1` to force frontend-only mode (rarely needed)
- `PAYSTACK_SECRET_KEY` & `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - Payment processing
- `SMTP_*` - Email configuration
- `CONTACT_NOTIFY_EMAIL` & `HR_NOTIFY_EMAIL` - Notification emails

## Deployment Flow

1. Push to `main` branch → Builds and deploys to production
2. Push to `dev` branch → Builds and deploys to preview

The app will:
- ✅ Serve the frontend without requiring a local database
- ✅ Allow optional CMS access if DATABASE_URI is provided
- ✅ Use temporary SQLite database on Vercel if DATABASE_URI is set to local file

## Frontend-Only Mode

The app now gracefully handles running without a database:
- Frontend pages work normally
- CMS admin panel won't be accessible if no database
- API routes that don't require Payload will still work
- Content queries fallback gracefully

To verify it's working:
```bash
pnpm build
pnpm start
# App should start on http://localhost:3000 without database
```
