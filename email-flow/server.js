require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const { scheduleEmail, processDueEmails } = require("./emailScheduler");
const cron = require("node-cron");

const app = express();
app.use(express.json({ verify: rawBodyBuffer }));

function rawBodyBuffer(req, res, buf) {
  req.rawBody = buf;
}

// Verify the webhook is genuinely from Shopify
function verifyShopifyWebhook(req) {
  const hmac = req.headers["x-shopify-hmac-sha256"];
  if (!hmac) return false;
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));
}

// Shopify fires this when an order is fulfilled (shipped)
app.post("/webhooks/order-fulfilled", async (req, res) => {
  if (!verifyShopifyWebhook(req)) {
    return res.status(401).send("Unauthorized");
  }

  res.status(200).send("OK"); // Acknowledge immediately — Shopify times out at 5s

  const order = req.body;
  const customer = order.customer;
  if (!customer?.email) return;

  const context = {
    orderId: order.id,
    orderNumber: order.order_number,
    customerEmail: customer.email,
    customerFirstName: customer.first_name || "there",
    trackingNumber: order.fulfillments?.[0]?.tracking_number || "—",
    trackingUrl: order.fulfillments?.[0]?.tracking_url || "#",
    estimatedDelivery: getEstimatedDelivery(),
    products: order.line_items.map((i) => ({
      name: i.title,
      quantity: i.quantity,
      price: i.price,
    })),
    primaryProduct: order.line_items[0]?.title || "your plant",
  };

  const now = Date.now();

  await scheduleEmail({
    type: "delivery_confirmation",
    sendAt: now,                          // Email 1: immediate
    context,
  });
  await scheduleEmail({
    type: "care_guide",
    sendAt: now + days(3),                // Email 2: day 3
    context,
  });
  await scheduleEmail({
    type: "review_request",
    sendAt: now + days(7),                // Email 3: day 7
    context,
  });
  await scheduleEmail({
    type: "upsell_offer",
    sendAt: now + days(14),               // Email 4: day 14
    context,
  });

  console.log(`[${order.order_number}] Scheduled 4 emails for ${customer.email}`);
});

// Health check
app.get("/health", (_, res) => res.json({ status: "ok", time: new Date() }));

// Process scheduled emails every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  await processDueEmails();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Nova Bloom email server running on port ${PORT}`);
  processDueEmails(); // Process any pending on startup
});

function days(n) {
  return n * 24 * 60 * 60 * 1000;
}

function getEstimatedDelivery() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
