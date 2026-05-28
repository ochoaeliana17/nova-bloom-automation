const mailchimp = require("@mailchimp/mailchimp_transactional");

const client = mailchimp(process.env.MANDRILL_API_KEY);

async function sendEmail({ to, subject, html }) {
  const response = await client.messages.send({
    message: {
      html,
      subject,
      from_email: process.env.FROM_EMAIL || "hello@novabloom.pt",
      from_name: "Nova Bloom",
      to: [{ email: to, type: "to" }],
      track_opens: true,
      track_clicks: true,
      tags: ["post-purchase", "automated"],
    },
  });

  const result = response[0];

  if (result.status === "rejected" || result.status === "invalid") {
    throw new Error(`Email rejected: ${result.reject_reason || result.status}`);
  }

  return result;
}

module.exports = { sendEmail };
