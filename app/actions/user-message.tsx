import { prisma } from "@/lib/prisma";
import { GetDBUser } from "./user_action";

export async function getOrCreateConversation() {
  const dbUser = await GetDBUser();
  if (!dbUser) {
    return null;
  }

  let conversation = await prisma.conversation.findUnique({
    where: { userId: dbUser.id },
    include: {
      user: true,
      admin: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId: dbUser.id,
        adminId: process.env.ADMIN_ID!,
      },
      include: {               // ✅ ADD THIS
        user: true,
        admin: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  return conversation;
}