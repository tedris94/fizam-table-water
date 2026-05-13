# 08 · Deploying to Namecheap Stellar (cPanel + Passenger)

This is the click-by-click recipe to put the site online. Allow ~45 minutes the first time.

> **Heads-up:** Namecheap Stellar shared hosting only allows **one** Node.js app per domain. The site is built so Next.js + Payload CMS share the same Node process, which keeps you within that limit.

---

## A. Build the project on your laptop

```bat
cd C:\wamp64\www\fizam.ng
node -v               :: must be v20.20.2
npm install
npm run build
```

After this, you should have a folder called `.next/` with a `standalone/` subfolder inside.

---

## B. Prepare the upload bundle

Copy these files/folders into a new folder named `fizam-upload/`:

- `.next/standalone/` (everything inside)
- `.next/static/` → **place at `fizam-upload/.next/static/`** (the standalone server expects this exact path)
- `public/`
- `data/` (with the empty `.gitkeep`, **not** your local development DB unless you want to migrate it)
- `app.js`
- `.htaccess`
- `package.json`
- `next.config.ts`
- `node_modules/` *(skip if you will run `npm ci --omit=dev` on the server instead — usually faster to upload `node_modules`)*

> The folder structure inside `fizam-upload` should look like:
>
> ```
> fizam-upload/
> ├─ app.js
> ├─ .htaccess
> ├─ package.json
> ├─ next.config.ts
> ├─ public/
> ├─ data/
> ├─ node_modules/   (optional — see above)
> └─ .next/
>    ├─ standalone/
>    │   └─ server.js
>    └─ static/
> ```

---

## C. Upload via cPanel File Manager

1. Log into cPanel for fizam.ng.
2. **File Manager → Web Root** (usually `public_html` or `home/CPANEL_USER/fizam`).
3. Decide on the application directory. Recommended: `/home/CPANEL_USER/fizam` (above `public_html`).
4. Upload `fizam-upload.zip` and extract it inside that directory.

> Alternative: use FTP (FileZilla) — same destination.

---

## D. Configure the Node.js app in cPanel

1. cPanel → **Setup Node.js App → Create Application**.
2. Fill in:

   | Field                | Value                                                |
   | -------------------- | ---------------------------------------------------- |
   | Node.js version      | `20.20.2`                                            |
   | Application mode     | `Production`                                         |
   | Application root     | `fizam` (or wherever you uploaded)                   |
   | Application URL      | `fizam.ng` (root domain)                             |
   | Application startup file | `app.js`                                         |

3. Click **Create**.
4. In the same page, scroll to **Environment variables → ADD VARIABLE** and add every key from `.env.example` (use **live** Paystack keys & a strong `PAYLOAD_SECRET`).
5. Click **Save**.
6. Click **Run NPM Install** (only if you skipped uploading `node_modules`).
7. Click **Restart**.

---

## E. Point the public URL at the app

Namecheap Stellar serves Node apps through Passenger. If the “Application URL” you chose is the root domain (`fizam.ng`), the app is already accessible.

If you want a subdomain (e.g. `app.fizam.ng`), add it via cPanel → **Subdomains** before creating the Node app.

---

## F. Get an SSL certificate

1. cPanel → **SSL/TLS Status** → tick the domain → **Run AutoSSL**.
2. Wait ~5 minutes.
3. Edit `.htaccess` and uncomment the HTTPS redirect block.

---

## G. First-run smoke test

Visit (replace with your domain):

- `https://fizam.ng` — the homepage should render.
- `https://fizam.ng/admin` — Payload login screen.
- `https://fizam.ng/diagnostics` — should show every required env var as **yes**.

If `/admin` redirects you to first-user setup, create your real super-admin account here, then delete the demo accounts seeded by `npm run seed` if you uploaded a seeded DB.

---

## H. Updating the site later

Quick path:

```bat
:: locally
git pull
npm install
npm run build
```

Re-upload only changed folders (`.next/standalone/`, `.next/static/`, and any new files in `public/`). Then in cPanel → **Setup Node.js App → Restart**.

If you ran `npm install` locally with new packages, also re-upload `node_modules/` (or click **Run NPM Install** in cPanel).

---

## I. Backups

Back up `data/fizam.db` **at least once a week**. cPanel → **JetBackup** or simply download via File Manager. Without this file you lose every product, order, and account.
