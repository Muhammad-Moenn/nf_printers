import { cache } from "react";
import {
  fetchCardsDataAndAllOrders,
  fetchCurrentMonthOrders,
} from "@/app/actions/order-action";

// Share dashboard queries between the nested layout and page during one render.
export const getDashboardCardsData = cache(fetchCardsDataAndAllOrders);
export const getDashboardMonthData = cache(fetchCurrentMonthOrders);
