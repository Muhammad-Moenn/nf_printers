"use client";
import { useState } from "react";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { MockUser } from "@/data/mockUsers";
import UserDetailDialog from "./userdetail-dialog";

export type UserSortKey = "joinedDate" | "orders" | "totalSpent";

interface UsersTableProps {
  users: MockUser[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  sortBy: UserSortKey;
  sortAsc: boolean;
  onSortToggle: (key: UserSortKey) => void;
  onPageChange: (page: number) => void;
}

const UsersTable = ({
  users,
  pagination,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  sortBy,
  onSortToggle,
  onPageChange,
}: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);

  const { page, pageSize, total, totalPages } = pagination;
  const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, total);

  const windowSize = 5;
  let windowStart = Math.max(1, page - Math.floor(windowSize / 2));
  const windowEnd = Math.min(totalPages, windowStart + windowSize - 1);
  windowStart = Math.max(1, windowEnd - windowSize + 1);
  const pageNumbers = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, index) => windowStart + index
  );

  return (
    <div className="rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 shadow-sm dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b p-4 dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 dark:border-[var(--input)] dark:bg-[var(--surface-1)] dark:text-neutral-100 dark:placeholder:text-muted-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px] dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-100">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-[130px] dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-100">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:border-[var(--border)] dark:bg-[var(--surface-1)]">
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>
                <button onClick={() => onSortToggle("orders")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Orders <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => onSortToggle("totalSpent")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Total Spent <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button onClick={() => onSortToggle("joinedDate")} className="inline-flex items-center gap-1 hover:text-foreground">
                  Joined <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="cursor-pointer transition-colors hover:bg-muted/40 dark:border-[var(--border)] dark:hover:bg-[var(--surface-4)]" onClick={() => setSelectedUser(user)}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>{user.company}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.orders}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-PK", {
                    style: "currency",
                    currency: "PKR",
                    maximumFractionDigits: 0,
                  }).format(user.totalSpent)}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "outline" : "destructive"} className={user.status === "active" ? "border-success text-success" : ""}>
                    {user.status === "active" ? "Active" : "Suspended"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-3 dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
        <span className="text-sm text-muted-foreground">
          Showing {firstRow}–{lastRow} of {total} users
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <UserDetailDialog
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};

export default UsersTable;
