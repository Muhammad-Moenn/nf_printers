"use client";
import { services } from "@/data/services";
import React, { useEffect, useTransition } from "react";
import { ServiceCard } from "./service-card";
import Link from "next/link";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import OrderFields from "./order-fields";
import { Order } from "@/types/order";
import { SaveOrder } from "@/app/actions/order-action";
import { toast } from "react-toastify";
import { useCartStore } from "@/app/store/cart-store";
import { Design, getUserDesigns } from "@/app/actions/designs-action";

function NewOrderServices() {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isLoading, setIsLoading] = useState(false);
  const [prevdesigns, setPrevDesigns] = useState<Design[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderDraft, setorderDraft] = useState<Order>({
    service: "",
    size: "",
    quantity: "0", // number now
    paperType: "",
    gsm: "",
    sides: "",
    colorMode: "",
    id: "",
    product: "",
    orderDate: new Date(), // Date object
    deliveryDate: null, // Date | null
    amount: "0", // number
    designs: [], // {url,key}[] is fine for Prisma Json
    finishingOptions: [],
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderDraft) return;

    for (const validation of validations) {
      if (validation.check) {
        toast.warning(validation.message);
        return;
      }
    }

    try {
      setIsLoading(true);
      await SaveOrder(orderDraft);

      toast.success("Order placed successfully");
      setDialogOpen(false);
    } catch (err) {
      toast.error("Failed to save order");
    } finally {
      setIsLoading(false);
      setorderDraft({
        service: "",
        size: "",
        quantity: "0",
        paperType: "",
        gsm: "",
        sides: "",
        colorMode: "",
        id: "",
        product: "",
        orderDate: new Date(),
        deliveryDate: null,
        amount: "0",
        designs: [],
        finishingOptions: [],
        requirements: "",
        isReorder: false,
      });
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

    toast.success("Item added to cart");
    setDialogOpen(false);
  };
  return (
    <div className="px-4">
      <h3 className="my-3 px-3 text-[24px] font-semibold ">Services</h3>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 pb-8">
          {services.map((service) => {
            return (
              <DialogTrigger asChild key={service.id} className="">
                <Link
                  href={`/user-dashboard/new-order?service=${service.title}`}
                  onClick={() => {
                    setorderDraft((prev) => ({
                      ...prev,
                      service: service.title, // or service.slug
                    }));
                    setDialogOpen(true);
                  }}
                  className="px-3 mt-2"
                >
                  <ServiceCard {...service} />
                </Link>
              </DialogTrigger>
            );
          })}
        </div>

        <DialogContent className="sm:max-w-[550px] px-0 bg-gray-100 text-gray-800  dark:text-gray-100  dark:bg-gray-900 border border-gray-600 w-full  ">
          <form>
            <DialogHeader className="px-4 md:px-6 pb-4 border-b  border-gray-300 dark:border-gray-500">
              <DialogTitle className="text-[20px] md:text-2xl font-semibold">
                Place New Order
              </DialogTitle>
              <DialogDescription className="text-[14px] text-gray-600 dark:text-gray-300">
                Fill in printing details to place your order.
              </DialogDescription>
            </DialogHeader>
            <OrderFields
              orderDraft={orderDraft}
              setorderDraft={setorderDraft}
              prevdesigns={prevdesigns}
            />
            <div className=" border-t  border-gray-300 dark:border-gray-500">
              <DialogFooter className="mt-6 px-4 md:px-6    flex justify-center gap-4 items-center w-full ">
                <div className="w-full">
                  <DialogClose className="w-full" asChild>
                    <Button
                      variant="outline"
                      className=" w-full cursor-pointer border-gray-400 bg-gray-200/60 dark:bg-gray-800/50 py-5"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                </div>

                <div className="w-full">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isLoading}
                    className="w-full  cursor-pointer py-5 text-[16px] font-medium"
                  >
                    Add To Cart
                  </Button>
                </div>
                <div className="w-full">
                  <Button
                    onClick={(e) => handleSubmit(e)}
                    disabled={isLoading}
                    type="submit"
                    className="w-full  cursor-pointer py-5 text-[16px] font-medium"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NewOrderServices;
