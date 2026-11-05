import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

import { escapeHtml } from "@/lib/escape-html";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const CONTACT_TO_EMAIL =
  process.env.CONTACT_TO_EMAIL ?? "nfprinter3610@gmail.com";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(150)
    .transform((value) => value.replace(/[\r\n]+/g, " ")),
  message: z.string().trim().min(1, "Message is required").max(5000),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(200).optional().default(""),
});

function badRequest(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`contact:${ip}`, RATE_LIMIT);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return badRequest("Request is too large", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return badRequest("Invalid request body");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Please check the form fields",
    );
  }

  const { name, email, subject, message, website } = parsed.data;

  // Silently accept honeypot submissions so bots do not learn the rule.
  if (website) {
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form failed: RESEND_API_KEY is not configured.");
    return badRequest("Unable to send your message right now", 500);
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "NF Printers Contact <onboarding@resend.dev>",
      to: [CONTACT_TO_EMAIL],
      replyTo: email,
      subject: `Contact form: ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#14213d;line-height:1.5">
          <h2 style="margin:0 0 16px">New contact message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;margin:0">${safeMessage}</p>
        </div>
      `,
      text: `New contact message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    });

    if (error) {
      console.error("Contact form delivery failed:", error);
      return badRequest("Unable to send your message right now", 500);
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return badRequest("Unable to send your message right now", 500);
  }
}
