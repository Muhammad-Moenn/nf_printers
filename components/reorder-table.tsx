"use client";

import CustomTable, { Column } from "@/components/custom-table";
import { useEffect, useState, useTransition } from "react";
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
import { UpdateOrder } from "@/app/actions/order-action";
import { toast } from "react-toastify";
import { useCartStore } from "@/app/store/cart-store";
import { Design, getUserDesigns } from "@/app/actions/designs-action";

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

  // {
  //   key: "deliveryDate",
  //   label: "Delivery",
  //   hideOnMobile: true,
  //   render: (value: any) =>
  //     value ? new Date(value).toLocaleDateString() : "-",
  // },

  {
    key: "amount",
    label: "Amount",
    hideOnMobile: true,
    render: (value) => `Rs ${value}`,
  },
  {
    key: "isReorder",
    label: "Is Reorder",
    render: (value) => (value === true ? <span>Yes</span> : <span>No</span>),
  },
  {
    key: "actions",
    label: "Actions",
  },
];

/* ================= PAGE COMPONENT ================= */

export default function ReorderTable({ ordersData }: { ordersData: Order[] }) {
   const addToCart = useCartStore((state) => state.addToCart);
   const [prevdesigns, setPrevDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    size: "",
    colorMode: "",
    sides: "",
    gsm: "",
    designs: [],
    requirements: "",
    isReorder: false,
  });
  const validations = [
    {
      check: !orderDraft.designs || orderDraft.designs.length === 0,
      message: "Please upload at least one design before updating the order.",
    },
    {
      check: !orderDraft.service || orderDraft.service.trim() === "",
      message: "Please select a service before updating the order.",
    },
    {
      check: !orderDraft.paperType,
      message: "Please select a paper type before updating the order.",
    },
    {
      check: !orderDraft.size,
      message: "Please select a size before updating the order.",
    },
    {
      check: !orderDraft.colorMode,
      message: "Please select a color mode before updating the order.",
    },
    {
      check: !orderDraft.sides,
      message: "Please select a side before updating the order.",
    },
    {
      check: !orderDraft.gsm,
      message: "Please select weight (gsm) before updating the order.",
    },
  ];
   useEffect(() => {
      async function getPreviousDesigns() {
        const prevdesigns = await getUserDesigns();
        setPrevDesigns(prevdesigns);
      }
      getPreviousDesigns();
    }, []);
  const completedOrders = ordersData.filter(
    (order: Order) =>
      order.status === "completed" ||
      (order.isReorder &&
        (order.status === "processing" || order.status === "pending"))
  );
  const reorder = (id: string) => {
    const selectedOrder = ordersData.find((o: Order) => o.id === id);
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
      designs: selectedOrder.designs ?? [],
      isReorder: true,
    });

    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!orderDraft) return;

    // Only update if there is at least one design

    for (const validation of validations) {
      if (validation.check) {
        toast.warning(validation.message);
        return;
      }
    }

    try {
      setIsLoading(true);
      await UpdateOrder( orderDraft);

      toast.success("Reorder placed successfully!");
      setDialogOpen(false);

      // if you want to redirect
      // router.push("/user-dashboard/orders");
    } catch (err) {
      toast.error("Failed to placed order");
    } finally {
      setIsLoading(false);
      setorderDraft({
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
      });
      setDialogOpen(false); // ✅ stop pending
    }
  };
  const handleAddToCart = () => {
      if (!orderDraft) return;
  
      for (const validation of validations) {
        if (validation.check) {
          toast.warning(validation.message);
          return;
        }
      }
  
      addToCart({
        id: crypto.randomUUID(),
        product: orderDraft.product,
        service: orderDraft.service,
        quantity:orderDraft.quantity,
        requirements: orderDraft.requirements,
        designs: orderDraft.designs,
        size: orderDraft.size,
        paperType: orderDraft.paperType,
        gsm: orderDraft.gsm,
        colorMode: orderDraft.colorMode,
        sides: orderDraft.sides,
        finishingOptions: orderDraft.finishingOptions,
        amount: orderDraft.amount,
        isReorder: true,
      });
  
      toast.success("Item added to cart");
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
              prevdesigns={prevdesigns}
            />
            <div className=" px-4 md:px-6 mt-8   w-full flex justify-center gap-4 items-center ">
              <div className="w-full cursor-pointer">
                <DialogClose className="cursor-pointer" asChild>
                  <Button variant="outline" className="w-full py-5 ">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
              <div className="w-full cursor-pointer">
                <Button
                  onClick={handleAddToCart}
                  className="w-full py-5 cursor-pointer"
                >
                  Add To Cart
                </Button>
              </div>
              <div className="w-full cursor-pointer">
                <Button
                  disabled={isLoading}
                  onClick={(e) => handleSubmit(e, orderDraft.id)}
                  type="submit"
                  className="w-full py-5 cursor-pointer"
                >
                  {isLoading ? "Saving..." : "Save Order"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
