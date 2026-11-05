import { NextResponse } from "next/server";
import { GetDBUser } from "@/app/actions/user_action";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { conversationId } = await params;
  const messages = await prisma.message.findMany({
    where: { conversationId, senderId: dbUser.id },
    select: { id: true, seen: true },
  });

  return NextResponse.json(messages, {
    headers: { "Cache-Control": "no-store" },
  });
}
