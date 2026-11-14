import {
  approveEstimatedPriceAction,
  getAdminDashboardActivityAction,
  getAdminDashboardData as getAdminDashboardDataAction,
  getAdminOrdersPageData as getAdminOrdersPageDataAction,
  getAdminRevenueAnalyticsAction,
  getAdminRevenueManagementData as getAdminRevenueManagementDataAction,
  getAdminStatsCardsAction,
  overrideEstimatedPriceAction,
  updateAdminOrderAction as updateAdminOrderActionImport,
  updateAdminOrderStatusAction as updateAdminOrderStatusActionImport,
} from "@/app/actions/admin-dashboard-action";

export async function getAdminDashboardData() {
  return getAdminDashboardDataAction();
}

export async function getAdminOrdersPageData(input?: unknown) {
  return getAdminOrdersPageDataAction(input);
}

export async function getAdminRevenueManagementData(input: unknown) {
  return getAdminRevenueManagementDataAction(input);
}

export async function getAdminStatsCards() {
  return getAdminStatsCardsAction();
}

export async function getAdminRevenueAnalytics() {
  return getAdminRevenueAnalyticsAction();
}

export async function getAdminDashboardActivity() {
  return getAdminDashboardActivityAction();
}

export async function updateAdminOrderStatus(
  ...args: Parameters<typeof updateAdminOrderStatusActionImport>
) {
  return updateAdminOrderStatusActionImport(...args);
}

export async function updateAdminOrder(
  ...args: Parameters<typeof updateAdminOrderActionImport>
) {
  return updateAdminOrderActionImport(...args);
}

export async function approveEstimatedPrice(
  ...args: Parameters<typeof approveEstimatedPriceAction>
) {
  return approveEstimatedPriceAction(...args);
}

export async function overrideEstimatedPrice(
  ...args: Parameters<typeof overrideEstimatedPriceAction>
) {
  return overrideEstimatedPriceAction(...args);
}
