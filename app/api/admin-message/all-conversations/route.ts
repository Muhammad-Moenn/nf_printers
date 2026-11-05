// app/api/admin/conversations/route.ts
import { NextResponse } from "next/server";
import { getAllConversations } from "@/app/actions/admin-message";
import { GetDBUser } from "@/app/actions/user_action";

export async function GET() {
  const dbUser = await GetDBUser();
  if (!dbUser) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (dbUser.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const conversations = await getAllConversations();

    // getAllConversations also enforces the admin role; treat a null result as
    // an authorization failure rather than returning a misleading 200 payload.
    if (!conversations) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(conversations, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Fetch all conversations failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
