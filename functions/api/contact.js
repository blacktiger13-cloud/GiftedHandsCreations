// Cloudflare Pages Function — handles POST /api/contact from the site's
// contact form (src/_includes/partials/contact-form.njk) and sends the
// submission as an email via Resend (https://resend.com).
//
// Required Cloudflare Pages environment variable (set as a secret in the
// dashboard under Settings -> Environment variables):
//   RESEND_API_KEY      - API key from your Resend account
// Optional environment variables:
//   CONTACT_TO_EMAIL    - where submissions are delivered (defaults below)
//   CONTACT_FROM_EMAIL  - verified sender address/name (defaults below)
//
// See README.md "Contact form" section for full setup steps.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return new Response("Bad request", { status: 400 });
  }

  // Honeypot field (see contact-form.njk): hidden from real visitors via
  // CSS, but most bots fill in every field they find. If it's filled,
  // pretend to succeed so the bot doesn't learn to avoid this field.
  if (formData.get("website")) {
    return Response.redirect(new URL("/thank-you/", request.url), 303);
  }

  const firstName = (formData.get("firstName") || "").toString().trim();
  const lastName = (formData.get("lastName") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  if (!firstName || !lastName || !email || !message || !EMAIL_PATTERN.test(email)) {
    return Response.redirect(new URL("/contact/?error=1", request.url), 303);
  }

  const toEmail = env.CONTACT_TO_EMAIL || "slenoah.jackson@gmail.com";
  const fromEmail = env.CONTACT_FROM_EMAIL || "Gifted Hands Creations Website <website@giftedhandscreations.com>";

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `New custom order inquiry from ${firstName} ${lastName}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
    }),
  });

  if (!resendResponse.ok) {
    return Response.redirect(new URL("/contact/?error=1", request.url), 303);
  }

  return Response.redirect(new URL("/thank-you/", request.url), 303);
}
