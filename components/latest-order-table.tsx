"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, Table } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { toast } from "react-toastify";
import { UpdateOrder } from "@/app/actions/order-action";
import { Order } from "@/types/order";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import OrderFields from "./order-fields";
import { Button } from "./ui/button";
import { useCartStore } from "@/app/store/cart-store";

/* ================= TYPES ================= */

export type OrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "processing";

type Column<T> = {
  key: keyof T | "actions";
  label: string;
  hideOnMobile?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
};

/* ================= COLUMNS ================= */

const orderColumns: Column<Order>[] = [
  { key: "designs", label: "Design" },
  // {
  //   key: "id",
  //   label: "Order ID",
  //   hideOnMobile: true,
  //   render: (value) => (
  //     <span className="font-mono font-medium text-xs">
  //       #{String(value).slice(-6).toUpperCase()}
  //     </span>
  //   ),
  // },
  { key: "service", label: "Service", hideOnMobile: true },
  // { key: "quantity", label: "Quantity" },
  {
    key: "status",
    label: "Status",
    render: (value) => <StatusBadge status={value as OrderStatus} />,
  },
  { key: "actions", label: "Actions" },
];

/* ================= COMPONENT ================= */

export default function LatestOrdersTable({
  ordersData,
}: {
  ordersData: any[];
}) {

  
  const addToCart = useCartStore((state) => state.addToCart);

  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const emptyDraft: Order = {
    id: "",
    product: "",
    service: "",
    quantity: "0",
    orderDate: new Date(),
    deliveryDate: null,
    amount: "0",
    finishingOptions: [],
    paperType: "",
    size: "",
    colorMode: "",
    sides: "",
    gsm: "",
    designs: [],
    requirements: "",
    isReorder: false,
  };

  const [orderDraft, setorderDraft] = useState<Order>(emptyDraft);

  /* ================= VALIDATION ================= */

  const validations = [
    {
      check: !orderDraft.designs?.length,
      message: "Upload at least one design.",
    },
    { check: !orderDraft.service, message: "Select a service." },
    { check: !orderDraft.paperType, message: "Select paper type." },
    { check: !orderDraft.size, message: "Select size." },
    { check: !orderDraft.colorMode, message: "Select color mode." },
    { check: !orderDraft.sides, message: "Select sides." },
    { check: !orderDraft.gsm, message: "Select gsm." },
  ];

  /* ================= ACTIONS ================= */

  const handleView = (order: Order) => {
    setorderDraft({ ...order });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const v of validations) {
      if (v.check) return toast.warning(v.message);
    }

    try {
      setIsLoading(true);
      await UpdateOrder(orderDraft);
      toast.success("Order saved!");
      setDialogOpen(false);
      setorderDraft(emptyDraft);
    } catch {
      toast.error("Failed to save order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    for (const v of validations) {
      if (v.check) return toast.warning(v.message);
    }

    addToCart({
      id: crypto.randomUUID(),
      product: orderDraft.product,
      service: orderDraft.service,
      quantity: orderDraft.quantity,
      requirements: orderDraft.requirements,
      designs: orderDraft.designs,
      size: orderDraft.size,
      paperType: orderDraft.paperType,
      gsm: orderDraft.gsm,
      colorMode: orderDraft.colorMode,
      sides: orderDraft.sides,
      finishingOptions: orderDraft.finishingOptions,
      amount: orderDraft.amount,
    });

    toast.success("Added to cart");
    setDialogOpen(false);
  };

  /* ================= RENDER ================= */

  return (
     <div className="bg-gradient-to-t from-blue-50/90 via-blue-50/70 to-white
dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] rounded-xl shadow-md  overflow-hidden pb-1">

    {/* Header */}
    <div className="px-6 py-6 border-b dark:border-gray-700 flex items-center justify-between">
      <h2 className="text-xl font-semibold tracking-tight flex gap-2 items-center">
        <Table className="w-5 h-5 text-blue-500" />  Latest Orders
      </h2>
      <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        {ordersData.length} orders
      </span>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-400/10 dark:bg-gray-800 text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <tr>
            {orderColumns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-6 py-4 text-left font-semibold ${
                  col.hideOnMobile ? "hidden lg:table-cell" : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y  dark:divide-gray-800">
          {ordersData.map((row) => (
            <tr
              key={row.id}
              className="group hover:bg-blue-100/50 dark:hover:bg-blue-900/10 transition-colors duration-200 "
            >
              {orderColumns.map((col) => {
                const value = row[col.key as keyof Order];

                /* DESIGN CELL */
                if (col.key === "designs") {
                  const url = row.designs?.[0]?.url;
                  return (
                    <td key="designs" className="px-6 py-2">
                      {url ? (
                        <div className="relative w-fit group">
                          <Image
                            src={url}
                            alt="design"
                            width={140}
                            height={100}
                            className="h-12 w-16 rounded-lg object-cover border shadow-sm group-hover:shadow-md transition"
                          />

                          <div
                            onClick={() => window.open(url, "_blank")}
                            className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition"
                          >
                            <Download className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No design
                        </span>
                      )}
                    </td>
                  );
                }

                /* ACTION BUTTON */
                if (col.key === "actions") {
                  return (
                    <td key="actions" className="px-6 py-4">
                      <Button
                        size="sm"
                        onClick={() => handleView(row)}
                        className="rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                      >
                        View 
                      </Button>
                    </td>
                  );
                }

                return (
                  <td
                    key={String(col.key)}
                    className={`px-6 py-4 text-sm ${
                      col.hideOnMobile ? "hidden lg:table-cell" : ""
                    }`}
                  >
                    {col.render
                      ? col.render(value, row)
                      : <span className="font-medium">{String(value ?? "")}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* ================= DIALOG ================= */}

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[600px] rounded-xl bg-white dark:bg-gray-900 shadow-xl border dark:border-gray-700">

        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8">
            <DialogTitle className="text-xl font-semibold">
              Order Details
            </DialogTitle>
            <DialogDescription className="text-sm">
              Review or update printing configuration
            </DialogDescription>
          </DialogHeader>

          <div className="px-8">
            <OrderFields
              orderDraft={orderDraft}
              setorderDraft={setorderDraft}
            />
          </div>

          <div className="flex gap-3 px-8 py-6 border-t dark:border-gray-800 mt-6">
            <DialogClose asChild>
              <Button variant="outline" className="w-full rounded-lg">
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="button"
              onClick={handleAddToCart}
              className="w-full rounded-lg shadow-sm hover:shadow-md transition"
            >
              Add To Cart
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>

  </div>
  );
}