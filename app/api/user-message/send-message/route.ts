import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateConversation } from "@/app/actions/user-message";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    // ✅ Always get or create conversation
    const conversation = await getOrCreateConversation(clerkUser.id);

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: clerkUser.id,
        text: text.trim(),
      },
    });

    return NextResponse.json(message);

  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}