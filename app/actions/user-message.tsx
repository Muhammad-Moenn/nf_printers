

import { prisma } from "@/lib/prisma";

export async function getOrCreateConversation(userId: string) {
  let conversation = await prisma.conversation.findUnique({
    where: { userId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId,
        adminId: process.env.ADMIN_ID!, // store admin db id in env
      },
    });
  }

  return conversation;
}