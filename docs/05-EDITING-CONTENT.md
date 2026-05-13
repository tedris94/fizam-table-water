# 05 · Editing website content (no coding)

This guide is for the marketing / sales staff. **You only need a browser.**

## 1. Sign in

1. Go to `https://fizam.ng/admin` (replace with your domain in development).
2. Enter your email and password. If you don't have an account, ask the super-admin.

## 2. Update the homepage hero

> The big banner with the headline and product photo.

1. Sidebar → **Globals → Home Page**.
2. Change `Hero Title` (the big headline) and `Hero Subtitle`.
3. (Optional) Upload a new `Hero Image`. Recommended size: **1200×800 px**, JPG, < 300 KB.
4. Click **Save** at the top.
5. Refresh the public site — the hero updates immediately.

## 3. Change phone, email, or address

1. Sidebar → **Globals → Site Settings**.
2. Edit the contact fields.
3. Save.

## 4. Add a new water product

1. Sidebar → **Collections → Products → Create New**.
2. Fill in `Name`, `Size`, `Price` (Naira, no commas), `Description`.
3. Upload an `Image`.
4. Set `Stock` (e.g. `1000`).
5. Save.
6. Visit `/order` — your new product appears in the cart.

## 5. Update an existing product price

1. **Collections → Products → click the product**.
2. Change `Price`.
3. Save.

## 6. Post a new job opening

1. Sidebar → **Collections → Jobs → Create New**.
2. Title, slug (lowercase-with-dashes), department, location, type, salary range, description.
3. Add `Requirements` one bullet at a time.
4. Set `Status = active`.
5. Save.
6. Visit `/careers` — your job is now visible. The “Apply” page is automatic.

## 7. Add or remove a team member

1. **Collections → Team Members**.
2. Either create a new entry or open an existing one.
3. Upload `Photo`, fill `Name`, `Position`, `Department`, `Bio`.
4. Use `Sort Order` to control the on-page order (lower numbers appear first).
5. Save.

## 8. Read contact-form messages

By default, contact-form submissions are **emailed** to the address in `CONTACT_NOTIFY_EMAIL` (see `.env`). They are **not** stored in Payload.

To check what was sent:

- Open the inbox of `hello@fizam.ng` (or whichever email is configured).

## 9. Approve / reject job applications

1. Sidebar → **Collections → Applications**.
2. Click an applicant.
3. Download the résumé (paperclip icon next to `Resume`).
4. Update `Status` to `approved` or `rejected`.
5. Email the candidate from your normal email — Payload does not auto-notify them.

## What you can NOT change from the admin

- Page layouts and colours (developer only).
- Adding brand-new pages (developer only — they live in `src/app/(frontend)/...`).
- Anything in the dashboard charts (those are computed automatically).

If you need any of those, contact the developer.
