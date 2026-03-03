// app/api/admin/conversations/latest-message/[conversationId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "@/app/actions/user_action";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { conversationId } = await params;

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });
  }

  try {
    // Fetch only the latest message for the conversation
    const latestMessage = await prisma.message.findFirst({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
    });

    if (!latestMessage) {
      return NextResponse.json({ error: "No messages found" }, { status: 404 });
    }

    return NextResponse.json(latestMessage);
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}