"use client";

import { ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { getAdminUsersDashboardDataAction } from "@/app/actions/admin-users-action";
import UserCharts from "@/components/charts/admin-charts/users-page-charts";
import StatCard from "@/components/user-stat-cards";
import UsersTable, { type UserSortKey } from "@/components/user-table";
import { supabase } from "@/lib/supabaseClient";
import type { MockUser } from "@/data/mockUsers";

type AdminUsersPayload = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    newThisMonth: number;
    staffUsers: number;
  };
  users: MockUser[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  charts: {
    monthlySignups: { month: string; users: number }[];
    topSpenders: { name: string; spent: number }[];
  };
};

export default function RealtimeAdminUsersClient({
  initialData,
}: {
  initialData: AdminUsersPayload;
}) {
  const [payload, setPayload] = useState(initialData);
  const [page, setPage] = useState(initialData.pagination.page);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState<UserSortKey>("joinedDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const refreshInFlight = useRef(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didMount = useRef(false);

  const buildQuery = useCallback(
    (targetPage = page) => ({
      page: targetPage,
      pageSize: initialData.pagination.pageSize,
      search,
      role: roleFilter,
      status: statusFilter,
      sortBy,
      sortDirection: (sortAsc ? "asc" : "desc") as "asc" | "desc",
    }),
    [
      page,
      initialData.pagination.pageSize,
      search,
      roleFilter,
      statusFilter,
      sortBy,
      sortAsc,
    ]
  );

  const fetchUsers = useCallback(
    (query: ReturnType<typeof buildQuery>) => {
      if (refreshInFlight.current) {
        return;
      }

      refreshInFlight.current = true;
      startTransition(async () => {
        try {
          const nextPayload = await getAdminUsersDashboardDataAction(query);

          if (!nextPayload) {
            setError("Users data is unavailable.");
            return;
          }

          setPayload(nextPayload);
          setError(null);

          if (nextPayload.pagination.page !== query.page) {
            setPage(nextPayload.pagination.page);
          }
        } catch {
          setError("Unable to refresh users. Please try again.");
        } finally {
          refreshInFlight.current = false;
        }
      });
    },
    [startTransition]
  );

  const refreshUsers = useCallback(() => {
    fetchUsers(buildQuery());
  }, [buildQuery, fetchUsers]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }

    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      refreshUsers();
    }, 750);
  }, [refreshUsers]);

  useEffect(() => {
    setPayload(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    const timer = setTimeout(
      () => fetchUsers(buildQuery()),
      search ? 300 : 0
    );

    return () => clearTimeout(timer);
  }, [buildQuery, fetchUsers, search]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-users-page-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "User",
        },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
        },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
      channel.unsubscribe();
    };
  }, [scheduleRefresh]);

  const handleSort = (key: UserSortKey) => {
    if (key === sortBy) {
      setSortAsc((value) => !value);
    } else {
      setSortBy(key);
      setSortAsc(false);
    }
    setPage(1);
  };

  const stats = [
    {
      title: "Total Users",
      value: payload.stats.totalUsers,
      icon: Users,
      trend: "All registered accounts",
      trendUp: true,
    },
    {
      title: "Active Users",
      value: payload.stats.activeUsers,
      icon: UserCheck,
      trend: `${payload.stats.totalUsers ? Math.round((payload.stats.activeUsers / payload.stats.totalUsers) * 100) : 0}% of total`,
      trendUp: true,
    },
    {
      title: "New This Month",
      value: payload.stats.newThisMonth,
      icon: UserPlus,
      trend: "Created this month",
      trendUp: true,
    },
    {
      title: "Staff Accounts",
      value: payload.stats.staffUsers,
      icon: ShieldCheck,
      trend: "Admins and employees",
      trendUp: true,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6 pt-0">
      {(isPending || error) && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
          {isPending ? "Refreshing users..." : error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col gap-1 text-left">
        <h1 className="text-2xl font-semibold text-foreground dark:text-neutral-100">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage customer accounts, monitor activity, and track orders across NF
          Printers.
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <UserCharts
        monthlySignups={payload.charts.monthlySignups}
        spendingByUser={payload.charts.topSpenders}
      />
      <UsersTable
        users={payload.users}
        pagination={payload.pagination}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        roleFilter={roleFilter}
        onRoleFilterChange={(value) => {
          setRoleFilter(value);
          setPage(1);
        }}
        sortBy={sortBy}
        sortAsc={sortAsc}
        onSortToggle={handleSort}
        onPageChange={setPage}
      />
    </main>
  );
}
