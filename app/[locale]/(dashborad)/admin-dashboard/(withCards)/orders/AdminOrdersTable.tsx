"use client";

import {
  CheckCircle2,
  Eye,
  ExternalLink,
  Loader2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";

import {
  approveEstimatedPriceAction,
  overrideEstimatedPriceAction,
  updateAdminOrderAction,
  updateAdminOrderStatusAction,
} from "@/app/actions/admin-dashboard-action";
import type {
  AdminOrderItem,
  AdminOrderStatus,
} from "@/app/schemas/admin-dashboard-schema";
import CustomTable, {
  type Column,
  type ServerTableState,
} from "@/components/custom-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const orderStatuses: { value: AdminOrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusesRequiringFinalPrice: AdminOrderStatus[] = [
  "processing",
  "in_progress",
  "completed",
];

function formatDate(value: Date | string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-PK", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function toDateInputValue(value: Date | string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function formatAmount(value: string | number | null) {
  if (value === null) {
    return "-";
  }

  const amount = Number(String(value).replace(/[^\d.]/g, ""));

  if (Number.isNaN(amount)) {
    return `Rs ${value}`;
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function PricingState({ order }: { order: AdminOrderItem }) {
  const styles = {
    PENDING_REVIEW:
      "border-warning-border bg-warning-soft text-warning-text dark:border-warning/20 dark:bg-warning/10 dark:text-warning-soft-foreground",
    APPROVED:
      "border-success-border bg-success-soft text-success-text dark:border-success/20 dark:bg-success/10 dark:text-success-soft-foreground",
    OVERRIDDEN:
      "border-violet-border bg-violet-soft text-violet-text dark:border-violet/20 dark:bg-violet/10 dark:text-violet-soft-foreground",
  };
  const labels = {
    PENDING_REVIEW: "Needs review",
    APPROVED: "Approved",
    OVERRIDDEN: "Adjusted",
  };
  const estimateSource =
    order.pricingSource === "ML_MODEL" ? "AI estimate" : "Rule estimate";

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex rounded-badge border px-2 py-0.5 text-[10px] font-semibold ${styles[order.pricingStatus]}`}
      >
        {labels[order.pricingStatus]}
      </span>
      <span className="text-[10px] font-medium text-muted-foreground">
        {estimateSource}
      </span>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 dark:border-[var(--input)] dark:bg-[var(--surface-3)]">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground dark:text-neutral-100">
        {value || "-"}
      </p>
    </div>
  );
}

export default function AdminOrdersTable({
  orders,
  onStatusChanged,
  serverState,
}: {
  orders: AdminOrderItem[];
  onStatusChanged: () => void;
  serverState?: ServerTableState;
}) {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderItem | null>(
    null
  );
  const [editingOrder, setEditingOrder] = useState<AdminOrderItem | null>(null);
  const [editDraft, setEditDraft] = useState({
    product: "",
    service: "",
    quantity: "",
    deliveryDate: "",
    requirements: "",
  });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isReviewingPrice, setIsReviewingPrice] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const openOrderDetails = (order: AdminOrderItem) => {
    setSelectedOrder(order);
    setOverrideAmount(
      String(order.finalAmount ?? order.estimatedAmount ?? order.amount)
    );
    setOverrideReason(order.adjustmentReason ?? "");
  };

  const columns = useMemo<Column<AdminOrderItem>[]>(
    () => [
      { key: "designs", label: "Design" },
      {
        key: "id",
        label: "Order ID",
        sortable: true,
        render: (value) => (
          <span className="font-mono text-xs font-semibold">
            #{String(value).slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        key: "customerName",
        label: "Customer",
        sortable: true,
        render: (_value, row) => (
          <div className="min-w-[120px] max-w-[150px]">
            <p className="truncate font-medium text-foreground dark:text-neutral-100">
              {row.customerName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.customerEmail}
            </p>
          </div>
        ),
      },
      {
        key: "product",
        label: "Order details",
        sortable: true,
        render: (_value, row) => (
          <div className="min-w-[130px] max-w-[170px]">
            <p className="truncate font-semibold text-foreground dark:text-neutral-100">
              {row.product}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {row.service} | Qty {row.quantity}
            </p>
          </div>
        ),
      },
      {
        key: "paperType",
        label: "Print Specs",
        hideOnMobile: true,
        render: (_value, row) => (
          <div className="min-w-[150px] text-xs">
            <p className="font-medium text-foreground dark:text-neutral-200">
              {row.paperType || "Paper not set"}
              {row.gsm ? ` · ${row.gsm} GSM` : ""}
            </p>
            <p className="mt-1 text-muted-foreground">
              {[row.colorMode, row.sides].filter(Boolean).join(" · ") ||
                "Print settings not set"}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value) => <StatusBadge status={value as AdminOrderStatus} />,
      },
      {
        key: "orderDate",
        label: "Schedule",
        sortable: true,
        hideBelow: "2xl",
        render: (_value, row) => (
          <div className="min-w-[120px] text-xs">
            <p className="text-muted-foreground">
              Ordered {formatDate(row.orderDate)}
            </p>
            <p className="mt-1 font-medium text-foreground dark:text-neutral-200">
              Due {formatDate(row.deliveryDate)}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        label: "Quote",
        sortable: true,
        hideOnMobile: true,
        render: (_value, row) => (
          <div className="min-w-[120px]">
            <p className="font-semibold">
              {formatAmount(
                row.finalAmount ?? row.estimatedAmount ?? row.amount
              )}
            </p>
            <PricingState order={row} />
          </div>
        ),
      },
      { key: "actions", label: "Actions" },
    ],
    []
  );

  const handleStatusChange = (orderId: string, status: AdminOrderStatus) => {
    setUpdatingOrderId(orderId);

    startTransition(async () => {
      const result = await updateAdminOrderStatusAction({ orderId, status });

      if (!result.success) {
        toast.error(result.error);
        setUpdatingOrderId(null);
        return;
      }

      toast.success("Order status updated");
      onStatusChanged();
      setUpdatingOrderId(null);
    });
  };

  const openEditDialog = (order: AdminOrderItem) => {
    setEditingOrder(order);
    setEditDraft({
      product: order.product,
      service: order.service,
      quantity: order.quantity,
      deliveryDate: toDateInputValue(order.deliveryDate),
      requirements: order.requirements ?? "",
    });
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingOrder) {
      return;
    }

    setIsSavingEdit(true);
    const result = await updateAdminOrderAction({
      orderId: editingOrder.id,
      ...editDraft,
      deliveryDate: editDraft.deliveryDate || null,
    });

    if (!result.success) {
      toast.error(result.error);
      setIsSavingEdit(false);
      return;
    }

    toast.success("Order updated");
    setEditingOrder(null);
    setIsSavingEdit(false);
    onStatusChanged();
  };

  const openDesignPreview = (order: AdminOrderItem) => {
    const design = order.designs[0];

    if (!design) {
      toast.info("This order has no uploaded design.");
      return;
    }

    window.open(design.url, "_blank", "noopener,noreferrer");
  };

  const handleApproveEstimate = async () => {
    if (!selectedOrder) return;

    setIsReviewingPrice(true);
    const result = await approveEstimatedPriceAction(selectedOrder.id);
    setIsReviewingPrice(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Estimated price approved");
    setSelectedOrder(null);
    onStatusChanged();
  };

  const handleOverrideEstimate = async () => {
    if (!selectedOrder) return;

    const normalizedAmount = overrideAmount.replace(/[\s,]/g, "");
    const parsedAmount = Number(normalizedAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid final price greater than zero.");
      return;
    }

    if (overrideReason.trim().length < 5) {
      toast.error("Enter an adjustment reason of at least 5 characters.");
      return;
    }

    setIsReviewingPrice(true);
    const result = await overrideEstimatedPriceAction({
      orderId: selectedOrder.id,
      finalAmount: normalizedAmount,
      reason: overrideReason,
    });
    setIsReviewingPrice(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Adjusted price saved");
    setSelectedOrder(null);
    onStatusChanged();
  };

  return (
    <>
      <CustomTable
        data={orders}
        columns={columns}
        defaultPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        searchPlaceholder="Search by order ID, customer, or design..."
        tableClassName="min-w-[780px] 2xl:min-w-[1120px]"
        compactSpacing
        darkPalette="services"
        serverState={serverState}
        renderActions={(order) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-border bg-card text-muted-foreground shadow-none hover:bg-surface-2 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:bg-[var(--surface-4)]"
                aria-label={`Open actions for order ${order.id}`}
              >
                {isPending && updatingOrderId === order.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Order actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => openOrderDetails(order)}>
                <Eye className="h-4 w-4" />
                Manage order
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openDesignPreview(order)}>
                <ExternalLink className="h-4 w-4" />
                Open design
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openEditDialog(order)}>
                <Pencil className="h-4 w-4" />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {orderStatuses.map((status) => {
                    const requiresPriceReview =
                      statusesRequiringFinalPrice.includes(status.value) &&
                      (order.finalAmount === null ||
                        order.pricingStatus === "PENDING_REVIEW");

                    return (
                      <DropdownMenuItem
                        key={status.value}
                        disabled={requiresPriceReview || status.value === order.status}
                        onSelect={() => handleStatusChange(order.id, status.value)}
                      >
                        {status.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl dark:border-[var(--border)] dark:bg-[var(--surface-3)] dark:text-neutral-100">
          <DialogHeader>
            <DialogTitle>Manage Order</DialogTitle>
            <DialogDescription>
              {selectedOrder
                ? `#${selectedOrder.id.slice(-6).toUpperCase()} for ${
                    selectedOrder.customerName
                  }`
                : "Review order information."}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Customer" value={selectedOrder.customerName} />
              <DetailItem label="Email" value={selectedOrder.customerEmail} />
              <DetailItem label="Product" value={selectedOrder.product} />
              <DetailItem label="Service" value={selectedOrder.service} />
              <DetailItem label="Quantity" value={selectedOrder.quantity} />
              <DetailItem label="Status" value={selectedOrder.status.replaceAll("_", " ")} />
              <DetailItem
                label="Order Date"
                value={formatDate(selectedOrder.orderDate)}
              />
              <DetailItem
                label="Delivery Date"
                value={formatDate(selectedOrder.deliveryDate)}
              />
              <DetailItem label="Paper Type" value={selectedOrder.paperType} />
              <DetailItem label="Size" value={selectedOrder.size} />
              <DetailItem label="GSM" value={selectedOrder.gsm} />
              <DetailItem label="Color Mode" value={selectedOrder.colorMode} />
              <DetailItem label="Sides" value={selectedOrder.sides} />
              <DetailItem
                label="Finishing"
                value={selectedOrder.finishingOptions.join(", ")}
              />
              <div className="sm:col-span-2">
                <DetailItem
                  label="Requirements"
                  value={selectedOrder.requirements}
                />
              </div>

              <section className="grid gap-4 rounded-lg border border-primary-border bg-primary-soft/70 p-4 dark:border-primary/60 dark:bg-primary/20 sm:col-span-2">
                <div>
                  <h3 className="font-semibold text-foreground dark:text-neutral-100">
                    Price Review
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The current estimate uses standard pricing rules and requires
                    administrator approval.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <DetailItem
                    label="System Estimate"
                    value={formatAmount(selectedOrder.estimatedAmount)}
                  />
                  <DetailItem
                    label="Final Price"
                    value={formatAmount(selectedOrder.finalAmount)}
                  />
                  <DetailItem
                    label="Review Status"
                    value={selectedOrder.pricingStatus.replaceAll("_", " ")}
                  />
                  <DetailItem
                    label="Pricing Source"
                    value={selectedOrder.pricingSource?.replaceAll("_", " ")}
                  />
                  <DetailItem
                    label="Confidence"
                    value={selectedOrder.pricingConfidence ?? "-"}
                  />
                  <DetailItem
                    label="Reviewed"
                    value={formatDate(selectedOrder.priceReviewedAt)}
                  />
                </div>

                {selectedOrder.pricingBreakdown &&
                  selectedOrder.pricingBreakdown.length > 0 && (
                    <div className="rounded-lg border border-primary-border bg-card p-3 dark:border-[var(--input)] dark:bg-[var(--surface-2)]">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Estimate Breakdown
                      </p>
                      <div className="mt-2 grid gap-2">
                        {selectedOrder.pricingBreakdown.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span>{item.label}</span>
                            <span className="font-medium">
                              {formatAmount(item.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedOrder.adjustmentReason && (
                  <div className="rounded-lg border border-warning-border bg-warning-soft p-3 text-sm dark:border-warning/50 dark:bg-warning/20">
                    <span className="font-medium">Adjustment reason: </span>
                    {selectedOrder.adjustmentReason}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Final price (PKR) <span className="text-destructive-text">*</span>
                    </label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={overrideAmount}
                      onChange={(event) => setOverrideAmount(event.target.value)}
                      placeholder="For example: 25,000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Commas are accepted.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Adjustment reason <span className="text-destructive-text">*</span>
                    </label>
                    <Textarea
                      value={overrideReason}
                      onChange={(event) => setOverrideReason(event.target.value)}
                      placeholder="For example: additional finishing or material cost"
                      className="min-h-20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for the price-change record (at least 5 characters).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      isReviewingPrice || selectedOrder.estimatedAmount === null
                    }
                    onClick={handleApproveEstimate}
                  >
                    {isReviewingPrice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve Estimate
                  </Button>
                  <Button
                    type="button"
                    disabled={isReviewingPrice}
                    onClick={handleOverrideEstimate}
                  >
                    {isReviewingPrice && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Save Adjusted Price
                  </Button>
                </div>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingOrder)}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl dark:border-[var(--border)] dark:bg-[var(--surface-3)] dark:text-neutral-100">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              {editingOrder
                ? `Update #${editingOrder.id.slice(-6).toUpperCase()} for ${
                    editingOrder.customerName
                  }.`
                : "Update order details."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-primary-border bg-primary-soft px-4 py-3 text-sm text-primary-text dark:border-primary/20 dark:bg-primary/10 dark:text-primary-soft-foreground">
            Changing product, service, quantity, or requirements creates a new
            system estimate and sends the price back for review. Change the
            final amount from Manage Order so the adjustment reason is recorded.
          </div>

          <form onSubmit={handleEditSubmit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground dark:text-neutral-200">
                  Product
                </label>
                <Input
                  value={editDraft.product}
                  onChange={(event) =>
                    setEditDraft((draft) => ({
                      ...draft,
                      product: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground dark:text-neutral-200">
                  Service
                </label>
                <Input
                  value={editDraft.service}
                  onChange={(event) =>
                    setEditDraft((draft) => ({
                      ...draft,
                      service: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground dark:text-neutral-200">
                  Quantity
                </label>
                <Input
                  value={editDraft.quantity}
                  onChange={(event) =>
                    setEditDraft((draft) => ({
                      ...draft,
                      quantity: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground dark:text-neutral-200">
                  Delivery Date
                </label>
                <Input
                  type="date"
                  value={editDraft.deliveryDate}
                  onChange={(event) =>
                    setEditDraft((draft) => ({
                      ...draft,
                      deliveryDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground dark:text-neutral-200">
                Requirements
              </label>
              <Textarea
                value={editDraft.requirements}
                onChange={(event) =>
                  setEditDraft((draft) => ({
                    ...draft,
                    requirements: event.target.value,
                  }))
                }
                className="min-h-28"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingOrder(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingEdit}>
                {isSavingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
