"use client";

import type { QueryClient } from "@tanstack/react-query";

import { designsQueryOptions } from "@/lib/query/hooks/use-designs";
import {
  ordersQueryOptions,
  reorderQueryOptions,
  userOrdersPageQueryOptions,
} from "@/lib/query/hooks/use-orders";
import { profileQueryOptions } from "@/lib/query/hooks/use-user";

function toDashboardPath(href: string) {
  const index = href.indexOf("/user-dashboard");
  if (index < 0) return null;

  const path = href.slice(index).split("?")[0].replace(/\/$/, "");
  return path || "/user-dashboard";
}

/**
 * Prefetches the API data a user-dashboard route needs. Route prefetching is
 * still handled by next/link; this only warms the TanStack Query cache.
 */
export function prefetchUserDashboardRoute(
  queryClient: QueryClient,
  userId: string,
  href: string
) {
  if (!userId) return Promise.resolve();

  const path = toDashboardPath(href);
  if (!path) return Promise.resolve();

  switch (path) {
    case "/user-dashboard":
      return queryClient.prefetchQuery(ordersQueryOptions(userId));
    case "/user-dashboard/orders":
      return Promise.all([
        queryClient.prefetchQuery(ordersQueryOptions(userId)),
        queryClient.prefetchQuery(
          userOrdersPageQueryOptions(userId, {
            page: 1,
            pageSize: 10,
            status: "all",
            search: "",
            sortMode: "latest",
          })
        ),
      ]);
    case "/user-dashboard/new-order":
    case "/user-dashboard/my-designs":
      return queryClient.prefetchQuery(designsQueryOptions(userId));
    case "/user-dashboard/reorder":
      return queryClient.prefetchQuery(reorderQueryOptions(userId));
    case "/user-dashboard/settings":
      return queryClient.prefetchQuery(profileQueryOptions(userId));
    case "/user-dashboard/user-inbox":
      // Fetching messages marks them as seen, so hovers must not prefetch them.
      return Promise.resolve();
    default:
      return Promise.resolve();
  }
}
