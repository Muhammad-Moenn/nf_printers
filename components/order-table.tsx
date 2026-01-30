"use client";

import React from "react";
import CustomTable, { Column } from "@/components/custom-table";
import { StatusBadge } from "@/components/status-badge";

/* ================= TYPES ================= */

export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Order {
   id: string;
  product: string;
  service: string;
  quantity: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate: string;
  amount: number;
}

/* ================= TABLE COLUMNS ================= */

const orderColumns: Column<Order>[] = [
  {
    key: "id",
    label: "Order ID",
    sortable: true,
    render: (value) => (
      <span className="font-mono font-medium text-xs ">
        #{String(value).slice(-6).toLocaleUpperCase()}
      </span>
    ),
  },

  { key: "product", label: "Product" },

  {
    key: "service",
    label: "Service",
    hideOnMobile: true,
  },

  {
    key: "quantity",
    label: "Quantity",
  },

  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => <StatusBadge status={value as OrderStatus} />,
  },

  {
    key: "orderDate",
    label: "Order Date",
    sortable: true,
    hideOnMobile: true,
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
  },

  {
    key: "deliveryDate",
    label: "Delivery",
    hideOnMobile: true,
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
  },

  {
    key: "amount",
    label: "Amount",
    hideOnMobile: true,
    render: (value) => `Rs ${value}`,
  },

  {
    key: "actions",
    label: "Actions",
  },
];

/* ================= PAGE COMPONENT ================= */

const viewOrder = (id: string) => {};
const reorder = (id: string) => {};

export default function OrderTable({allOrders}: {allOrders: Order[]}) {
  
  return (
    <div className="">
      <CustomTable
        data={allOrders}
        columns={orderColumns}
        defaultPageSize={10}
        renderActions={(order) => (
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-2 py-1 cursor-pointer rounded"
              onClick={() => viewOrder(order.id)}
            >
              View
            </button>
            {order.status === "completed" && (
              <button
                className="bg-yellow-500 text-white cursor-pointer px-2 py-1 rounded"
                onClick={() => reorder(order.id)}
              >
                Reorder
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
