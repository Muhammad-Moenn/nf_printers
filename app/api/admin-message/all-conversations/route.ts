// app/api/admin/conversations/route.ts
import { NextResponse } from "next/server";
import { getAllConversations } from "@/app/actions/admin-message";

export async function GET() {
  const conversations = await getAllConversations();

  return NextResponse.json(conversations);
}