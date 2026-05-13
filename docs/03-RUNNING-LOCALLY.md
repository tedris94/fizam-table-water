# 03 · Running the website on your laptop

You need this when you want to preview changes safely before pushing them live.

## Step 1 — Open a Command Prompt in this folder

In Windows Explorer, type the address bar `cmd` while inside the folder, then press Enter. The Command Prompt should now show the project path.

## Step 2 — Copy environment variables

```bat
copy .env.example .env
```

Open `.env` in Notepad and fill in:

- `PAYLOAD_SECRET` — paste this random string:
  ```bat
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- (Optional, only if testing payments) `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` from https://dashboard.paystack.com.
- (Optional) SMTP variables if you want to test email.

## Step 3 — Install dependencies

This downloads ~600 MB the first time. Be patient.

```bat
npm install
```

## Step 4 — Seed the database

Creates the SQLite file with demo users, products, jobs, and team members.

```bat
npm run seed
```

## Step 5 — Start the website

```bat
npm run dev
```

Visit:

- http://localhost:3000 — public site
- http://localhost:3000/admin — Payload CMS (login with `superadmin@fizam.com` / `demo123`)
- http://localhost:3000/dashboard — role-based staff dashboards

To stop the server, press `Ctrl + C` in the Command Prompt.

## Step 6 — When you change anything

The site auto-reloads while `npm run dev` is running. Just save the file and refresh the browser.

If you change a **Payload collection** (`src/collections/*.ts`), regenerate types:

```bat
npm run generate:types
npm run generate:importmap
```

## Step 7 — Test a production build (optional)

```bat
npm run build
npm start
```

This is what the live server runs. If `npm run build` fails, fix the error before deploying.
