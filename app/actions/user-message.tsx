import { prisma } from "@/lib/prisma";
import { invalidateAdminMessageCaches } from "@/lib/cache/invalidate";
import { GetDBUser } from "./user_action";

const conversationSelect = {
  id: true,
  messages: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      text: true,
      senderId: true,
      receiverId: true,
      seen: true,
      createdAt: true,
    },
  },
} as const;

export async function getOrCreateConversation() {
  const dbUser = await GetDBUser();
  if (!dbUser) {
    return null;
  }

  let conversation = await prisma.conversation.findUnique({
    where: { userId: dbUser.id },
    select: conversationSelect,
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId: dbUser.id,
        adminId: process.env.ADMIN_ID!,
      },
      select: conversationSelect,
    });
    await invalidateAdminMessageCaches();
  }

  return conversation;
}