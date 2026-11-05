import { NextResponse } from "next/server";

import { GetDBUser } from "@/app/actions/user_action";
import { predictPrice } from "@/lib/pricing/pricing-client";
import { pricingRequestSchema } from "@/lib/pricing/types";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT = { limit: 120, windowMs: 60 * 1000 };

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

export async function POST(req: Request) {
  const dbUser = await GetDBUser();
  if (!dbUser) {
    return jsonError("Unauthorized", 401);
  }

  const limit = rateLimit(`pricing:${dbUser.id}`, RATE_LIMIT);
  if (!limit.success) {
    return jsonError("Too many pricing requests. Please slow down.", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return jsonError("Request is too large", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = pricingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "Invalid pricing request",
      400,
    );
  }

  try {
    const result = await predictPrice(parsed.data);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      `Pricing request failed for user ${dbUser.id} from ${getClientIp(req)}:`,
      error,
    );
    return jsonError("Unable to calculate a price right now", 502);
  }
}
