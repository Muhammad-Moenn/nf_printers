import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";

import { removeUserFromClerk, syncUserFromClerk } from "@/lib/auth";
import { cacheKeys } from "@/lib/cache/keys";
import { cacheDelete } from "@/lib/cache/store";
import {
  invalidateAdminCustomerCaches,
  invalidateAdminUserCaches,
} from "@/lib/cache/invalidate";

export const runtime = "nodejs";

function getPrimaryEmail(data: {
  primary_email_address_id: string | null;
  email_addresses: {
    id: string;
    email_address: string;
    verification?: { status?: string | null } | null;
  }[];
}) {
  const primary =
    data.email_addresses.find(
      (email) => email.id === data.primary_email_address_id,
    ) ?? data.email_addresses[0];
  if (!primary) return null;
  return {
    email: primary.email_address,
    verified: primary.verification?.status === "verified",
  };
}

export async function POST(request: NextRequest) {
  let event;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      const email = getPrimaryEmail(event.data);
      if (!email) {
        console.warn("Clerk webhook skipped a user without an email address:", event.data.id);
        return NextResponse.json({ received: true });
      }

      await syncUserFromClerk({
        id: event.data.id,
        email: email.email,
        emailVerified: email.verified,
        firstName: event.data.first_name,
        lastName: event.data.last_name,
        avatarUrl: event.data.image_url,
      });
      if (event.type === "user.updated") {
        // Name/email changes appear in cached admin order rows.
        await Promise.all([
          invalidateAdminCustomerCaches(),
          cacheDelete(cacheKeys.user.profile(event.data.id)),
        ]);
      } else {
        await invalidateAdminUserCaches();
      }
    } else if (event.type === "user.deleted") {
      if (event.data.id) {
        await removeUserFromClerk(event.data.id);
        await Promise.all([
          invalidateAdminUserCaches(),
          cacheDelete(cacheKeys.user.profile(event.data.id)),
        ]);
      }
    }
  } catch (error) {
    console.error(`Clerk webhook ${event.type} failed:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
