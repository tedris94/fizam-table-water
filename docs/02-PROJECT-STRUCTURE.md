# 02 · Project structure

Here is what each folder does. You will not need to touch most of them as a non-developer.

```
fizam.ng/
├─ docs/                  ← The guide you are reading.
├─ public/                ← Static files served as-is (favicon, robots.txt, images).
├─ data/                  ← SQLite database file. Treat as PRECIOUS — back it up!
├─ scripts/
│  └─ seed.ts             ← Creates demo users/products/jobs (run once with `npm run seed`).
├─ src/
│  ├─ app/
│  │  ├─ (frontend)/      ← Public website pages (Home, Team, Careers, Order, Login...).
│  │  ├─ (dashboard)/     ← Authenticated pages at /dashboard.
│  │  ├─ (payload)/       ← The Payload admin UI (/admin).
│  │  ├─ api/             ← Custom server endpoints (Paystack, contact form, careers).
│  │  └─ globals.css      ← Site-wide CSS variables and Tailwind setup.
│  ├─ collections/        ← Definitions of every "table" Payload manages (Users, Products, Jobs...).
│  ├─ globals/            ← Site-wide settings ("SiteSettings", "HomePage").
│  ├─ components/
│  │  ├─ frontend/        ← Reusable pieces for the public site (Hero, About, Footer...).
│  │  ├─ dashboard/       ← Reusable pieces for the dashboards.
│  │  └─ site/            ← Layout chrome (navbar/footer wrapper).
│  ├─ contexts/           ← React “context” providers (e.g. AuthContext).
│  ├─ lib/                ← Helpers: payload, email, paystack, orders.
│  ├─ middleware.ts       ← Protects /dashboard so visitors must log in.
│  └─ payload.config.ts   ← Master Payload configuration (loaded by Next.js).
├─ app.js                 ← Entry file used by Namecheap Passenger in production.
├─ .htaccess              ← Apache rules for production hosting.
├─ next.config.ts         ← Next.js settings (also loads Payload's plugin).
├─ package.json           ← Project name, scripts, dependencies.
└─ .env.example           ← Copy to `.env` and fill in real secrets locally.
```

## Where the data lives

| Where                          | What it stores                                      |
| ------------------------------ | --------------------------------------------------- |
| `data/fizam.db`                | All Payload records: users, products, orders, etc. |
| `media/` (auto-created)        | Uploaded images and files (created on first upload).|
| Paystack dashboard             | Customer payments (we only store the reference).   |
| SMTP outbox / inbox            | Email confirmations and contact-form messages.     |

## Files you might edit (non-developer)

- **Marketing copy**: do it in the Payload admin (`/admin → Globals → Home Page`). No coding required.
- **Job postings**: `/admin → Collections → Jobs`.
- **Products & prices**: `/admin → Collections → Products`.
- **Site contact info**: `/admin → Globals → Site Settings`.

If you find yourself opening files in `src/` to change wording, **stop** — almost everything visible on the site can be edited from `/admin` instead. Read `05-EDITING-CONTENT.md` next.
