# 07 · Email setup (SMTP)

The website sends three kinds of emails:

| When                                  | Who receives it                       |
| ------------------------------------- | ------------------------------------- |
| Visitor submits the contact form       | The address in `CONTACT_NOTIFY_EMAIL` |
| Visitor applies for a job              | The address in `HR_NOTIFY_EMAIL`      |
| Customer pays for an order             | The customer (and a copy if you want) |

Emails are sent via SMTP using [Nodemailer]. Any SMTP provider works — including the free one Namecheap gives you with the domain.

## 1. Create a mailbox in cPanel

1. Log into cPanel → **Email Accounts → Create**.
2. Use a domain mailbox like `noreply@fizam.ng` or `hello@fizam.ng`.
3. Set a strong password — copy it somewhere safe.

## 2. Find SMTP details

In cPanel → **Email Accounts → Connect Devices** for the mailbox you created. You will see something like:

| Field    | Value                                |
| -------- | ------------------------------------ |
| Server   | `mail.fizam.ng` (or `server.namecheaphosting.com`) |
| Port     | `465` (SSL) or `587` (STARTTLS)      |
| Username | `noreply@fizam.ng`                   |
| Password | the one you just set                 |

## 3. Add the variables to `.env` / cPanel env

```env
SMTP_HOST=mail.fizam.ng
SMTP_PORT=587
SMTP_SECURE=false        # set to "true" if using port 465
SMTP_USER=noreply@fizam.ng
SMTP_PASS=YourMailboxPassword
SMTP_FROM="Fizam Table Water <noreply@fizam.ng>"

CONTACT_NOTIFY_EMAIL=hello@fizam.ng
HR_NOTIFY_EMAIL=hr@fizam.ng

# Optional: different visible “From” per kind of email (still one SMTP login above).
# SMTP_FROM_ORDERS="Fizam Sales <sales@fizam.ng>"      # → customers (order confirmation)
# SMTP_FROM_INTERNAL="Fizam <noreply@fizam.ng>"       # → staff (contact + job alerts); falls back to SMTP_FROM
```

Restart the app (`pnpm dev` locally, or **Restart App** in cPanel).

## 3b. Multiple addresses vs multiple mailboxes

**What the app supports today**

- **One SMTP login:** `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (one mailbox password).
- **Different visible senders** via:
  - **`SMTP_FROM`** — default “From” for anything that does not use an override.
  - **`SMTP_FROM_ORDERS`** — used for **order confirmation** emails to customers (e.g. sales@).
  - **`SMTP_FROM_INTERNAL`** — used for **contact form** and **job application** notifications to your team (e.g. noreply@ or hello@).

If you omit the two optional lines, everything uses `SMTP_FROM` (same as before).

**Host requirement:** Many providers let one authenticated mailbox send mail **as other addresses on the same domain** (aliases / “send as”). If the server rejects `From: sales@…` while logged in as `noreply@…`, either create **sales@** and use it as `SMTP_USER`, or add the alias in cPanel **Email → Forwarders / Send mail as**.

**True separate mailboxes** (different passwords, different SMTP users) need **either** a provider that exposes one SMTP relay for the whole domain **or** code with multiple transporters (e.g. `SMTP_ORDERS_USER` / `SMTP_ORDERS_PASS` …). That is not in the codebase yet; the three `SMTP_FROM_*` variables cover the usual “sales vs noreply” branding on one login.

**Payload / password-reset email:** this repo does not yet wire a Payload-specific mailer. When you add it, configure that adapter to use your **noreply** (or transactional) identity there.

## 4. Test it

- Locally:
  ```bash
  curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"me@example.com\",\"message\":\"hi\"}"
  ```
- In production: open `/` → scroll to the “Get in Touch” form → submit a test message.

If the email never arrives:

1. Check the cPanel **Errors** log for SMTP errors (auth failed, host unreachable, etc.).
2. Some Namecheap plans block outgoing port 587 — try `SMTP_PORT=465 SMTP_SECURE=true`.
3. Some hosts require enabling “Send email from this account” in cPanel’s Email Deliverability page (set up SPF + DKIM there too).

## 5. Optional: external provider

You can also use:

- **Resend** (https://resend.com) — easiest API, paid above 100 emails/day.
- **Mailgun**, **SendGrid**, **Postmark** — all work via SMTP.

For Resend you can use SMTP credentials they provide:
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxx
```

[Nodemailer]: https://nodemailer.com
