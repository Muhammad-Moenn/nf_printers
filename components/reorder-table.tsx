"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderDetail } from "@/types/order";
import { useReorderOrders } from "@/lib/query/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCcw,
  RefreshCw,
  Search,
} from "lucide-react";

type DesignFile = { url: string; key?: string; name?: string; type?: string };
type OrderRow = OrderDetail;
const statusClass: Record<string, string> = {
  completed: "bg-success-soft text-success-text ring-success",
  in_progress: "bg-primary-soft text-primary-text ring-primary",
  processing: "bg-primary-soft text-primary-text ring-primary",
  pending: "bg-warning-soft text-warning-text ring-warning",
  cancelled: "bg-destructive-soft text-destructive-text ring-destructive",
};
const label = (value?: string | null) =>
  value
    ? value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "—";
const designsOf = (order: OrderRow): DesignFile[] =>
  Array.isArray(order.designs)
    ? (order.designs.filter((item) =>
        Boolean(
          item &&
          typeof item === "object" &&
          "url" in item &&
          typeof item.url === "string",
        ),
      ) as DesignFile[])
    : [];
const dateOf = (order: OrderRow) =>
  order.orderDate ? new Date(order.orderDate) : null;
const amountOf = (order: OrderRow) =>
  order.finalAmount ??
  order.estimatedAmount ??
  (Number(String(order.amount ?? "").replace(/[^\d.]/g, "")) || 0);
