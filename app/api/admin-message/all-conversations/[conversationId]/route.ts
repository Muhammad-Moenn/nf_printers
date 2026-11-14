// app/api/admin/conversations/[conversationId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { invalidateAdminMessageCaches } from "@/lib/cache/invalidate";
import {
  decodeDateIdCursor,
  encodeDateIdCursor,
} from "@/lib/pagination-cursor";
import { GetDBUser } from "@/app/actions/user_action";

const DEFAULT_MESSAGE_PAGE_SIZE = 50;
const MAX_MESSAGE_PAGE_SIZE = 100;

const messagesQuerySchema = z.object({
  cursor: z.string().trim().min(1).max(200).optional(),
  take: z.coerce.number().int().min(1).max(MAX_MESSAGE_PAGE_SIZE).optional(),
});

const messageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  receiverId: true,
  text: true,
  seen: true,
  createdAt: true,
} as const;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return jsonError("Forbidden", 403);
  }

  const { conversationId } = await params;
  if (!conversationId) {
    return jsonError("Missing conversation ID", 400);
  }

  const url = new URL(request.url);
  const parsed = messagesQuerySchema.safeParse({
    cursor: url.searchParams.get("cursor") ?? undefined,
    take: url.searchParams.get("take") ?? undefined,
  });
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
  }

  const take = parsed.data.take ?? DEFAULT_MESSAGE_PAGE_SIZE;
  const cursor = parsed.data.cursor
    ? decodeDateIdCursor(parsed.data.cursor)
    : null;
  if (parsed.data.cursor && !cursor) {
    return jsonError("Invalid cursor", 400);
  }

  const cursorFilter = cursor
    ? {
        OR: [
          { createdAt: { lt: cursor.date } },
          { createdAt: cursor.date, id: { lt: cursor.id } },
        ],
      }
    : undefined;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        messages: {
          where: cursorFilter,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: take + 1,
          select: messageSelect,
        },
      },
    });

    if (!conversation) {
      return jsonError("Conversation not found", 404);
    }

    const rows = conversation.messages;
    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    const oldest = page[page.length - 1];

    return NextResponse.json(
      {
        id: conversation.id,
        messages: page.slice().reverse(),
        hasMore,
        nextCursor:
          hasMore && oldest
            ? encodeDateIdCursor(oldest.createdAt, oldest.id)
            : null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Prisma error:", error);
    return jsonError("Internal Server Error", 500);
  }
}

export async function DELETE(
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

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.message.deleteMany({ where: { conversationId } }),
    prisma.conversation.delete({ where: { id: conversationId } }),
  ]);

  await invalidateAdminMessageCaches();

  return NextResponse.json({ success: true, conversationId });
}
