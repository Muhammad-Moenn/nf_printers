import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "@/app/actions/user_action";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const dbUser = await GetDBUser();
    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: NO_STORE }
      );
    }

    // One query: count unseen incoming messages through the user's conversation.
    const count = await prisma.message.count({
      where: {
        conversation: { userId: dbUser.id },
        senderId: { not: dbUser.id },
        seen: false,
      },
    });

    return NextResponse.json({ count }, { headers: NO_STORE });
  } catch (error) {
    console.error("Unseen message count failed:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: NO_STORE }
    );
  }
}
