import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "@/app/actions/user_action";

export async function GET() {
  try {
    const dbUser = await GetDBUser();
    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    const count = await prisma.message.count({
      where: {
        senderId: {
          not: dbUser.id,
        },
        seen: false,
      },
    });

    return NextResponse.json(
      { count },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Admin unseen count failed:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
