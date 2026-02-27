import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { userId: clerkUser.id },
    });

    if (!conversation) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: {
          not: clerkUser.id,
        },
        seen: false,
      },
    });

    return NextResponse.json({ count });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}