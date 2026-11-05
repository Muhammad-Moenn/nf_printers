"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  ExternalLink,
  ImageIcon,
  MoreVertical,
  PackageOpen,
  Search,
} from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type OrderStatus =
  | "pending"
  | "processing"
  | "in_progress"
  | "completed"
  | "cancelled";

export type LatestOrder = {
  id: string;
  product: string;
  service: string;
  quantity: string;
  amount: string;
  status: OrderStatus;
  orderDate?: Date | string | null;
  deliveryDate?: Date | string | null;
  paperType?: string | null;
  gsm?: string | null;
  colorMode?: string | null;
  sides?: string | null;
  designs?: unknown;
  customerName?: string;
  customerEmail?: string;
  estimatedAmount?: unknown;
  finalAmount?: unknown;
  pricingStatus?: "PENDING_REVIEW" | "APPROVED" | "OVERRIDDEN";
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatAmount(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(String(value).replace(/[^\d.]/g, ""));
  if (Number.isNaN(amount)) return `Rs ${value}`;

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function DetailItem({ label, value, servicesPalette = false }: { label: string; value: string; servicesPalette?: boolean }) {
  return (
    <div className={`rounded-lg border border-border bg-surface-2/70 p-3 ${servicesPalette ? "dark:border-[var(--input)] dark:bg-[var(--surface-3)]" : "dark:border-on-color/10 dark:bg-on-color/[0.04]"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-foreground dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}

export default function LatestOrdersTable({
  ordersData,
  darkPalette = "default",
  dashboardPath = "admin-dashboard",
  compactDashboard = false,
}: {
  ordersData: LatestOrder[];
  darkPalette?: "default" | "services";
  dashboardPath?: "admin-dashboard" | "user-dashboard";
  compactDashboard?: boolean;
}) {
  const servicesPalette = darkPalette === "services";
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<LatestOrder | null>(null);

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ordersData;

    return ordersData.filter((order) =>
      [
        order.id,
        order.customerName,
        order.customerEmail,
        order.product,
        order.service,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [ordersData, search]);

  return (
    <section className={`min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card shadow-[var(--shadow-md)] ${servicesPalette ? "dark:border-[var(--border)] dark:bg-[var(--surface-2)]" : "dark:border-on-color/10 dark:bg-card"}`}>
      <div className={`flex flex-col gap-3 border-b border-border-subtle px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 ${compactDashboard ? "sm:gap-2" : "sm:gap-4 sm:px-6 sm:py-5"} ${servicesPalette ? "dark:border-[var(--border)] dark:bg-[var(--surface-3)]" : "dark:border-on-color/[0.07]"}`}>
        <div className="flex min-w-0 items-center gap-3.5">
          <div className={`${compactDashboard ? "h-10 w-10 rounded-lg" : "h-12 w-12 rounded-lg"} flex shrink-0 items-center justify-center bg-primary/10 text-primary-text ring-1 ring-primary/10 dark:bg-primary/15 dark:text-primary-soft-foreground`}>
            <PackageOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className={`${compactDashboard ? "text-lg" : "text-xl"} font-bold tracking-tight text-foreground dark:text-neutral-100`}>
              Recent Orders
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {visibleOrders.length} of {ordersData.length} latest orders
            </p>
          </div>
        </div>

        <Button asChild variant="outline" className={`${compactDashboard ? "h-9 rounded-control px-3 text-xs" : "w-full sm:w-auto"}`}>
          <Link href={`/${dashboardPath}/orders`}>
            View all orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {!compactDashboard && <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order ID, customer, or service..."
            className={`h-9 bg-card pl-10 ${servicesPalette ? "dark:border-[var(--input)] dark:bg-[var(--surface-1)]" : "dark:bg-input/30"}`}
          />
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          Live updates enabled
        </p>
      </div>}

      <div className={`w-full max-w-full overflow-x-auto border-y border-border-subtle [scrollbar-width:thin] ${servicesPalette ? "dark:border-[var(--border)]" : "dark:border-on-color/[0.07]"}`}>
        <table className={`w-full ${compactDashboard ? "table-fixed min-w-[620px] text-xs" : "table-auto min-w-[620px] xl:min-w-[860px] min-[1750px]:min-w-[1220px]"}`}>
          <thead className={`bg-surface-2/80 text-muted-foreground ${servicesPalette ? "dark:bg-[var(--surface-1)] dark:text-neutral-300" : "dark:bg-on-color/[0.04] dark:text-neutral-300"}`}>
            <tr>
              <th className={`${compactDashboard ? "table-cell w-[58px] px-2" : "hidden w-22 px-3 xl:table-cell"} py-2.5 text-left text-[10px] font-bold uppercase tracking-wide`}>
                Design
              </th>
              <th className={`${compactDashboard ? "w-[92px] px-2" : "w-24 px-3 sm:w-28"} py-2.5 text-left text-[10px] font-bold uppercase tracking-wide`}>
                Order ID
              </th>
              <th className={`${compactDashboard ? "w-[160px] px-2" : "w-32 px-3 sm:w-40"} py-2.5 text-left text-[10px] font-bold uppercase tracking-wide`}>
                Customer
              </th>
              <th className={`${compactDashboard ? "w-[190px] px-2" : "w-36 px-3 sm:w-44"} py-2.5 text-left text-[10px] font-bold uppercase tracking-wide`}>
                Order details
              </th>
              <th className="hidden px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                Print specs
              </th>
              <th className={`${compactDashboard ? "w-[110px] px-2" : "w-24 px-3 sm:w-28"} py-2.5 text-left text-[10px] font-bold uppercase tracking-wide`}>
                Status
              </th>
              <th className="hidden w-30 px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                Schedule
              </th>
              <th className="hidden w-28 px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide">
                Quote
              </th>
              <th className={`${compactDashboard ? "hidden" : "table-cell"} w-14 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wide`}>
                <span className="sr-only">Actions</span>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className={`divide-y divide-border-subtle ${servicesPalette ? "dark:divide-[var(--border)]" : "dark:divide-border"}`}>
            {visibleOrders.length ? (
              visibleOrders.map((order) => {
                const designUrl = Array.isArray(order.designs)
                  ? order.designs.find(
                      (design): design is { url: string; key: string } =>
                        typeof design === "object" &&
                        design !== null &&
                        "url" in design &&
                        typeof design.url === "string" &&
                        "key" in design &&
                        typeof design.key === "string"
                    )?.url
                  : undefined;
                const displayedAmount =
                  order.finalAmount ?? order.estimatedAmount ?? order.amount;

                return (
                  <tr
                    key={order.id}
                    className={`group transition-colors hover:bg-primary-soft/40 ${servicesPalette ? "dark:hover:bg-[var(--surface-4)]" : "dark:hover:bg-primary/[0.06]"}`}
                  >
                    <td className={`${compactDashboard ? "table-cell px-2 py-1.5" : "hidden px-3 py-4 xl:table-cell"}`}>
                      {designUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            window.open(designUrl, "_blank", "noopener,noreferrer")
                          }
                          className="group/design relative block overflow-hidden rounded-lg border border-border shadow-sm transition-shadow hover:shadow-md dark:border-on-color/10"
                          title="Open design preview"
                        >
                          <Image
                            src={designUrl}
                            alt={`Design for order ${order.id}`}
                            width={64}
                            height={48}
                            className={`${compactDashboard ? "h-9 w-12" : "h-10 w-14"} object-cover transition-transform duration-200 group-hover/design:scale-105`}
                          />
                        </button>
                      ) : (
                        <span className={`${compactDashboard ? "h-9 w-12" : "h-12 w-16"} inline-flex items-center justify-center rounded-lg border border-dashed border-border text-neutral-400 dark:border-on-color/10`}>
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className={`${compactDashboard ? "px-2 py-2" : "px-3 py-4"} align-middle`}>
                      <p className="font-mono text-xs font-bold text-primary-text dark:text-primary-soft-foreground">
                        #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground xl:hidden">
                        {formatDate(order.orderDate)}
                      </p>
                    </td>
                    <td className={`${compactDashboard ? "px-2 py-2" : "px-3 py-4"} align-middle`}>
                      <div className="min-w-0 max-w-32 sm:max-w-40">
                        <p className="truncate text-sm font-semibold text-foreground dark:text-neutral-100">
                          {order.customerName || "Customer not available"}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {order.customerEmail || "No email available"}
                        </p>
                      </div>
                    </td>
                    <td className={`${compactDashboard ? "px-2 py-2" : "px-3 py-4"} align-middle`}>
                      <div className="min-w-0 max-w-36 sm:max-w-44">
                        <p className="truncate text-sm font-semibold text-foreground dark:text-neutral-100">
                          {order.product}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {order.service} · Qty {order.quantity}
                        </p>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 align-middle">
                      <div className="min-w-44 text-xs">
                        <p className="font-medium text-foreground dark:text-neutral-200">
                          {order.paperType || "Paper not set"}
                          {order.gsm ? ` · ${order.gsm} GSM` : ""}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {[order.colorMode, order.sides].filter(Boolean).join(" · ") ||
                            "Print settings not set"}
                        </p>
                      </div>
                    </td>
                    <td className={`${compactDashboard ? "px-2 py-2" : "px-3 py-4"} align-middle`}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="hidden px-3 py-2 align-middle text-xs">
                      <p className="text-muted-foreground">Ordered</p>
                      <p className="mt-1 font-medium text-foreground dark:text-neutral-200">
                        {formatDate(order.orderDate)}
                      </p>
                      <p className="mt-2 text-muted-foreground">Due</p>
                      <p className="mt-1 font-medium text-foreground dark:text-neutral-200">
                        {formatDate(order.deliveryDate)}
                      </p>
                    </td>
                    <td className="hidden px-3 py-2 align-middle">
                      <p className="whitespace-nowrap text-sm font-bold text-foreground dark:text-neutral-100">
                        {formatAmount(displayedAmount)}
                      </p>
                      <span
                        className={`mt-1.5 inline-flex rounded-badge px-2 py-0.5 text-[10px] font-semibold ${
                          order.pricingStatus === "APPROVED"
                            ? "bg-success/10 text-success-text dark:text-success-soft-foreground"
                            : order.pricingStatus === "OVERRIDDEN"
                              ? "bg-violet/10 text-violet-text dark:text-violet-soft-foreground"
                              : "bg-warning/10 text-warning-text dark:text-warning-soft-foreground"
                        }`}
                      >
                        {order.pricingStatus === "APPROVED"
                          ? "Approved"
                          : order.pricingStatus === "OVERRIDDEN"
                            ? "Adjusted"
                            : "Needs review"}
                      </span>
                    </td>
                    <td className={`${compactDashboard ? "hidden" : "table-cell"} px-3 py-2 text-center align-middle`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className={`h-9 w-9 rounded-lg border-border bg-card text-muted-foreground shadow-none hover:bg-surface-2 ${servicesPalette ? "dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:bg-[var(--surface-4)]" : "dark:border-on-color/10 dark:bg-transparent dark:text-neutral-300"}`}
                            aria-label={`Open actions for order ${order.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Order actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                            View overview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!designUrl}
                            onSelect={() => {
                              if (designUrl) {
                                window.open(designUrl, "_blank", "noopener,noreferrer");
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open design
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/${dashboardPath}/orders`}>
                              <ArrowRight className="h-4 w-4" />
                              Manage all orders
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No recent orders match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!compactDashboard && <div className="flex flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>Showing {visibleOrders.length} recent order{visibleOrders.length === 1 ? "" : "s"}</span>
        <span>Use the action menu to view details or manage an order.</span>
      </div>}

      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className={`max-h-[88vh] overflow-y-auto sm:max-w-2xl ${servicesPalette ? "dark:border-[var(--border)] dark:bg-[var(--surface-3)] dark:text-neutral-100" : ""}`}>
          <DialogHeader>
            <DialogTitle>Order overview</DialogTitle>
            <DialogDescription>
              {selectedOrder
                ? `#${selectedOrder.id.slice(-6).toUpperCase()} for ${
                    selectedOrder.customerName || "this customer"
                  }`
                : "Review the latest order details."}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem servicesPalette={servicesPalette} label="Customer" value={selectedOrder.customerName || "—"} />
              <DetailItem servicesPalette={servicesPalette} label="Email" value={selectedOrder.customerEmail || "—"} />
              <DetailItem servicesPalette={servicesPalette} label="Product" value={selectedOrder.product} />
              <DetailItem servicesPalette={servicesPalette} label="Service" value={selectedOrder.service} />
              <DetailItem servicesPalette={servicesPalette} label="Quantity" value={selectedOrder.quantity} />
              <DetailItem servicesPalette={servicesPalette} label="Status" value={selectedOrder.status.replaceAll("_", " ")} />
              <DetailItem servicesPalette={servicesPalette} label="Ordered" value={formatDate(selectedOrder.orderDate)} />
              <DetailItem servicesPalette={servicesPalette} label="Delivery date" value={formatDate(selectedOrder.deliveryDate)} />
              <DetailItem
                servicesPalette={servicesPalette}
                label="Print specification"
                value={[
                  selectedOrder.paperType,
                  selectedOrder.gsm && `${selectedOrder.gsm} GSM`,
                  selectedOrder.colorMode,
                  selectedOrder.sides,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Not set"}
              />
              <DetailItem
                servicesPalette={servicesPalette}
                label="Quote"
                value={formatAmount(
                  selectedOrder.finalAmount ??
                    selectedOrder.estimatedAmount ??
                    selectedOrder.amount
                )}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
