# Fizam Table Water — Website & CMS

A single Next.js 15 application that powers **fizam.ng**:

- Public marketing site (Home, About, Products, Quality, Sales, Contact, Team, Careers, Order, Login, Privacy, Terms).
- **Payload CMS 3** mounted at `/admin` for staff to manage content, products, jobs, orders, and applications.
- Role-based dashboards (Super Admin / Admin / HR / User) at `/dashboard`.
- **Paystack** checkout and webhook for online orders.
- SQLite database — no external DB server required.

---

## 🚀 Quickstart (Windows / WAMP)

```powershell
cd C:\wamp64\www\fizam.ng
node -v          # must match .nvmrc (v24.15.0) or any supported 24.x
copy .env.example .env
notepad .env     # set PAYLOAD_SECRET, Paystack & SMTP keys
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
pnpm run seed    # creates SQLite db + demo users / products / jobs
pnpm dev         # http://localhost:3000
```

Demo accounts seeded by `pnpm run seed`:

| Role        | Email                    | Password |
| ----------- | ------------------------ | -------- |
| Super Admin | superadmin@fizam.com     | demo123  |
| Admin       | admin@fizam.com          | demo123  |
| HR          | hr@fizam.com             | demo123  |

> **First step at the Payload admin** → `/admin`. Use the seeded super-admin to sign in.

---

## 📚 Beginner-friendly documentation

Open the [`docs/`](./docs) folder — read the files in order if you have never edited a website before:

1. [`docs/00-WHAT-IS-THIS.md`](./docs/00-WHAT-IS-THIS.md)
2. [`docs/01-PREREQUISITES.md`](./docs/01-PREREQUISITES.md)
3. [`docs/02-PROJECT-STRUCTURE.md`](./docs/02-PROJECT-STRUCTURE.md)
4. [`docs/03-RUNNING-LOCALLY.md`](./docs/03-RUNNING-LOCALLY.md)
5. [`docs/04-PAYLOAD-CMS-GUIDE.md`](./docs/04-PAYLOAD-CMS-GUIDE.md)
6. [`docs/05-EDITING-CONTENT.md`](./docs/05-EDITING-CONTENT.md)
7. [`docs/06-PAYSTACK-SETUP.md`](./docs/06-PAYSTACK-SETUP.md)
8. [`docs/07-EMAIL-SETUP.md`](./docs/07-EMAIL-SETUP.md)
9. [`docs/08-DEPLOY-NAMECHEAP.md`](./docs/08-DEPLOY-NAMECHEAP.md)
10. [`docs/09-TROUBLESHOOTING.md`](./docs/09-TROUBLESHOOTING.md)
11. [`docs/10-SEO-GOOGLE.md`](./docs/10-SEO-GOOGLE.md) — sitemap, Search Console, ranking for “Fizam”

---

## 🛠 Scripts

| Command                      | What it does                                                  |
| ---------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                   | Start Next.js + Payload in development.                       |
| `pnpm run build`             | Production build (standalone when `BUILD_STANDALONE=1`).      |
| `pnpm start`                 | Run the built production server.                              |
| `pnpm run seed`              | Seed SQLite with demo users, products, jobs, and globals.     |
| `pnpm run generate:types`    | Regenerate `src/payload-types.ts` after collection changes.   |
| `pnpm run generate:importmap`| Regenerate Payload admin import map.                          |

---

## 🔑 Required environment variables

See [`.env.example`](./.env.example) for the full list. The most important ones:

- `PAYLOAD_SECRET` — long random string used for cookies/JWTs. **Required.**
- `DATABASE_URI` — SQLite connection string (defaults to `file:./data/fizam.db`).
- `NEXT_PUBLIC_SITE_URL` — public URL (used by Paystack callbacks).
- `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — Paystack live or test keys.
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — for outbound email (orders, applications, contact).

---

## ☁️ Deploy to Namecheap Stellar

See [`docs/08-DEPLOY-NAMECHEAP.md`](./docs/08-DEPLOY-NAMECHEAP.md) for click-by-click instructions. Short version:

1. Prefer **GitHub Actions → “Namecheap standalone ZIP”** (see `docs/08-DEPLOY-NAMECHEAP.md`).
2. cPanel → **Setup Node.js App** → Node **24.15.0** (or latest **24.x** offered) → startup file **`server.js`** for the CI flat bundle (or `app.js` only for the legacy full-tree layout).
3. Add env vars in cPanel UI, click **Restart App**.
