import { Resend } from "resend";

import { escapeHtml } from "@/lib/escape-html";

/** Transactional order emails respect the user's general email preference. */
export async function sendOrderEmail({
  enabled,
  to,
  subject,
  message,
}: {
  enabled: boolean;
  to: string;
  subject: string;
  message: string;
}) {
  if (!enabled || !process.env.RESEND_API_KEY) return;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "NF Printers <onboarding@resend.dev>",
      to: [to],
      subject,
      html: `<div style="font-family:Arial,sans-serif;color:#14213d"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(message)}</p><p>NF Printers</p></div>`,
      text: `${message}\n\nNF Printers`,
    });
    if (result.error) console.error("Order email delivery failed:", result.error);
  } catch (error) {
    // Email delivery should not roll back an order or status update.
    console.error("Order email delivery failed:", error);
  }
}
