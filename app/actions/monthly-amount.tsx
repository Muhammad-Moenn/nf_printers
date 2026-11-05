import { GetDBUser } from "./user_action";
import { getCompletedRevenueByMonth } from "@/lib/db-aggregations";

export async function getMonthlyPaidAmount() {
  const dbUser = await GetDBUser();
  if (!dbUser) {
    // Return empty data instead of throwing to prevent infinite loops
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("en", { month: "short" }),
      total: 0,
    }));
  }

  const year = new Date().getFullYear();
  const monthlyTotals = await getCompletedRevenueByMonth(year, dbUser.id);

  return Array.from({ length: 12 }, (_, index) => ({
    month: new Date(0, index).toLocaleString("en", { month: "short" }),
    total: monthlyTotals.get(index + 1) ?? 0,
  }));
}