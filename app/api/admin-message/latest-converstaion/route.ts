// app/api/admin/conversations/latest/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "@/app/actions/user_action";

export async function GET() {
  // Get the logged-in user
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch the latest conversation based on updatedAt
    const latestConversation = await prisma.conversation.findFirst({
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        user: true,
        admin: true,
        _count: {
          select: {
            messages: {
              where: { seen: false },
            },
          },
        },
      },
    });

    if (!latestConversation) {
      return NextResponse.json({ error: "No conversations found" }, { status: 404 });
    }

    return NextResponse.json(latestConversation);
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}