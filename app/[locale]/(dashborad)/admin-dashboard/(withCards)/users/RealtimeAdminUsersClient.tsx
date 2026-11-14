"use client";

import { ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";

import UserCharts from "@/components/charts/admin-charts/users-page-charts";
import StatCard from "@/components/user-stat-cards";
import UsersTable, { type UserSortKey } from "@/components/user-table";
import type { AdminUsersQuery } from "@/lib/query/admin-defaults";
import { useAdminUsers } from "@/lib/query/hooks/use-admin-users";
import { useDebouncedValue } from "@/lib/query/use-debounced-value";

export default function RealtimeAdminUsersClient({
  adminId,
}: {
  adminId: string;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState<UserSortKey>("joinedDate");
  const [sortAsc, setSortAsc] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const filters = useMemo<AdminUsersQuery>(
    () => ({
      page,
      pageSize: 20,
      search: debouncedSearch,
      role: roleFilter,
      status: statusFilter,
      sortBy,
      sortDirection: sortAsc ? "asc" : "desc",
    }),
    [page, debouncedSearch, roleFilter, statusFilter, sortBy, sortAsc]
  );

  const usersQuery = useAdminUsers(adminId, filters);
  const payload = usersQuery.data;
  const isPending = usersQuery.isFetching;
  const error = usersQuery.isError
    ? "Unable to refresh users. Please try again."
    : null;

  // The server clamps an out-of-range page and reports it in `pagination`, which
  // the table renders. Copying it back into `page` state would change the query
  // key and fetch the same, already-clamped page a second time.

  if (!payload) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {error ?? "Loading users…"}
      </div>
    );
  }

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