const currency = (amount: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

const selectTriggerClass =
  "h-9 w-full cursor-pointer rounded-control border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm shadow-neutral-900/[0.03] transition-[color,background-color,border-color,box-shadow] hover:border-primary-border hover:bg-primary-soft/40 focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/15 data-[state=open]:border-[var(--primary)] data-[state=open]:ring-2 data-[state=open]:ring-primary/15 dark:border-on-color/10 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-primary/40 dark:hover:bg-card/5 [&_svg]:size-4 [&_svg]:text-neutral-400";
const selectCompactTriggerClass =
  "h-9 w-full cursor-pointer rounded-control border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm shadow-neutral-900/[0.03] transition-[color,background-color,border-color,box-shadow] hover:border-primary-border hover:bg-primary-soft/40 focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/15 data-[state=open]:border-[var(--primary)] data-[state=open]:ring-2 data-[state=open]:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-on-color/10 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-primary/40 dark:hover:bg-card/5 [&_svg]:size-3.5 [&_svg]:text-neutral-400";
const selectContentClass =
  "rounded-control border border-border bg-card p-1.5 shadow-lg shadow-neutral-900/[0.08] dark:border-on-color/10 dark:bg-neutral-900";
const selectItemClass =
  "cursor-pointer rounded-sm py-2 pr-9 pl-3 text-sm text-foreground focus:bg-primary-soft focus:text-[var(--primary)] data-[highlighted]:bg-primary-soft data-[highlighted]:text-[var(--primary)] dark:text-neutral-200 dark:focus:bg-card/10 dark:data-[highlighted]:bg-card/10 dark:focus:text-on-color dark:data-[highlighted]:text-on-color";

export default function ReorderTable({
  ordersData,
  userId,
}: {
  ordersData?: OrderRow[];
  userId: string;
}) {
  const router = useRouter();
  const { data, isLoading } = useReorderOrders(userId, ordersData);
  const orders = data ?? ordersData ?? [];
  const [search, setSearch] = useState("");
  const [service, setService] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [direction, setDirection] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const services = useMemo(
    () =>
      [
        ...new Set(orders.map((order) => order.service).filter(Boolean)),
      ].sort(),
    [orders],
  );
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = new Date();
    const start =
      dateFilter === "30"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
        : dateFilter === "90"
          ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)
          : dateFilter === "year"
            ? new Date(now.getFullYear(), 0, 1)
            : null;
    return orders
      .filter((order) => {
        const matchesTerm =
          !term ||
          order.id.toLowerCase().includes(term) ||
          order.product.toLowerCase().includes(term) ||
          order.service.toLowerCase().includes(term);
        const date = dateOf(order);
        return (
          matchesTerm &&
          (service === "all" || order.service === service) &&
          (status === "all" || order.status === status) &&
          (!start || Boolean(date && date >= start))
        );
      })
      .sort((a, b) => {
        const factor = direction === "asc" ? 1 : -1;
        if (sort === "amount") return (amountOf(a) - amountOf(b)) * factor;
        const dateDiff =
          (dateOf(a)?.getTime() ?? 0) - (dateOf(b)?.getTime() ?? 0);
        return sort === "oldest" ? dateDiff : -dateDiff;
      });
  }, [orders, search, service, status, dateFilter, sort, direction]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const resetPage = (fn: () => void) => {
    fn();
    setPage(1);
  };
  const handleReorder = (order: OrderRow) =>
    router.push(
      `/user-dashboard/new-order?reorder=${encodeURIComponent(order.id)}`,
    );

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-5 px-3 pb-8 sm:px-5 lg:px-8">
      <header className="relative isolate -mx-4 overflow-hidden rounded-b-lg border-b border-primary-border/70 bg-gradient-to-r from-[var(--surface-2)] via-[var(--surface-2)] to-[var(--primary-soft)] px-5 py-6 sm:-mx-6 sm:px-8 lg:-mx-8">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
          viewBox="0 0 1200 190"
          preserveAspectRatio="none"
        >
          <path
            d="M0 118C180 40 286 185 492 97S850 34 1200 94V0H0Z"
            fill="var(--on-color)"
            fillOpacity=".48"
          />
          <path
            d="M525 180C680 52 788 35 924 89s191 64 276-32v133H525Z"
            fill="var(--primary-border)"
            fillOpacity=".36"
          />
        </svg>
        <div className="relative flex min-h-20 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-soft/80 text-[var(--primary)]">
            <RefreshCcw className="h-7 w-7" strokeWidth={2.3} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--heading)] sm:text-[28px]">
              Reorder
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quickly reorder your previous printing jobs without entering all
              the details again.
            </p>
          </div>
        </div>
      </header>
      <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm dark:border-on-color/10 dark:bg-card sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.6fr)_repeat(3,minmax(140px,1fr))]">
          <label className="relative sm:col-span-2 xl:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => resetPage(() => setSearch(e.target.value))}
              placeholder="Search order ID, product, or service..."
              className="h-9 rounded-control border-border pl-9 shadow-sm shadow-neutral-900/[0.03] dark:border-on-color/10 dark:bg-neutral-900"
            />
          </label>
          <Select
            value={service}
            onValueChange={(value) => resetPage(() => setService(value))}
          >
            <SelectTrigger
              aria-label="Filter by service"
              className={selectTriggerClass}
            >
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              <SelectItem value="all" className={selectItemClass}>
                All services
              </SelectItem>
              {services.map((item) => (
                <SelectItem key={item} value={item} className={selectItemClass}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => resetPage(() => setStatus(value))}
          >
            <SelectTrigger
              aria-label="Filter by status"
              className={selectTriggerClass}
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              <SelectItem value="all" className={selectItemClass}>
                All statuses
              </SelectItem>
              {[
                ...new Set(
                  orders
                    .map((item) => item.status)
                    .filter(
                      (item): item is NonNullable<typeof item> =>
                        Boolean(item),
                    ),
                ),
              ].map((item) => (
                <SelectItem key={item} value={item} className={selectItemClass}>
                  {label(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={dateFilter}
            onValueChange={(value) => resetPage(() => setDateFilter(value))}
          >
            <SelectTrigger
              aria-label="Filter by date"
              className={selectTriggerClass}
            >
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              <SelectItem value="all" className={selectItemClass}>
                All dates
              </SelectItem>
              <SelectItem value="30" className={selectItemClass}>
                Last 30 days
              </SelectItem>
              <SelectItem value="90" className={selectItemClass}>
                Last 90 days
              </SelectItem>
              <SelectItem value="year" className={selectItemClass}>
                This year
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3 border-t border-border-subtle pt-3  dark:border-on-color/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? "Loading orders…"
              : `${filtered.length} ${filtered.length === 1 ? "order" : "orders"} found`}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Sort by</span>
            <Select
              value={sort}
              onValueChange={(value) => resetPage(() => setSort(value))}
            >
              <SelectTrigger
                aria-label="Sort by"
                className={`${selectCompactTriggerClass} w-[116px]`}
              >
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="newest" className={selectItemClass}>
                  Newest
                </SelectItem>
                <SelectItem value="oldest" className={selectItemClass}>
                  Oldest
                </SelectItem>
                <SelectItem value="amount" className={selectItemClass}>
                  Amount
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={direction}
              disabled={sort !== "amount"}
              onValueChange={(value) => resetPage(() => setDirection(value))}
            >
              <SelectTrigger
                aria-label="Amount sort order"
                className={`${selectCompactTriggerClass} w-[128px]`}
              >
                <SelectValue placeholder="Descending" />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="desc" className={selectItemClass}>
                  Descending
                </SelectItem>
                <SelectItem value="asc" className={selectItemClass}>
                  Ascending
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-1 text-muted-foreground">Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Rows per page"
                className={`${selectCompactTriggerClass} w-[80px]`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="5" className={selectItemClass}>
                  5
                </SelectItem>
                <SelectItem value="10" className={selectItemClass}>
                  10
                </SelectItem>
                <SelectItem value="15" className={selectItemClass}>
                  15
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border dark:border-on-color/10">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-primary-soft/70 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground dark:bg-neutral-900 dark:text-neutral-300">
              <tr>
                {[
                  "Design",
                  "Order ID",
                  "Product",
                  "Service",
                  "Quantity",
                  "Status",
                  // "Order Date",
                  "Amount",
                  "Reorder Status",
                  "Actions",
                ].map((column) => (
                  <th key={column} className="px-3 py-3">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-border">
              {visible.map((order) => {
                const firstDesign = designsOf(order)[0];
                const eligible = order.status === "completed";
                const date = dateOf(order);
                return (
                  <tr
                    key={order.id}
                    className="text-foreground dark:text-neutral-200 hover:bg-primary-soft/30 dark:hover:bg-on-color/[0.02]"
                  >
                    <td className="px-3 py-3">
                      {firstDesign ? (
                        <a
                          href={firstDesign.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Open order design"
                          className="block h-11 w-14 overflow-hidden rounded-md border border-border bg-surface-2"
                        >
                          <img
                            src={firstDesign.url}
                            alt={firstDesign.name || "Order design"}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ) : (
                        <span className="flex h-11 w-14 items-center justify-center rounded-md border border-border bg-surface-2 text-neutral-400">
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-xs font-semibold text-primary-text">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td
                      className="max-w-40 truncate px-3 py-3 font-medium"
                      title={order.product}
                    >
                      {order.product || "—"}
                    </td>
                    <td
                      className="max-w-40 truncate px-3 py-3"
                      title={order.service}
                    >
                      {order.service || "—"}
                    </td>
                    <td className="px-3 py-3">
                      {Number(order.quantity).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-badge px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${statusClass[order.status ?? ""] ?? "bg-muted text-muted-foreground ring-border"}`}
                      >
                        {label(order.status)}
                      </span>
                    </td>
                    {/* <td className="whitespace-nowrap px-3 py-3 text-xs">
                      {date && !Number.isNaN(date.getTime())
                        ? date.toLocaleDateString()
                        : "—"}
                    </td> */}
                    <td className="whitespace-nowrap px-3 py-3 font-medium">
                      {currency(amountOf(order))}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`whitespace-nowrap text-xs font-medium ${eligible ? "text-success-text" : "text-neutral-400"}`}
                      >
                        {eligible ? "Eligible" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(order)}
                          className="h-8 rounded-control px-2.5"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!eligible}
                          onClick={() => handleReorder(order)}
                          className="h-8 rounded-control bg-[var(--primary)] px-2.5"
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          Reorder
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading orders…
                      </span>
                    ) : (
                      <>
                        <FileText className="mx-auto h-8 w-8 text-neutral-300" />
                        <p className="mt-2 text-sm font-medium text-foreground dark:text-neutral-200">
                          No orders found
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Adjust your search or filters and try again.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
            orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="h-8 w-8 border-primary-border bg-primary-soft text-[var(--primary)] hover:border-primary-border hover:bg-primary-soft hover:text-[var(--primary)] disabled:border-primary-border disabled:bg-primary-soft/50 disabled:text-primary-soft-foreground dark:border-primary/30 dark:bg-primary/10 dark:text-primary-soft-foreground dark:hover:bg-primary/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-16 text-center text-xs text-muted-foreground">
              Page {page} of {pages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={page >= pages}
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
              className="h-8 w-8 border-primary-border bg-primary-soft text-[var(--primary)] hover:border-primary-border hover:bg-primary-soft hover:text-[var(--primary)] disabled:border-primary-border disabled:bg-primary-soft/50 disabled:text-primary-soft-foreground dark:border-primary/30 dark:bg-primary/10 dark:text-primary-soft-foreground dark:hover:bg-primary/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Order #{selected.id.slice(-6).toUpperCase()}
                </DialogTitle>
                <DialogDescription>
                  Details saved with this order.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 sm:grid-cols-2">
                <DetailSection
                  title="Order information"
                  rows={[
                    ["Product", selected.product],
                    ["Service", selected.service],
                    ["Status", label(selected.status)],
                    ["Order date", dateOf(selected)?.toLocaleString() ?? null],
                    [
                      "Delivery date",
                      selected.deliveryDate
                        ? new Date(selected.deliveryDate).toLocaleDateString()
                        : null,
                    ],
                  ]}
                />
                <DetailSection
                  title="Printing specifications"
                  rows={[
                    ["Paper type", selected.paperType],
                    ["Sides", selected.sides],
                    ["Size", selected.size],
                    [
                      "Paper weight",
                      selected.gsm ? `${selected.gsm} GSM` : null,
                    ],
                    ["Color mode", selected.colorMode],
                    ["Quantity", selected.quantity],
                  ]}
                />
                <DetailSection
                  title="Pricing and payment"
                  rows={[
                    ["Amount", currency(amountOf(selected))],
                    ["Pricing status", label(selected.pricingStatus)],
                    ["Payment status", label(selected.payment?.status)],
                    [
                      "Payment amount",
                      selected.payment?.amount == null
                        ? null
                        : currency(Number(selected.payment.amount)),
                    ],
                  ]}
                />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground dark:text-neutral-100">
                    Finishing and requirements
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-neutral-300">
                    {selected.finishingOptions?.length
                      ? selected.finishingOptions.join(", ")
                      : "No finishing options recorded"}
                  </p>
                  {selected.requirements && (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground dark:text-neutral-300">
                      {selected.requirements}
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <h3 className="text-sm font-semibold text-foreground dark:text-neutral-100">
                    Uploaded designs
                  </h3>
                  {designsOf(selected).length ? (
                    <div className="flex flex-wrap gap-3">
                      {designsOf(selected).map((design) => (
                        <a
                          key={design.key ?? design.url}
                          href={design.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs text-primary-text hover:bg-primary-soft"
                        >
                          <img
                            src={design.url}
                            alt=""
                            className="h-10 w-12 rounded object-cover"
                          />
                          {design.name || "Open design"}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No design file was saved with this order.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
                {selected.status === "completed" && (
                  <Button
                    type="button"
                    onClick={() => handleReorder(selected)}
                    className="bg-[var(--primary)]"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reorder
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function DetailSection({
  title,
  rows,
}: {
  title: string;
  rows: [string, string | number | null | undefined][];
}) {
  const present = rows.filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
  if (!present.length) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground dark:text-neutral-100">
        {title}
      </h3>
      <dl className="space-y-1.5">
        {present.map(([name, value]) => (
          <div key={name} className="flex justify-between gap-4 text-xs">
            <dt className="text-muted-foreground">{name}</dt>
            <dd className="text-right font-medium text-foreground dark:text-neutral-200">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
