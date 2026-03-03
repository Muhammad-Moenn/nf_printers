import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { GetDBUser } from "@/app/actions/user_action";

export async function GET() {
  try {
    // const clerkUser = await currentUser();
    // if (!clerkUser) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const dbUser= await GetDBUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized, this is not exist in db" }, { status: 401 });
    }
    const conversation = await prisma.conversation.findUnique({
      where: { userId: dbUser.id },
    });

    if (!conversation) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: {
          not: dbUser.id,
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