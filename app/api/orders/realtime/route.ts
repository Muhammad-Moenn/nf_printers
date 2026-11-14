import { NextResponse } from "next/server";
import { GetDBUser } from "@/app/actions/user_action";
import { getUserDashboardSummary } from "@/lib/user-dashboard-summary";

export async function GET() {
  const user = await GetDBUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Realtime invalidation must not be served from the 20s cache.
  const data = await getUserDashboardSummary(user.id, { fresh: true });

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
