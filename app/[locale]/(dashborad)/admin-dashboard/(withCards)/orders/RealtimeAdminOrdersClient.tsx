"use client";

import {
  AlertCircle,
  BarChart3,
  Clock,
  RefreshCw,
  Radio,
  ShoppingBag,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type {
  AdminOrderItem,
  AdminOrdersPagePayload,
  AdminOrderStatus,
} from "@/app/schemas/admin-dashboard-schema";
import { StatusBadge } from "@/components/status-badge";
import { SectionCards, type CardData } from "@/components/section-cards";
import type { SortMode } from "@/components/custom-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminOrdersQuery } from "@/lib/query/admin-defaults";
import { markAdminMutationSync } from "@/lib/query/admin-invalidation";
import { useAdminOrders } from "@/lib/query/hooks/use-admin-orders";
import { queryKeys } from "@/lib/query/query-keys";
import { useDebouncedValue } from "@/lib/query/use-debounced-value";

import AdminOrdersAnalyticsPanel, {
  AdminOrdersAnalyticsMetrics,
} from "./AdminOrdersAnalytics";
import AdminOrdersTable from "./AdminOrdersTable";

type StatusFilter = AdminOrderStatus | "all";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildCards(payload: AdminOrdersPagePayload): CardData[] {
  const activeOrders =
    payload.stats.processingOrders + payload.stats.inProgressOrders;

  return [
    {
      title: "Total Orders",
      value: payload.stats.totalOrders,
      description: "All customer orders",
      icon: "shopping-cart",
      color: "var(--primary)",
    },
    {
      title: "Pending Orders",
      value: payload.stats.pendingOrders,
      description: "Awaiting review",
      icon: "clock",
      color: "var(--warning)",
    },
    {
      title: "Active Orders",
      value: activeOrders,
      description: "Processing or in progress",
      icon: "package",
      color: "var(--violet)",
    },
    {
      title: "Completed Orders",
      value: payload.stats.completedOrders,
      description: "Delivered successfully",
      icon: "check-circle",
      color: "var(--success)",
    },
    {
      title: "Cancelled Orders",
      value: payload.stats.cancelledOrders,
      description: "Stopped or rejected",
      icon: "x-circle",
      color: "var(--destructive)",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(payload.stats.totalRevenue),
      description: "Completed order revenue",
      icon: "currency-dollar",
      color: "var(--info)",
    },
  ];
}

function formatDate(value: Date | string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-PK", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getActionPriority(order: AdminOrderItem) {
  if (order.status === "pending") {
    return 0;
  }

  if (
    order.deliveryDate &&
    order.status !== "completed" &&
    order.status !== "cancelled" &&
    new Date(order.deliveryDate).getTime() < Date.now()
  ) {
    return 1;
  }

  if (order.status === "processing") {
    return 2;
  }

  return 3;
}

function OrdersNeedingActionPanel({ orders }: { orders: AdminOrderItem[] }) {
  const actionOrders = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            order.status === "pending" ||
            order.status === "processing" ||
            order.status === "in_progress" ||
            (order.deliveryDate &&
              order.status !== "completed" &&
              order.status !== "cancelled" &&
              new Date(order.deliveryDate).getTime() < Date.now())
        )
        .sort((a, b) => getActionPriority(a) - getActionPriority(b))
        .slice(0, 6),
    [orders]
  );

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)] dark:shadow-[var(--shadow-lg)]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning-text dark:text-warning-soft-foreground">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Orders Needing Action
          </h2>
          <p className="text-sm text-muted-foreground">
            Pending, active, and overdue work
          </p>
        </div>
        </div>
        <span className="w-fit rounded-badge bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning-text dark:text-warning-soft-foreground">
          {actionOrders.length} open
        </span>
      </div>

      {actionOrders.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {actionOrders.map((order) => {
            const isOverdue =
              order.deliveryDate &&
              order.status !== "completed" &&
              order.status !== "cancelled" &&
              new Date(order.deliveryDate).getTime() < Date.now();

            return (
              <div
                key={order.id}
                className="rounded-lg border border-border bg-surface-2/60 p-3.5 dark:border-[var(--input)] dark:bg-[var(--surface-3)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-primary-text dark:text-primary-soft-foreground">
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-foreground dark:text-neutral-100">
                      {order.product}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Delivery {formatDate(order.deliveryDate)}
                  </span>
                  {isOverdue && (
                    <span className="rounded-md bg-destructive/10 px-2 py-1 font-semibold text-destructive-text dark:text-destructive-soft-foreground">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-32 flex-col items-center justify-center text-center text-muted-foreground">
          <AlertCircle className="h-9 w-9 opacity-70" />
          <p className="mt-3 text-sm font-medium">No orders need action</p>
        </div>
      )}
    </section>
  );
}

export default function RealtimeAdminOrdersClient({
  adminId,
}: {
  adminId: string;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const debouncedSearch = useDebouncedValue(search, 300);

  const sortDirection: "asc" | "desc" =
    sortMode === "za" || sortMode === "latest" ? "desc" : "asc";

  const filters = useMemo<AdminOrdersQuery>(
    () => ({
      page,
      pageSize,
      status: statusFilter,
      search: debouncedSearch,
      sortKey: sortKey ?? "createdAt",
      sortDirection,
    }),
    [page, pageSize, statusFilter, debouncedSearch, sortKey, sortDirection]
  );

  const ordersQuery = useAdminOrders(adminId, filters);
  const payload = ordersQuery.data;
  const isPending = ordersQuery.isFetching;
  const error = ordersQuery.isError
    ? "Unable to refresh orders. Please try again."
    : null;

  const refreshOrders = useCallback(() => {
    // Refetch now; the Supabase echo for this write is ignored for a moment so
    // the same change is not fetched twice.
    markAdminMutationSync(adminId, "Order");
    // Invalidate every cached filter/page variant, not just the active one:
    // the server retired them all when it bumped the orders version counter.
    void queryClient.invalidateQueries({
      queryKey: queryKeys.admin.ordersRoot(adminId),
    });
  }, [queryClient, adminId]);

  // The server clamps an out-of-range page and reports it in `pagination`, which
  // the table renders. Do not copy it back into `page` state: that changes the
  // query key and fetches the same, already-clamped page a second time.

  const cards = useMemo(() => (payload ? buildCards(payload) : []), [payload]);

  if (!payload) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {error ?? "Loading orders…"}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] overflow-x-hidden px-4 pb-8 md:px-6 dark:text-[var(--foreground)]">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="text-left">
          
          <h1 className="text-2xl font-semibold text-foreground dark:text-neutral-100">
            Orders Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review quotes, edit specifications, set delivery dates, and control
            each order from pending through completion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px] border-border bg-card dark:border-[var(--input)] dark:bg-[var(--surface-4)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            onClick={refreshOrders}
            disabled={isPending}
            className="h-9"
          >
            <RefreshCw
              className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive-border bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive-text dark:border-destructive/20 dark:bg-destructive/10 dark:text-destructive-soft-foreground">
          {error}
        </div>
      )}

      <div className="grid auto-rows-fr grid-cols-1 gap-4 pb-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs">
        <SectionCards
          cards={cards}
          cardClassName="dark:!border-[var(--border)] dark:!bg-[var(--surface-2)] dark:text-[var(--foreground)] dark:shadow-[var(--shadow-lg)]"
        />
      </div>

      <div className="mb-6">
        <AdminOrdersAnalyticsMetrics analytics={payload.analytics} />
      </div>

      <section className="mb-6 min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card shadow-[var(--shadow-md)] dark:border-[var(--border)] dark:bg-[var(--surface-2)] dark:shadow-[var(--shadow-lg)]">
          <div className="flex flex-col gap-4 border-b border-border-subtle px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text ring-1 ring-primary/10 dark:bg-primary/15 dark:text-primary-soft-foreground dark:ring-primary/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-foreground dark:text-[var(--foreground)]">
                  Orders
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Showing {payload.orders.length} of{" "}
                  {payload.pagination.total} orders
                </p>
              </div>
            </div>
            {isPending && (
              <span className="w-fit rounded-badge bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
                Syncing orders...
              </span>
            )}
          </div>

          {payload.orders.length ? (
            <AdminOrdersTable
              orders={payload.orders}
              onStatusChanged={refreshOrders}
              serverState={{
                page: payload.pagination.page,
                pageSize: payload.pagination.pageSize,
                total: payload.pagination.total,
                onPageChange: setPage,
                onPageSizeChange: (size) => {
                  setPageSize(size);
                  setPage(1);
                },
                search,
                onSearchChange: (value) => {
                  setSearch(value);
                  setPage(1);
                },
                sortKey,
                sortMode,
                onSortKeyChange: (key) => {
                  setSortKey(key);
                  setPage(1);
                },
                onSortModeChange: (mode) => {
                  setSortMode(mode);
                  setPage(1);
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <BarChart3 className="h-10 w-10 opacity-70" />
              No orders available
            </div>
          )}
      </section>

      <div className="mb-6">
        <OrdersNeedingActionPanel orders={payload.ordersNeedingAction} />
      </div>

      <AdminOrdersAnalyticsPanel
        analytics={payload.analytics}
        showMetrics={false}
      />
    </div>
  );
}
