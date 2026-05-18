# 10 · SEO & Google ranking (fizam.ng)

Technical SEO is implemented in code. **Ranking #1 for “fizam”** also depends on Google Search Console, backlinks, and time — especially while **fizamtablewater.com** already ranks for similar terms.

---

## What the site does automatically

| Feature | URL / location |
|---------|----------------|
| **Sitemap** | `https://fizam.ng/sitemap.xml` |
| **Robots** | `https://fizam.ng/robots.txt` |
| **Canonical URLs** | Every public page → `https://fizam.ng/...` |
| **Open Graph / Twitter** | Social previews with title, description, image |
| **JSON-LD** | Organization, WebSite, LocalBusiness (brand “Fizam”) |
| **CMS SEO** | Payload → **Globals → Site Settings** (`defaultMetaTitle`, `defaultMetaDescription`, `defaultKeywords`, `googleSiteVerification`) |

After deploy, verify:

```bash
curl -sI https://fizam.ng/sitemap.xml | head -3
curl -s https://fizam.ng/robots.txt
```

View page source on the homepage — look for `<script type="application/ld+json">` and `<link rel="canonical"`.

---

## Step 1 — Google Search Console (required)

1. Go to [Google Search Console](https://search.google.com/search-console).
2. **Add property** → **URL prefix** → `https://fizam.ng`
3. Verify ownership (choose one):
   - **HTML tag** — copy the `content="..."` value into Payload **Site Settings → Google Site Verification**, save, redeploy/restart, then click Verify in Google.
   - **DNS** — add TXT record in Namecheap domain DNS (works for root domain).
4. After verification → **Sitemaps** → submit: `https://fizam.ng/sitemap.xml`
5. **URL inspection** → enter `https://fizam.ng/` → **Request indexing**

Repeat for important URLs: `/about`, `/order`, `/quality-certifications`.

---

## Step 2 — Google Business Profile (strongly recommended)

For local and brand searches in Nigeria:

1. Create or claim [Google Business Profile](https://business.google.com) for **Fizam Table Water**.
2. Use the **same** business name, phone, and address as on the website / Site Settings.
3. Add website: `https://fizam.ng`
4. Add photos, hours, and product categories (Bottled water supplier).

This helps Maps and “near me” queries; it also reinforces brand entity signals for “Fizam”.

---

## Step 3 — Optimize CMS content (admin)

**Payload admin** → **Globals**:

| Global | SEO tip |
|--------|---------|
| **Site Settings** | Title should start with **“Fizam”**. Description should mention *Fizam Table Water*, *Nigeria*, *NAFDAC*, *fizam.ng* naturally (≈150 chars). |
| **Home Page** | Hero title should include **Fizam** (e.g. “Pure hydration for every Nigerian home” is OK if H1/brand is visible; prefer “Fizam — …”). |

**Do not** stuff keywords unnaturally. Google penalizes spam.

---

## Step 4 — Bing (optional)

Submit sitemap at [Bing Webmaster Tools](https://www.bing.com/webmasters) using the same `sitemap.xml` URL.

---

## Step 5 — Off-site signals (to outrank fizamtablewater.com)

Competitors rank because of **age, backlinks, and brand mentions**. For `fizam.ng` to move up for query **“fizam”**:

1. **Consistent NAP** — same name, address, phone on site, Google Business, social bios.
2. **Social profiles** — fill Facebook / Instagram / X URLs in Site Settings (used in JSON-LD `sameAs`).
3. **Listings** — Nigerian business directories, NAFDAC listing page if applicable.
4. **Press / partners** — links from suppliers, retailers, or local news to `https://fizam.ng`.
5. **Internal links** — link to `fizam.ng` from any other domains you control.
6. **Avoid duplicate content** — if both `fizam.ng` and `fizamtablewater.com` are yours, pick one **canonical** brand domain and redirect or clearly differentiate.

---

## Step 6 — Monitor (monthly)

In Search Console:

- **Performance** → queries containing `fizam` — track impressions, clicks, average position.
- **Pages** — which URLs get traffic.
- **Indexing** → fix any “Crawled – not indexed” issues.

Expected timeline: first impressions in days; competitive #1 for a single-word brand query often takes **weeks to months** depending on competition.

---

## Technical checklist after each deploy

- [ ] `NEXT_PUBLIC_SITE_URL=https://fizam.ng` in cPanel (rebuild if changed)
- [ ] `https://fizam.ng/sitemap.xml` returns 200
- [ ] Homepage `<title>` contains **Fizam**
- [ ] No `noindex` on homepage (only on `/login`, `/test`, `/order/success`, apply pages)
- [ ] Search Console sitemap re-submitted after large URL changes

---

## Files in the repo

| File | Role |
|------|------|
| `src/lib/seo.ts` | Metadata helpers, keywords, defaults |
| `src/lib/site-settings-seo.ts` | Loads Site Settings from Payload |
| `src/components/seo/SiteJsonLd.tsx` | Structured data |
| `src/app/sitemap.ts` | Dynamic sitemap |
| `src/app/robots.ts` | Crawl rules |
| `src/app/(frontend)/layout.tsx` | Site-wide metadata + JSON-LD |

---

*See also: `docs/08-DEPLOY-NAMECHEAP.md` for deployment.*
