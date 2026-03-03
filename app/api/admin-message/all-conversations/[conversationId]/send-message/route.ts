// app/api/admin/conversations/[conversationId]/send/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "@/app/actions/user_action";

interface Params {
  params: Promise<{ conversationId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { conversationId } = await params;
  const { text } = await req.json();

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }
 const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // 2️⃣ Receiver is the customer (since admin is sender)
  const receiverId = conversation.userId;
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: dbUser.id,
      text,
      receiverId,
    },
  });

  return NextResponse.json(message);
}