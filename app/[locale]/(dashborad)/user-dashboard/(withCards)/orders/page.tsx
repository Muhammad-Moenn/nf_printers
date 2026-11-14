import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  DEFAULT_USER_ORDERS_QUERY,
  loadUserOrdersPage,
} from "@/lib/data/user-orders-page.server";
import { makeQueryClient } from "@/lib/query/query-client";
import { queryKeys } from "@/lib/query/query-keys";

import RealtimeOrdersClient from "./RealtimeOrdersClient";

export default async function OrderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Prime the table's first page so it renders without a client request.
  const queryClient = makeQueryClient();
  const filters = {
    page: DEFAULT_USER_ORDERS_QUERY.page,
    pageSize: DEFAULT_USER_ORDERS_QUERY.pageSize,
    status: DEFAULT_USER_ORDERS_QUERY.status,
    search: DEFAULT_USER_ORDERS_QUERY.search,
    sortKey: undefined,
    sortMode: DEFAULT_USER_ORDERS_QUERY.sortMode,
  };

  const ordersPage = await loadUserOrdersPage(user.id, DEFAULT_USER_ORDERS_QUERY);
  queryClient.setQueryData(queryKeys.user.orders(user.id, filters), ordersPage);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RealtimeOrdersClient userId={user.id} />
    </HydrationBoundary>
  );
}
