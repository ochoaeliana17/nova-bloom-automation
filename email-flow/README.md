# Nova Bloom — Post-purchase email automation

A lightweight Node.js server that listens for Shopify fulfillment webhooks and
automatically sends a 4-email sequence to every customer after their order ships.

## The email sequence

| Email | Trigger | Goal |
|-------|---------|------|
| 1. Delivery confirmation | Order fulfilled | Reassure, build trust |
| 2. Plant care guide | Day 3 | Reduce support tickets, delight |
| 3. Review request | Day 7 | Social proof, SEO |
| 4. Upsell + discount | Day 14 | Repeat purchase |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your keys
```

### 3. Get a Mandrill API key

1. Go to mailchimp.com → Transactional → Settings → SMTP & API info
2. Create an API key
3. Add your sending domain (novabloom.pt) and verify DNS records

### 4. Register the Shopify webhook

In your Shopify admin:
- Settings → Notifications → Webhooks → Create webhook
- Event: **Order fulfillment / Fulfillment creation**
- URL: `https://your-domain.com/webhooks/order-fulfilled`
- Format: JSON

Copy the webhook secret shown and add it to `.env` as `SHOPIFY_WEBHOOK_SECRET`.

### 5. Start the server

```bash
# Production
npm start

# Development (auto-restarts)
npm run dev
```

### 6. Expose locally for testing (optional)

```bash
npx ngrok http 3000
# Use the ngrok URL as your Shopify webhook URL
```

## How it works

1. Shopify sends a POST to `/webhooks/order-fulfilled` when an order is fulfilled
2. The server verifies the HMAC signature (security)
3. It schedules 4 emails to `email_queue.json` with their send timestamps
4. A cron job runs every 5 minutes and sends any emails that are due
5. Failed sends are retried up to 3 times (30-minute intervals)

## File structure

```
server.js           — Express server + webhook endpoint
emailScheduler.js   — Queue manager (reads/writes email_queue.json)
emailTemplates.js   — HTML email templates for all 4 emails
emailSender.js      — Mandrill API wrapper
email_queue.json    — Auto-created, persists the send queue
.env                — Your secrets (never commit this)
```

## Customising the templates

All 4 email templates are in `emailTemplates.js`. Each function receives a
`context` object with:

```js
{
  orderId, orderNumber,
  customerEmail, customerFirstName,
  trackingNumber, trackingUrl,
  estimatedDelivery,
  products: [{ name, quantity, price }],
  primaryProduct  // first item name, used in subject lines
}
```

## Scaling up

For higher volume, replace `email_queue.json` with a proper database (SQLite,
Postgres, or Redis). The scheduler interface (`scheduleEmail`, `processDueEmails`)
stays the same — only the storage layer needs updating.
