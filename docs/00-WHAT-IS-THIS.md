# 00 · What is this project?

Welcome! This file is for someone who has **never** edited a website before. Read it first.

## In one paragraph

The folder you are looking at (`fizam.ng/`) is the source code for **fizam.ng** — the website where Fizam Table Water sells water, posts jobs, and tells customers about the brand. It is a single application that contains:

- The **public website** that visitors see (https://fizam.ng).
- An **admin area** at `/admin` where staff log in to add products, edit text, and approve orders. (This is called a **CMS**.)
- A **dashboard** at `/dashboard` for managers and HR to see business numbers (orders, applications, etc.).
- Tools that take **online payments** through Paystack and send **emails**.

## Vocabulary you will see

| Term            | What it means in plain English                                                  |
| --------------- | ------------------------------------------------------------------------------- |
| Next.js         | The framework that builds the website pages.                                   |
| Payload (CMS)   | The “admin area” that lets non-developers edit content without touching code.  |
| SQLite          | The file (`data/fizam.db`) that stores all the data — like an Excel database.  |
| Node.js         | The engine that runs the website locally and on the server.                    |
| `.env`          | A small file holding secret keys (passwords, API keys). Never share it.        |
| Paystack        | The Nigerian payment processor that handles credit/debit cards online.         |
| SMTP            | The protocol that lets the website send emails (for orders, applications).     |
| Namecheap       | The hosting company that runs the website on the internet.                     |
| Passenger       | The tool on Namecheap that keeps the website running 24/7.                     |

## What you need to do depends on your role

- **Marketing / content editor** → read `05-EDITING-CONTENT.md`. You only need a browser.
- **HR / orders staff** → read `04-PAYLOAD-CMS-GUIDE.md` then sign in at `/admin` or `/dashboard`.
- **Developer / IT** → read every file in this folder, in order.

> If something breaks, jump straight to `09-TROUBLESHOOTING.md`.
