import { NextResponse, type NextRequest } from "next/server";

import { GetDBUser } from "@/app/actions/user_action";
import {
  loadUserOrdersPage,
  userOrdersPageQuerySchema,
} from "@/lib/data/user-orders-page.server";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const dbUser = await GetDBUser();
  if (!dbUser) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: NO_STORE }
    );
  }

  const parsed = userOrdersPageQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query" },
      { status: 400, headers: NO_STORE }
    );
  }

  try {
    const result = await loadUserOrdersPage(dbUser.id, parsed.data);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error) {
    console.error("User orders page failed:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: NO_STORE }
    );
  }
}
