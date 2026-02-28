// app/api/admin/conversations/[conversationId]/send/route.ts
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
  const { text } = await req.json();

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: dbUser.id,
      text,
    },
  });

  return NextResponse.json(message);
}