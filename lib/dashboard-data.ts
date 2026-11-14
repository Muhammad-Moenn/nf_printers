import { cache } from "react";

import { getCurrentUser } from "@/lib/auth";
import {
  emptyDashboardSummary,
  getUserDashboardSummary,
} from "@/lib/user-dashboard-summary";

// Share the dashboard summary between the nested layout and page during one render.
export const getDashboardCardsData = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return emptyDashboardSummary();
  return getUserDashboardSummary(user.id);
});
