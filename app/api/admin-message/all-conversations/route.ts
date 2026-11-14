// app/api/admin/conversations/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllConversations } from "@/app/actions/admin-message";
import { GetDBUser } from "@/app/actions/user_action";
import { decodeDateIdCursor } from "@/lib/pagination-cursor";

const conversationsQuerySchema = z.object({
  cursor: z.string().trim().min(1).max(200).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const dbUser = await GetDBUser();
  if (!dbUser) {
    return jsonError("Unauthorized", 401);
  }
  if (dbUser.role !== "ADMIN") {
    return jsonError("Forbidden", 403);
  }

  const url = new URL(request.url);
  const parsed = conversationsQuerySchema.safeParse({
    cursor: url.searchParams.get("cursor") ?? undefined,
    take: url.searchParams.get("take") ?? undefined,
  });
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
  }
  if (parsed.data.cursor && !decodeDateIdCursor(parsed.data.cursor)) {
    return jsonError("Invalid cursor", 400);
  }

  try {
    const page = await getAllConversations({
      cursor: parsed.data.cursor ?? null,
      take: parsed.data.take,
    });

    // getAllConversations also enforces the admin role; treat a null result as
    // an authorization failure rather than returning a misleading 200 payload.
    if (!page) {
      return jsonError("Forbidden", 403);
    }

    return NextResponse.json(page, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Fetch all conversations failed:", error);
    return jsonError("Internal Server Error", 500);
  }
}
