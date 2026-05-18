# 09 · Troubleshooting

## “The site is down” / Passenger errors

1. cPanel → **Setup Node.js App → Restart**.
2. Still down? **Errors** log (cPanel → Metrics → Errors). Look at the latest entries.
3. If you see `cannot find module 'next'`, run **Run NPM Install** in cPanel.
4. If you see SQLite errors, make sure `data/` exists and is writable (`chmod 755`).

## “PAYLOAD_SECRET is not set”

The env var is missing or the app wasn’t restarted after editing it.

1. cPanel → **Setup Node.js App → Edit → Environment variables**.
2. Add `PAYLOAD_SECRET` (long random string).
3. Click **Restart**.

## “Payments not configured”

`PAYSTACK_SECRET_KEY` is missing. Add it in cPanel env vars and restart.

## Email is not arriving

1. Verify SMTP credentials by sending from any other email client.
2. Check `09-EMAIL-SETUP.md` step 4. Try port 465 with `SMTP_SECURE=true`.
3. Ensure SPF / DKIM records exist for your domain (cPanel → Email Deliverability → Manage).
4. Some shared hosts block outbound SMTP — ask Namecheap support to whitelist port 587.

## Order paid in Paystack but stays `pending` in the admin

1. Open `/admin → Orders → the affected order`. Note the `Paystack Reference`.
2. Hit `https://fizam.ng/api/paystack/verify?reference=THE_REF` in your browser.
3. The order should flip to `paid` and you’ll see `{"ok":true,...}` in the response.
4. If you get a 401/403, check that you’re using the right `PAYSTACK_SECRET_KEY`.
5. Long-term: confirm the webhook URL (`/api/paystack/webhook`) is registered in Paystack.

## “Module not found” after editing collections

1. Run `npm run generate:types` and `npm run generate:importmap`.
2. Restart `npm run dev`.

## I deleted a file and now nothing works

`git status` shows what you removed. Restore with:

```bat
git restore path\to\file
```

If you don’t have Git, re-download the file from the original ZIP.

## Forgot the Payload super-admin password

1. Stop the app.
2. Open the SQLite DB with Beekeeper Studio.
3. Find the row in the `users` table for your email.
4. Set `salt` and `hash` to `NULL`. Save.
5. Restart the app and visit `/admin` — you’ll be asked to set a new password.

## Database file is huge / I want to start over

1. Stop the app.
2. Delete `data/fizam.db` (back it up first if you’re unsure).
3. Restart the app — Payload re-creates an empty DB on first request.
4. On **local dev**, run `pnpm run seed`. On **Namecheap production**, upload `data/fizam.db` from dev or use migrations — see `docs/08-DEPLOY-NAMECHEAP.md` §7.

## Build (`npm run build`) fails with TypeScript errors

Look at the file/line in the error message. Common fixes:

- **“Cannot find module 'X'”** → run `npm install` again.
- **“Type ... is not assignable to ...”** → after editing collections, run `npm run generate:types`.

## Still stuck

Open a Namecheap support chat with: error log, what you were doing, what you expected. They are friendly with Node.js / Passenger questions.
