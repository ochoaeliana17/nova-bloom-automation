# 🌿 Nova Bloom — E-commerce Automation Case Study

> A simulated business diagnostic and automation build, created as a portfolio project to demonstrate process analysis, solution design, and full-stack implementation skills.

---

## What is this?

**Nova Bloom** is a fictional direct-to-consumer plant e-commerce company (Porto, PT · 32 people · €2.1M ARR). I created it to simulate a real consulting engagement:

1. **Designed the company** — industry, size, team structure, tech stack, pain points
2. **Ran a diagnostic** — mapped every manual process, scored by impact and effort
3. **Built the automation** — real, production-ready code for the highest-priority opportunity

---

## The diagnostic: 5 opportunities found

| # | Opportunity | Impact | Effort | Status |
|---|-------------|--------|--------|--------|
| 1 | Post-purchase email flow | ████████░ 90% | ██░░░░░ 20% | ✅ Built |
| 2 | AI support triage bot | ████████░ 85% | ███░░░░ 30% | 🔜 Next |
| 3 | Inventory alert system | ██████░░░ 65% | ██░░░░░ 20% | 🔜 Planned |
| 4 | Customer 360° dashboard | ████████░ 80% | █████░░ 55% | 🔜 Planned |
| 5 | Marketing campaign calendar | █████░░░░ 55% | █████░░ 50% | 🔜 Planned |

---

## Built: Post-purchase email flow

### The problem
Nova Bloom was fulfilling **~1,400 orders per month** with **zero post-purchase communication**. No delivery confirmation, no care tips, no review requests, no upsell. Customers received their plant and never heard from the company again.

### The solution
A Node.js server that listens for Shopify fulfillment webhooks and automatically triggers a 4-email sequence for every customer.

```
Order fulfilled
      │
      ▼
[Day  0]  📦  Delivery confirmation  →  tracking link, reassurance
[Day  3]  🌿  Plant care guide       →  watering, light, temperature tips
[Day  7]  ⭐  Review request         →  star rating, link to product page
[Day 14]  🏷️  Upsell + discount      →  companion plants, BLOOM15 (15% off)
```

### Expected impact
| Metric | Projection |
|--------|-----------|
| Repeat purchase rate | +18% from upsell email |
| Support ticket volume | −30% from proactive delivery info |
| Reviews collected/month | 4× current baseline |
| Weekly manual work | 0 hours once deployed |

---

## Technical architecture

```
server.js           Shopify webhook receiver (HMAC verified)
emailScheduler.js   File-based job queue with retry logic (3× max)
emailTemplates.js   4 branded HTML email templates, dynamic variables
emailSender.js      Mailchimp Transactional (Mandrill) API wrapper
email_queue.json    Auto-generated, persists pending/sent/failed jobs
```

**Stack:** Node.js · Express · Mailchimp Transactional · Shopify Webhooks · node-cron

**Key implementation decisions:**
- HMAC verification on every webhook — protects against spoofed orders
- File-based queue (not in-memory) — jobs survive server restarts
- Exponential retry with backoff — handles transient API failures
- Idempotency check — prevents duplicate emails per order per type

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Add SHOPIFY_WEBHOOK_SECRET and MANDRILL_API_KEY

# 3. Run
npm start

# 4. Register Shopify webhook
# Settings → Notifications → Webhooks
# Event: Fulfillment creation
# URL: https://your-domain.com/webhooks/order-fulfilled
```

For local testing, expose with `npx ngrok http 3000` and use the ngrok URL.

---

## Email templates (preview)

### Email 1 — Delivery confirmation (Day 0)
**Subject:** `Your plants are on their way, {{first_name}}! 📦`

Sent immediately on fulfillment. Includes order number, tracking link, and estimated delivery date. Sets the tone: warm, personal, brand-consistent.

### Email 2 — Plant care guide (Day 3)
**Subject:** `How to care for your new plants, {{first_name}}`

Care tips for the specific plants ordered: watering schedule, light requirements, temperature range, repotting guidance. Reduces support tickets about plant health.

### Email 3 — Review request (Day 7)
**Subject:** `How are your plants doing? We'd love your feedback`

Star rating prompt with direct link to the product review page. Soft touch — also opens a reply channel for issues before they become public complaints.

### Email 4 — Upsell + discount (Day 14)
**Subject:** `Plants that pair perfectly with your {{primary_product}}`

Curated companion plant suggestions based on the original purchase. Includes a 7-day discount code (BLOOM15) to incentivise the second order.

---

## Methodology

This project follows a consulting-style diagnostic framework:

```
1. Map current state      Catalogue every manual process
2. Score opportunities    Impact × Effort matrix
3. Prioritise ruthlessly  Build the top-right quadrant first
4. Build & measure        Ship working code, track results
5. Iterate                Next highest-priority opportunity
```

The same approach applies to any business — swap Nova Bloom's pain points for real ones and the process is identical.

---

## What's next

- [ ] **Support triage bot** — Claude API classifies support emails, auto-replies to common cases
- [ ] **Inventory alerts** — Shopify API monitoring with configurable thresholds
- [ ] **Customer 360 dashboard** — Merged view: orders + support tickets + email engagement
- [ ] **Marketing brief generator** — AI-powered campaign brief from a one-line theme

---

## Project structure

```
nova-bloom-emails/
├── server.js            Main server + webhook endpoint
├── emailScheduler.js    Queue management
├── emailTemplates.js    All 4 email templates
├── emailSender.js       Mandrill API wrapper
├── package.json
├── .env.example
└── README.md
```

---

*This is a portfolio project. Nova Bloom is a fictional company. All data, metrics, and projections are illustrative.*
