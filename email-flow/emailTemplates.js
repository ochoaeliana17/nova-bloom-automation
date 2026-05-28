function renderTemplate(type, ctx) {
  const templates = {
    delivery_confirmation: deliveryConfirmation,
    care_guide:            careGuide,
    review_request:        reviewRequest,
    upsell_offer:          upsellOffer,
  };

  const fn = templates[type];
  if (!fn) throw new Error(`Unknown template: ${type}`);
  return fn(ctx);
}

// ─── Shared layout wrapper ───────────────────────────────────────────────────

function layout(preheader, body) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Nova Bloom</title>
  <style>
    body { margin:0; padding:0; background:#f5f5f0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:0 auto; }
    .header { background:#1D9E75; padding:28px 32px 24px; }
    .logo { font-size:20px; font-weight:600; color:#E1F5EE; }
    .tagline { font-size:12px; color:#9FE1CB; margin-top:4px; }
    .body { background:#ffffff; padding:32px; }
    h1 { font-size:22px; font-weight:600; color:#1a1a1a; margin:0 0 16px; line-height:1.3; }
    p { font-size:15px; color:#555; line-height:1.7; margin:0 0 16px; }
    .cta { display:inline-block; background:#1D9E75; color:#ffffff !important; font-size:15px;
           font-weight:600; padding:13px 28px; border-radius:8px; text-decoration:none; margin:8px 0 24px; }
    .divider { border:none; border-top:1px solid #f0f0f0; margin:24px 0; }
    .footer { background:#f5f5f0; padding:20px 32px; font-size:12px; color:#999; text-align:center; }
    .footer a { color:#999; }
  </style>
</head>
<body>
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Nova Bloom</div>
      <div class="tagline">Plants for every home</div>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      Nova Bloom · Rua das Flores, Porto, Portugal<br>
      <a href="{{unsubscribe_url}}">Unsubscribe</a> &nbsp;·&nbsp;
      <a href="https://novabloom.pt/privacy">Privacy policy</a>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email 1: Delivery confirmation ──────────────────────────────────────────

function deliveryConfirmation(ctx) {
  const subject = `Your plants are on their way, ${ctx.customerFirstName}! 📦`;

  const body = `
    <h1>Your order is confirmed and on its way!</h1>
    <p>Hi ${ctx.customerFirstName}, we've packed your order <strong>#${ctx.orderNumber}</strong> with care and it's now with our courier.</p>
    <p>
      <strong>Estimated delivery:</strong> ${ctx.estimatedDelivery}<br>
      <strong>Tracking number:</strong> ${ctx.trackingNumber}
    </p>
    <a href="${ctx.trackingUrl}" class="cta">Track my order</a>
    <hr class="divider">
    <p style="font-size:13px;color:#888;">In a few days we'll send you personalised care tips for your new plants. In the meantime, if you have any questions just reply to this email.</p>`;

  return { subject, html: layout("Your order is on its way!", body) };
}

// ─── Email 2: Care guide ──────────────────────────────────────────────────────

function careGuide(ctx) {
  const subject = `How to care for your new plants, ${ctx.customerFirstName}`;

  const productList = ctx.products
    .map((p) => `<li style="margin-bottom:4px">${p.quantity}× ${p.name}</li>`)
    .join("");

  const body = `
    <h1>Help your plants thrive — here's your care guide</h1>
    <p>Hi ${ctx.customerFirstName}, your plants should be settling in nicely by now. Here's everything you need to know to keep them happy:</p>

    <p><strong>Your order included:</strong></p>
    <ul style="font-size:14px;color:#555;line-height:1.9;margin:0 0 20px;">${productList}</ul>

    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;width:36px;">💧</td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid #f0f0f0;">
          <strong style="display:block;margin-bottom:4px;">Watering</strong>
          <span style="font-size:14px;color:#666;">Once a week. Let the top 2cm of soil dry between waterings. Avoid standing water in the pot tray.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">☀️</td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid #f0f0f0;">
          <strong style="display:block;margin-bottom:4px;">Light</strong>
          <span style="font-size:14px;color:#666;">Bright indirect light. Near a north or east-facing window is ideal. Avoid direct afternoon sun.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">🌡️</td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid #f0f0f0;">
          <strong style="display:block;margin-bottom:4px;">Temperature</strong>
          <span style="font-size:14px;color:#666;">Thrives between 16–24°C. Keep away from drafts, cold windows, and direct radiator heat.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;vertical-align:top;">🪴</td>
        <td style="padding:12px 0 12px 12px;">
          <strong style="display:block;margin-bottom:4px;">Repotting</strong>
          <span style="font-size:14px;color:#666;">Repot in spring if roots start coming out of drainage holes. Go up one pot size only.</span>
        </td>
      </tr>
    </table>

    <br>
    <a href="https://novabloom.pt/care-guides" class="cta">View full care library</a>
    <hr class="divider">
    <p style="font-size:13px;color:#888;">Any concerns about your plants? Just reply — our plant specialists are happy to help.</p>`;

  return { subject, html: layout("Your personalised plant care guide inside", body) };
}

// ─── Email 3: Review request ──────────────────────────────────────────────────

function reviewRequest(ctx) {
  const subject = `How are your plants doing? We'd love your feedback`;

  const body = `
    <h1>Your plants have been home for a week — how are they?</h1>
    <p>Hi ${ctx.customerFirstName}, we hope your new plants are already brightening up your space!</p>
    <p>Your honest review helps other plant lovers find the right plants. It only takes 30 seconds:</p>

    <div style="background:#f9f9f7;border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:600;color:#1a1a1a;">How would you rate your order?</p>
      <div style="font-size:28px;letter-spacing:4px;margin:8px 0;">⭐⭐⭐⭐⭐</div>
      <a href="https://novabloom.pt/reviews/new?order=${ctx.orderNumber}" class="cta" style="margin-top:16px;">Leave a review</a>
    </div>

    <hr class="divider">
    <p style="font-size:13px;color:#888;">Not happy with something? Reply to this email and we'll make it right — no questions asked.</p>`;

  return { subject, html: layout("We'd love to hear how your plants are doing", body) };
}

// ─── Email 4: Upsell offer ────────────────────────────────────────────────────

function upsellOffer(ctx) {
  const subject = `Plants that pair perfectly with your ${ctx.primaryProduct}`;

  const body = `
    <h1>Complete your collection, ${ctx.customerFirstName}</h1>
    <p>Your ${ctx.primaryProduct} should be thriving — why not give it some company? Here are plants that pair beautifully together:</p>

    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:48%;padding:16px;background:#f5f5f0;border-radius:10px;vertical-align:top;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🌿</div>
          <strong style="display:block;font-size:14px;">Pilea Peperomioides</strong>
          <span style="font-size:13px;color:#888;">The "money plant" — air-purifying and fast-growing</span><br>
          <strong style="display:block;margin-top:8px;color:#1D9E75;">€12.90</strong>
        </td>
        <td style="width:4%"></td>
        <td style="width:48%;padding:16px;background:#f5f5f0;border-radius:10px;vertical-align:top;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🪴</div>
          <strong style="display:block;font-size:14px;">Pothos Golden</strong>
          <span style="font-size:13px;color:#888;">Trailing, low-maintenance, great for shelves</span><br>
          <strong style="display:block;margin-top:8px;color:#1D9E75;">€9.50</strong>
        </td>
      </tr>
    </table>

    <br>
    <a href="https://novabloom.pt/shop?ref=postpurchase" class="cta">Shop the collection</a>

    <hr class="divider">
    <div style="background:#f0faf6;border-radius:8px;padding:16px;text-align:center;">
      <strong style="font-size:15px;color:#1D9E75;">Use code BLOOM15</strong>
      <p style="font-size:13px;color:#555;margin:6px 0 0;">15% off your next order · Valid for 7 days</p>
    </div>`;

  return { subject, html: layout(`${ctx.customerFirstName}, here's 15% off your next order`, body) };
}

module.exports = { renderTemplate };
