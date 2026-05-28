const fs = require("fs");
const path = require("path");
const { sendEmail } = require("./emailSender");
const { renderTemplate } = require("./emailTemplates");

const QUEUE_FILE = path.join(__dirname, "email_queue.json");

function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

async function scheduleEmail({ type, sendAt, context }) {
  const queue = loadQueue();

  // Prevent duplicates — one email of each type per order
  const exists = queue.find(
    (e) => e.type === type && e.context.orderId === context.orderId
  );
  if (exists) return;

  queue.push({
    id: `${context.orderId}-${type}`,
    type,
    sendAt,
    status: "pending",
    context,
    createdAt: Date.now(),
  });

  saveQueue(queue);
}

async function processDueEmails() {
  const queue = loadQueue();
  const now = Date.now();
  let updated = false;

  for (const job of queue) {
    if (job.status !== "pending" || job.sendAt > now) continue;

    const { subject, html } = renderTemplate(job.type, job.context);

    try {
      await sendEmail({
        to: job.context.customerEmail,
        subject,
        html,
      });
      job.status = "sent";
      job.sentAt = Date.now();
      console.log(`[${job.type}] Sent to ${job.context.customerEmail}`);
    } catch (err) {
      job.status = "failed";
      job.error = err.message;
      job.attempts = (job.attempts || 0) + 1;

      // Retry up to 3 times — reschedule 30 min later
      if (job.attempts < 3) {
        job.status = "pending";
        job.sendAt = Date.now() + 30 * 60 * 1000;
      }
      console.error(`[${job.type}] Failed for ${job.context.customerEmail}: ${err.message}`);
    }
    updated = true;
  }

  if (updated) saveQueue(queue);
}

module.exports = { scheduleEmail, processDueEmails };
