import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateConversation } from "@/app/actions/user-message";
import { GetDBUser } from "@/app/actions/user_action";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" });
 await getOrCreateConversation();
 const dbUser = await GetDBUser();
  const conversation = await prisma.conversation.findUnique({
    where: { userId: dbUser?.id },
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
          not: dbUser?.id, // messages NOT sent by current user
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