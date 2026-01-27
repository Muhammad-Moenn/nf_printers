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

/* ================= DUMMY DATA ================= */

// export const ordersData: Order[] = [
//   {
//     id: "ORD-1001",
//     product: "Business Cards",
//     quantity: 500,
//     status: "pending",
//     orderDate: "2025-12-28",
//     deliveryDate: "2026-01-05",
//     amount: 4500,
//     service:"ssn",
//     actions: "view",
//   },
//   {
//     id: "ORD-1002",
//     product: "Flyers (A5)",
//     quantity: 1000,
//     status: "in_progress",
//     orderDate: "2025-12-24",
//     deliveryDate: "2026-01-02",
//     amount: 7800,
//     actions: "view",
//     service:"ssn",
//   },
//   {
//     id: "ORD-1003",
//     product: "Brochures",
//     quantity: 300,
//     status: "completed",
//     orderDate: "2025-12-18",
//     deliveryDate: "2025-12-22",
//     amount: 9200,
//     actions: "invoice",
//     service:"ssn",
//   },
//   {
//     id: "ORD-1004",
//     product: "Posters (A2)",
//     quantity: 50,
//     status: "completed",
//     orderDate: "2025-12-10",
//     deliveryDate: "2025-12-14",
//     amount: 6000,
//     actions: "reorder",
//     service:"ssn",
//   },
//   {
//     id: "ORD-1005",
//     product: "Stickers",
//     quantity: 2000,
//     status: "cancelled",
//     orderDate: "2025-12-05",
//     deliveryDate: "-",
//     amount: 3200,
//     actions: "view",
//     service:"ssn",
//   },
// ];

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

  // {
  //   key: "isReorder",
  //   label: "Reorder",
  //   hideOnMobile: true,
  //   render: (value) =>
  //     value ? (
  //       <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
  //         Reorder
  //       </span>
  //     ) : (
  //       "-"
  //     ),
  // },

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

export default function OrderTable({allOrders}:any) {
  
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
            {/* {order.status === "completed" && (
        <button
          className="bg-green-500 text-white px-2 py-1 rounded"
          onClick={() => downloadInvoice(order.id)}
        >
          Invoice
        </button>
      )} */}
            {order.status == "completed" && (
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
