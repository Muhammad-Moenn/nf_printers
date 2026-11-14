import { getAdminUsersDashboardDataAction } from "@/app/actions/admin-users-action";

export async function getAdminUsersDashboardData(input?: unknown) {
  return getAdminUsersDashboardDataAction(input);
}
