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
```

Restart the app (`npm run dev` locally, or **Restart App** in cPanel).

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

## Optional: external provider

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
