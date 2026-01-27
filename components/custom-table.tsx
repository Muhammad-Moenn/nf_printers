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
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";

/* ================= TYPES ================= */

export interface Column<T> {
  key: keyof T | "actions" | "design";
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface CustomTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  // onEdit?: (row: T) => void;
  // onDelete?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
}
type SortMode = "az" | "za" | "latest" | "oldest";
/* ================= COMPONENT ================= */

export default function CustomTable<T extends { id: string | number }>({
  data,
  columns,
  pageSizeOptions = [5, 10, 20],
  defaultPageSize = 5,
  // onEdit,
  // onDelete,
  renderActions,
}: CustomTableProps<T>) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [sortMode, setSortMode] = useState<SortMode>("az");
  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
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
  }, [data, search, columns]);

  /* ================= SORT ================= */

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (!aVal || !bVal) return 0;

      // 🔤 A → Z
      if (sortMode === "az") {
        return String(aVal).localeCompare(String(bVal));
      }

      // 🔤 Z → A
      if (sortMode === "za") {
        return String(bVal).localeCompare(String(aVal));
      }

      // 🕒 Latest first
      if (sortMode === "latest") {
        return (
          new Date(bVal as any).getTime() - new Date(aVal as any).getTime()
        );
      }

      // 🕒 Oldest first
      if (sortMode === "oldest") {
        return (
          new Date(aVal as any).getTime() - new Date(bVal as any).getTime()
        );
      }

      return 0;
    });
  }, [filteredData, sortKey, sortMode]);

  /* ================= PAGINATION ================= */

  const pageCount = Math.ceil(sortedData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  /* ================= UI ================= */

  return (
    <div className="flex flex-col gap-4 w-full px-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-between">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm "
        />

        <div className="flex gap-2 flex-wrap">
          {/* Sort Column */}
          <Select onValueChange={(v) => setSortKey(v as keyof T)}>
            <SelectTrigger className="w-[160px]">
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
          <Select onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger className="w-[180px]">
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
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:text-gray-100">
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
      <div className="overflow-hidden rounded-lg border-2">
        <table className="w-full table-auto">
          <thead
            // dark:bg-[linear-gradient(135deg,rgba(59,130,246,0.8),rgba(37,99,235,0.6))]
            className="bg-blue-100/[0.9]  dark:bg-blue-700/[0.9]
 text-[14px] md:text-[16px] text-gray-800 dark:text-gray-50"
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-sm font-medium ${
                    col.hideOnMobile ? "hidden lg:table-cell" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length ? (
              paginatedData.map((row) => (
                
                <tr
                  key={row.id}
                  className="border-b hover:bg-blue-50/[0.4] dark:hover:bg-blue-400/[0.1] dark:border-gray-500/[0.7] cursor-pointer"
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
                        className={`px-4 py-3 text-[10px] md:text-sm ${
                          col.hideOnMobile ? "hidden lg:table-cell" : ""
                        }`}
                      >
                        {col.key === "actions" ? (
                          renderActions ? (
                            renderActions(row as any)
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
                bg-black/50
                opacity-0
                transition-opacity duration-200
                group-hover:opacity-100
                cursor-pointer
              "
                                onClick={() => window.open(designUrl, "_blank")}
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No design</span>
                          )
                        ) : col.render ? (
                          col.render(row[col.key as keyof T], row)
                        ) : (
                          String(row[col.key as keyof T] ?? "")
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-muted-foreground"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <span className="text-sm px-2">
          Page {currentPage} of {pageCount}
        </span>

        <div className="flex gap-2">
          <Button
            size="icon"
            // variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon"
            // variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
            disabled={currentPage === pageCount}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
