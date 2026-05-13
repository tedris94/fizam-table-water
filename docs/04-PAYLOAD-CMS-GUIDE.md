# 04 · Payload CMS — for staff & developers

Payload is the friendly admin area at `/admin`. It is a tool that turns the website into a CMS so non-developers can change content without editing code.

## How to log in

1. Visit `https://fizam.ng/admin` (or `http://localhost:3000/admin` in development).
2. Enter your email and password (set up via `npm run seed` or by another admin in the **Users** collection).
3. You will land on the Payload dashboard.

## What you can manage

| Section            | What it controls                                                           |
| ------------------ | -------------------------------------------------------------------------- |
| **Users**          | Staff accounts. Each user has a role: `super_admin`, `admin`, `hr`, `user`. |
| **Products**       | The water products on the order page (name, size, price, photo, stock).     |
| **Orders**         | Customer orders. Updates status (pending → paid → delivered).               |
| **Team Members**   | People shown on the `/team` page.                                           |
| **Jobs**           | Open job listings shown on `/careers`.                                      |
| **Applications**   | Job applications submitted by visitors (with their résumé file).            |
| **Pages**          | (Reserved for future CMS-managed marketing pages.)                          |
| **Media**          | All uploaded images and PDFs.                                               |
| **Site Settings**  | Phone, email, address, default SEO meta tags.                               |
| **Home Page**      | Hero title/subtitle/photo and About copy.                                   |

## Roles & what they can do

| Role          | Can manage                                                                |
| ------------- | ------------------------------------------------------------------------- |
| `super_admin` | Everything (creates other users, deletes records).                        |
| `admin`       | Products, Orders, Team Members, Pages, Media, Site Settings.              |
| `hr`          | Jobs, Applications, Team Members.                                         |
| `user`        | Their own profile and order history (no admin access).                    |

## Common tasks

### Add a new staff member

1. `Users → Create New`.
2. Email + temporary password.
3. Pick a role.
4. Send the credentials to the staff member; ask them to change the password from their profile.

### Add a new product

1. `Products → Create New`.
2. Enter name, size (e.g. `75cl`), price (in Naira, no commas), description.
3. Upload a product image (`Image → Upload`). Aim for ~800px square JPG/PNG.
4. Set the stock count. Save.

### Approve an order manually

1. `Orders → click the order`.
2. Verify the Paystack reference matches your Paystack dashboard.
3. Set status to `delivered` once the courier confirms.

### Approve / reject a job application

1. `Applications → click the candidate`.
2. Read the cover letter and download the résumé.
3. Change `status` to `approved` or `rejected`. The candidate is **not** auto-emailed — contact them yourself.

## Tips

- Always click **Save** at the top. Payload does not auto-save.
- Use the “Versions” feature (top-right clock icon) to compare or restore previous edits.
- If you’re editing the Home page hero image, keep it under **300 KB** for fast loading.
