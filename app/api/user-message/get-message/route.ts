import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateConversation } from "@/app/actions/user-message";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" });
//  await getOrCreateConversation(clerkUser.id);
  const conversation = await prisma.conversation.findUnique({
    where: { userId: clerkUser.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // ✅ Mark admin messages as seen
  if (conversation) {
    await prisma.message.updateMany({
      where: {
        conversationId: conversation?.id,
        senderId: {
          not: clerkUser.id, // messages NOT sent by current user
        },
        seen: false,
      },
      data: {
        seen: true,
      },
    });
  }
  return NextResponse.json(conversation?.messages || []);
}