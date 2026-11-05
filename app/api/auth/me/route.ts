import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return NextResponse.json({ user: null }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
