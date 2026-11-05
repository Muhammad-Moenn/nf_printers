import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateConversation } from "@/app/actions/user-message";
import { GetDBUser } from "@/app/actions/user_action";

export async function GET() {
//  await getOrCreateConversation();

 const dbUser = await GetDBUser();
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const conversation = await prisma.conversation.findUnique({
    where: { userId: dbUser.id },
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
        senderId: { not: dbUser.id },
        seen: false,
      },
      data: {
        seen: true,
        updatedAt: new Date(),

      },
    });
  }
  const messages = conversation?.messages.map((message) => ({
    ...message,
    // The update above marks all incoming messages read. Reflect that in the
    // response immediately instead of waiting for the next poll/realtime event.
    seen: message.senderId === dbUser.id ? message.seen : true,
  })) || [];
  return NextResponse.json(messages, {
    headers: { "Cache-Control": "no-store" },
  });
}
