"use client";

import CustomTable, { Column } from "@/components/custom-table";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

import { Button } from "./ui/button";
import OrderFields from "./order-fields";
import { Order, OrderStatus } from "@/types/order";
import { StatusBadge } from "./status-badge";
import { SaveOrder, UpdateOrder } from "@/app/actions/order-action";

/* ================= DUMMY DATA ================= */

// export const ordersData: Order[] = [
//   {
//     service:"",
//     design: [],
//     id: "ORD-1001",
//     product: "Lamination Services",
//     quantity: "500",
//     status: "pending",
//     // orderDate: "2025-12-28",
//     // deliveryDate: "2026-01-05",
//     amount: "4500",
//     finishingOptions: ["Lamination", "UV Spot"],
//     paperType: "Offset Paper",
//     size: "16*26",
//     colorMode: "Black",
//     sides: "Double Side (use two copies)",
//     gsm: "60 GSM",
//   },
//   {
//     service:"",
//     design: [],
//     id: "ORD-1004",
//     product: "Lamination Services",
//     quantity:"50",
//     status: "completed",
//     // orderDate: "2025-12-10",
//     // deliveryDate: "2025-12-14",
//     amount: "6000",
//     paperType: "Offset Paper",
//     finishingOptions: ["Lamination", "UV Spot"],
//     size: "17×27",
//     sides: "Double Side (use two copies)",
//     colorMode: "Four Color (CMYK)",
//     gsm: "53 GSM",
//     requirements:"loremsjssj njshs sbhshs "
//   },
// ];

/* ================= TABLE COLUMNS ================= */

const reorderColumns: Column<Order>[] = [
  {
    key: "designs",
    label: "Design",
  },
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
    render: (value: any) =>
      value ? new Date(value).toLocaleDateString() : "-",
  },

  {
    key: "deliveryDate",
    label: "Delivery",
    hideOnMobile: true,
    render: (value: any) =>
      value ? new Date(value).toLocaleDateString() : "-",
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

export default function ReorderTable({ ordersData }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderDraft, setorderDraft] = useState<Order>({
    id: "",
    product: "",
    service: "",
    quantity: "0",
    orderDate: new Date(),
    deliveryDate: null,
    amount: "0",
    finishingOptions: [],
    paperType: "",
    // paperTypeMode: "",
    size: "",
    colorMode: "",
    sides: "",
    gsm: "",
    designs: [],
    requirements: "",
  });

  const completedOrders = ordersData.filter(
    (order: any) => order.status == "completed"
  );
  const reorder = (id: string) => {
    const selectedOrder = ordersData.find((o: any) => o.id === id);
    if (!selectedOrder) return;

    setorderDraft({
      ...selectedOrder,
      product: selectedOrder.product ?? "",
      paperType: selectedOrder.paperType ?? "",
      size: selectedOrder.size ?? "",
      colorMode: selectedOrder.colorMode ?? "",
      sides: selectedOrder.sides ?? "",
      gsm: selectedOrder.gsm ?? "",
      finishingOptions: selectedOrder.finishingOptions ?? [],
      requirements: selectedOrder.requirements ?? "",
      designs: selectedOrder.designs ?? "",
    });

    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
     if (!orderDraft) return; // safety check

  // Only update if there is at least one design
  if (orderDraft.designs && orderDraft.designs.length > 0) {
    try {
      const updatedOrder = await UpdateOrder(orderId, orderDraft);
      if (updatedOrder) {
        alert("Order updated successfully ✅");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update order");
    }
  } else {
    alert("Please upload at least one design before updating the order.");
  }

    setDialogOpen(false);
  };
  return (
    <div className="">
      <CustomTable
        data={completedOrders}
        columns={reorderColumns}
        defaultPageSize={10}
        renderActions={(order) => (
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-2  py-1 cursor-pointer rounded"
              // onClick={() => viewOrder(order.id)}
            >
              View
            </button>

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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild></DialogTrigger>

        <DialogContent className="sm:max-w-[550px] px-0 bg-gray-100 text-gray-800  dark:text-gray-100  dark:bg-gray-900 border border-gray-600 w-full ">
          <form>
            <DialogHeader className="px-4 md:px-6">
              <DialogTitle className="text-[20px] md:text-2xl font-semibold">
                Place New Order
              </DialogTitle>
              <DialogDescription className="text-[14px] text-gray-700 dark:text-gray-300">
                Fill in printing details to place your order.
              </DialogDescription>
            </DialogHeader>
            <OrderFields
              orderDraft={orderDraft}
              setorderDraft={setorderDraft}
            />
            <div className=" px-4 md:px-6 mt-8   w-full flex justify-center gap-8 items-center">
              <DialogClose className="" asChild>
                <Button
                  variant="outline"
                  className="w-full py-5 max-w-[150px] md:max-w-[220px]"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={(e) => handleSubmit(e, orderDraft.id)}
                type="submit"
                className="w-full py-5 max-w-[150px] md:max-w-[220px]"
              >
                Place Order
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
