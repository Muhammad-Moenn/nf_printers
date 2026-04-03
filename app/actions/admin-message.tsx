"use server";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "./user_action";

export async function getAllConversations() {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") return null;

  const conversations = await prisma.conversation.findMany({
    include: {
      user: true,
      admin: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // latest message preview
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: dbUser.id }, // not sent by admin
              seen: false,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return conversations;
}


