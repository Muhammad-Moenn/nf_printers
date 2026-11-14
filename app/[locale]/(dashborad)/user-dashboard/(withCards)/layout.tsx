import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getDashboardCardsData } from "@/lib/dashboard-data";
import { makeQueryClient } from "@/lib/query/query-client";
import { queryKeys } from "@/lib/query/query-keys";
import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";
import RealtimeReordersClient from "./RealtimeSectionCardClient";

export default async function DesignDashboardLayoutWithCards({
  children,
}: {
  children: ReactNode;
}) {
  const data = await getDashboardCardsData();

  // Fetch once per (withCards) entry, then share it with every child page
  // through the same TanStack Query cache key the client hooks use.
  const queryClient = makeQueryClient();
  if (data.userId) {
    queryClient.setQueryData(queryKeys.user.ordersRoot(data.userId), data);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-3">
        <RealtimeReordersClient userId={data.userId} />
        <div className="">{children}</div>
      </div>
    </HydrationBoundary>
  );
}
