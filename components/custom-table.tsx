"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Download,
  ListFilter,
  Search,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* ================= TYPES ================= */

export interface Column<T> {
  key: keyof T | "actions" | "design";
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  hideOnMobile?: boolean;
  hideBelow?: "sm" | "md" | "lg" | "xl" | "2xl";
}

interface CustomTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  searchPlaceholder?: string;
  tableClassName?: string;
  compactSpacing?: boolean;
  darkPalette?: "default" | "services";
  // onEdit?: (row: T) => void;
  // onDelete?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
  serverState?: ServerTableState;
  loading?: boolean;
}
export type SortMode = "az" | "za" | "latest" | "oldest";

export type ServerTableState = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sortKey: string | null;
  sortMode: SortMode;
  onSortKeyChange: (key: string) => void;
  onSortModeChange: (mode: SortMode) => void;
};
/* ================= COMPONENT ================= */
type BaseRow = {
  id: string | number;
  isReorder?: boolean;
};
export default function CustomTable<T extends BaseRow>({
  data,
  columns,
  pageSizeOptions = [5, 10, 20],
  defaultPageSize = 5,
  searchPlaceholder = "Search...",
  tableClassName,
  compactSpacing = false,
  darkPalette = "default",
  // onEdit,
  // onDelete,
  renderActions,
  serverState,
  loading = false,
}: CustomTableProps<T>) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [sortMode, setSortMode] = useState<SortMode>("az");

  const columnVisibilityClass = (column: Column<T>) => {
    if (column.hideBelow) {
      return `hidden ${column.hideBelow}:table-cell`;
    }

    return column.hideOnMobile ? "hidden lg:table-cell" : "";
  };
  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    if (serverState) return data;
    if (!search) return data;

    return data.filter((row) =>
      columns.some(
        (col) =>
          col.key !== "actions" &&
          String(row[col.key as keyof T])
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    );
  }, [data, search, columns, serverState]);

  /* ================= SORT ================= */

  const sortedData = useMemo(() => {
    if (serverState) return filteredData;
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];


     if (!aVal && !bVal) return 0;
    if (!aVal) return 1;   // push empty values to bottom
    if (!bVal) return -1;
      if (sortMode === "az") {
        return String(aVal).localeCompare(String(bVal));
      }
      if (sortMode === "za") {
        return String(bVal).localeCompare(String(aVal));
      }
      if (sortMode === "latest") {
        return (
          new Date(bVal as string | Date).getTime() -
          new Date(aVal as string | Date).getTime()
        );
      }
      if (sortMode === "oldest") {
        return (
          new Date(aVal as string | Date).getTime() -
          new Date(bVal as string | Date).getTime()
        );
      }
      return 0;
    });
  }, [filteredData, sortKey, sortMode, serverState]);

  /* ================= PAGINATION ================= */

  const activePage = serverState?.page ?? currentPage;
  const activePageSize = serverState?.pageSize ?? pageSize;
  const totalResults = serverState?.total ?? sortedData.length;
  const pageCount = serverState
    ? Math.max(1, Math.ceil(serverState.total / activePageSize))
    : Math.ceil(sortedData.length / activePageSize);

  const paginatedData = useMemo(() => {
    if (serverState) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, serverState]);

  /* ================= UI ================= */

  return (
    <div className="flex min-w-0 w-full flex-col gap-6 px-4 pb-5 sm:px-6 sm:pb-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-[405px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder={searchPlaceholder}
            value={serverState ? serverState.search : search}
            onChange={(e) => {
              if (serverState) {
                serverState.onSearchChange(e.target.value);
                return;
              }
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          className={`h-9 w-full border-border bg-card pl-10 text-sm shadow-sm placeholder:text-neutral-400 dark:text-[var(--foreground)] dark:placeholder:text-muted-foreground ${darkPalette === "services" ? "dark:border-[var(--input)] dark:bg-[var(--surface-1)]" : "dark:border-[var(--border-strong)] dark:bg-[var(--surface-4)]"}`}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {/* Sort Column */}
          <Select
            value={serverState?.sortKey ?? undefined}
            onValueChange={(v) => {
              if (serverState) {
                serverState.onSortKeyChange(v);
                return;
              }
              setSortKey(v as keyof T);
            }}
          >
          <SelectTrigger className={`h-9 w-full cursor-pointer border-border bg-card sm:w-[185px] dark:text-[var(--foreground)] ${darkPalette === "services" ? "dark:border-[var(--input)] dark:bg-[var(--surface-4)]" : "dark:border-[var(--border-strong)] dark:bg-[var(--surface-4)]"}`}>
              <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {columns
                  .filter((c) => c.sortable)
                  .map((col) => (
                    <SelectItem key={String(col.key)} value={String(col.key)}>
                      {col.label}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select
            value={serverState?.sortMode}
            onValueChange={(v) => {
              if (serverState) {
                serverState.onSortModeChange(v as SortMode);
                return;
              }
              setSortMode(v as SortMode);
            }}
          >
          <SelectTrigger className={`h-9 w-full cursor-pointer border-border bg-card sm:w-[185px] dark:text-[var(--foreground)] ${darkPalette === "services" ? "dark:border-[var(--input)] dark:bg-[var(--surface-4)]" : "dark:border-[var(--border-strong)] dark:bg-[var(--surface-4)]"}`}>
              <ArrowDownUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">A → Z</SelectItem>
              <SelectItem value="za">Z → A</SelectItem>
              <SelectItem value="latest">Latest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          {/* Page Size */}
          <Select
            value={String(activePageSize)}
            onValueChange={(v) => {
              if (serverState) {
                serverState.onPageSizeChange(Number(v));
                return;
              }
              setPageSize(Number(v));
            }}
          >
            <SelectTrigger className={`h-9 w-full cursor-pointer border-border bg-card sm:w-[150px] dark:text-[var(--foreground)] ${darkPalette === "services" ? "dark:border-[var(--input)] dark:bg-[var(--surface-4)]" : "dark:border-[var(--border-strong)] dark:bg-[var(--surface-4)]"}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:text-neutral-100">
              {pageSizeOptions.map((size) => (
                <SelectItem className="" key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className={`w-full max-w-full overscroll-x-contain overflow-x-auto rounded-lg border border-border/90 bg-card [scrollbar-width:thin] ${darkPalette === "services" ? "dark:border-[var(--border)] dark:bg-[var(--surface-2)]" : "dark:border-[var(--border-strong)] dark:bg-[var(--surface-4)]"}`}>
        <table className={cn("w-full min-w-[940px] table-auto", tableClassName)}>
          <thead
            // dark:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_80%,transparent),color-mix(in_oklab,var(--primary)_60%,transparent))]
            className={`border-b border-border-subtle bg-surface-2/80 text-muted-foreground dark:text-neutral-300 ${darkPalette === "services" ? "dark:border-[var(--border)] dark:bg-[var(--surface-1)]" : "dark:border-[var(--border-strong)] dark:bg-[var(--surface-4)]"}`}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`whitespace-nowrap ${compactSpacing ? "px-3 2xl:px-4" : "px-4"} py-4 text-left text-[11px] font-bold uppercase tracking-wide ${
                    columnVisibilityClass(col)
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length ? (
              paginatedData.map((row) => {
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-border-subtle transition-colors last:border-b-0 hover:bg-primary-soft/40 ${darkPalette === "services" ? "dark:border-[var(--border)] dark:hover:bg-[var(--surface-4)]" : "dark:border-on-color/[0.07] dark:hover:bg-primary/[0.06]"}`}
                  >
                    {columns.map((col) => {
                      // 🔹 Extract design URL safely (only when needed)
                      const designs =
                        col.key === "designs"
                          ? (row[col.key as keyof T] as {
                              key: string;
                              url: string;
                            }[])
                          : null;

                      const designUrl = designs?.[0]?.url;
                      return (
                        <td
                          key={String(col.key)}
                          className={`${compactSpacing ? "px-3 2xl:px-4" : "px-4"} py-5 align-middle text-xs md:text-sm ${
                            columnVisibilityClass(col)
                          }`}
                        >
                          {col.key === "actions" ? (
                            renderActions ? (
                              renderActions(row)
                            ) : (
                              <div className="flex gap-2" />
                            )
                          ) : col.key === "designs" ? (
                            designUrl ? (
                              <div className="relative group w-fit ">
                                <Image
                                  priority
                                  width={140}
                                  height={100}
                                  src={designUrl}
                                  alt="design"
                                  className="h-8 w-12 rounded-md object-cover border transition-transform duration-200 group-hover:scale-105"
                                />

                                {/* Overlay */}
                                <div
                                  className="
                absolute inset-0
                flex items-center justify-center
                rounded-md
                bg-overlay
                opacity-0
                transition-opacity duration-200
                group-hover:opacity-100
                cursor-pointer
              "
                                  onClick={() =>
                                    window.open(designUrl, "_blank")
                                  }
                                  title="Download"
                                >
                                  <Download className="w-4 h-4 text-on-color" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-neutral-400">No design</span>
                            )
                          ) : col.render ? (
                            col.render(row[col.key as keyof T], row)
                          ) : col.key === "isReorder" ? (
                            row.isReorder ? (
                              "Yes"
                            ) : (
                              "No"
                            )
                          ) : (
                            String(row[col.key as keyof T] ?? "")
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-muted-foreground"
                >
                  {loading ? "Loading…" : "No results found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="px-1 text-sm text-muted-foreground">
          {totalResults} result{totalResults === 1 ? "" : "s"} | Page{" "}
          {activePage} of {Math.max(pageCount, 1)}
        </span>

        <div className="flex gap-2">
          <Button
            size="icon"
            // variant="outline"
            onClick={() => {
              if (serverState) {
                serverState.onPageChange(Math.max(serverState.page - 1, 1));
                return;
              }
              setCurrentPage((p) => Math.max(p - 1, 1));
            }}
            disabled={activePage === 1}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon"
            // variant="outline"
            onClick={() => {
              if (serverState) {
                serverState.onPageChange(
                  Math.min(serverState.page + 1, pageCount)
                );
                return;
              }
              setCurrentPage((p) => Math.min(p + 1, pageCount));
            }}
            disabled={pageCount === 0 || activePage === pageCount}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
