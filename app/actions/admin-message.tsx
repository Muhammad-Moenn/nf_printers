"use server";
import {
  CACHE_TTL,
  adminConversationsPrefix,
  cacheKeys,
} from "@/lib/cache/keys";
import { getOrSetVersioned } from "@/lib/cache/store";
import {
  decodeDateIdCursor,
  encodeDateIdCursor,
} from "@/lib/pagination-cursor";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "./user_action";

const DEFAULT_CONVERSATIONS_PAGE_SIZE = 50;
const MAX_CONVERSATIONS_PAGE_SIZE = 100;

export async function getAllConversations(options?: {
  cursor?: string | null;
  take?: number;
}) {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") return null;

  const requestedTake =
    typeof options?.take === "number" && Number.isFinite(options.take)
      ? Math.trunc(options.take)
      : DEFAULT_CONVERSATIONS_PAGE_SIZE;
  const take = Math.min(
    Math.max(requestedTake, 1),
    MAX_CONVERSATIONS_PAGE_SIZE
  );
  const cursorParam =
    typeof options?.cursor === "string" ? options.cursor.trim() || null : null;
  const cursor = decodeDateIdCursor(cursorParam);
  const cursorFilter = cursor
    ? {
        OR: [
          { updatedAt: { lt: cursor.date } },
          { updatedAt: cursor.date, id: { lte: cursor.id } },
        ],
      }
    : undefined;

  // Unread counts are computed for the requesting admin, so the entry is keyed
  // per admin and retired through the shared message version counter.
  return getOrSetVersioned(
    cacheKeys.admin.messagesVersion,
    adminConversationsPrefix,
    `${dbUser.id}:${take}:${cursorParam ?? "first"}`,
    CACHE_TTL.adminMessages,
    async () => {
      const rows = await prisma.conversation.findMany({
        where: cursorFilter,
        take: take + 1,
        select: {
          id: true,
          userId: true,
          updatedAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              senderId: true,
              text: true,
              seen: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: dbUser.id },
                  seen: false,
                },
              },
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      });

      const hasMore = rows.length > take;
      const page = hasMore ? rows.slice(0, take) : rows;
      const oldest = page[page.length - 1];

      return {
        conversations: page,
        hasMore,
        nextCursor:
          hasMore && oldest
            ? encodeDateIdCursor(oldest.updatedAt, oldest.id)
            : null,
      };
    }
  );
}
