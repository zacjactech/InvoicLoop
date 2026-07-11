/**
 * Tiny mailer adapter.
 *
 * In dev, we just log the message. Production should swap this for a real
 * provider (Resend, Postmark, SES) by exporting the same `sendEmail` shape.
 */

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  console.info("[mail] (dev) outbound", {
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
  });
}
