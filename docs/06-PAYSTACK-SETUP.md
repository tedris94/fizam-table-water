# 06 · Paystack setup

The `/order` page lets visitors pay for water online with a card / bank transfer / USSD via Paystack. Here is how to wire it up.

## 1. Create a Paystack account

1. Sign up at https://dashboard.paystack.com.
2. Verify your business documents to enable **live** mode (you can test before that with **test** mode).

## 2. Find your API keys

1. In Paystack dashboard → **Settings → API Keys & Webhooks**.
2. You see two pairs:

   - **Test secret key** (`sk_test_...`) and **Test public key** (`pk_test_...`).
   - **Live secret key** (`sk_live_...`) and **Live public key** (`pk_live_...`).

3. Copy them into `.env` (development) or your cPanel “Application environment variables” (production):

   ```env
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
   ```

> **Never commit live keys to Git.** Only the `.env.example` file ships placeholder values.

## 3. Add the webhook URL

1. Same screen → scroll to **Webhooks**.
2. Add: `https://fizam.ng/api/paystack/webhook` (use the live URL).
3. Save.

## 4. Test a payment locally (optional)

1. Set test keys in `.env`.
2. Restart `npm run dev`.
3. Visit `http://localhost:3000/order`, add items, click **Pay with Paystack**.
4. Use a test card from https://paystack.com/docs/payments/test-payments — e.g. `4084 0840 8408 4081`, any future expiry, CVV `408`, OTP `123456`.
5. After redirect, the order in `/admin → Orders` should turn from `pending` → `paid`.

## 5. Switch to live mode

1. Replace the test keys in `.env` (production) with `sk_live_...` and `pk_live_...`.
2. Restart the app from cPanel → Setup Node.js App → **Restart**.
3. Make a real ₦50 purchase to confirm everything works end-to-end.

## How payments flow

1. Customer fills the cart at `/order` and clicks **Pay**.
2. The site calls `/api/paystack/initialize`, which creates an `Order` (status `pending`) and asks Paystack for an authorization URL.
3. The browser is redirected to Paystack’s checkout page.
4. After payment, Paystack sends the customer back to `/order/success?reference=…`.
5. That page calls `/api/paystack/verify` to double-check the payment, then updates the order to `paid`, decrements stock, and emails the customer.
6. As a backup, Paystack also calls `/api/paystack/webhook` server-to-server with the same data.

## Common issues

- **“Payments are not configured on this server.”** — `PAYSTACK_SECRET_KEY` is missing from environment.
- **Customers reach `/order/success` but the order stays `pending`.** — The verify endpoint failed; check the server logs (cPanel → **Errors**).
- **Webhook never fires.** — Make sure the URL is exactly `https://fizam.ng/api/paystack/webhook` and SSL is active.
