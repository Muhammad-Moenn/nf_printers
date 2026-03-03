// Mark all messages not sent by admin as seen
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

  const updated = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: dbUser.id },
      seen: false,
    },
    data: {
    seen: true,
    updatedAt: new Date(),  // ensures Realtime sees a row-level change
  },
  });

  return NextResponse.json({ updatedCount: updated.count });
}