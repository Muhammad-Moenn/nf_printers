// Mark all messages not sent by admin as seen
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateAdminMessageCaches } from "@/lib/cache/invalidate";
import { GetDBUser } from "@/app/actions/user_action";

interface Params {
  params: Promise<{ conversationId: string }>;
}

export async function POST(req: Request, { params }: Params) {
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

  const { conversationId } = await params;
  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversation ID" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    const updated = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: dbUser.id },
        seen: false,
      },
      data: {
        seen: true,
        updatedAt: new Date(), // ensures Realtime sees a row-level change
      },
    });

    await invalidateAdminMessageCaches();

    return NextResponse.json(
      { updatedCount: updated.count },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Mark conversation seen failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
