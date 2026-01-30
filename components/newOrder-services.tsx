"use client";
import { services } from "@/data/services";
import React, { useEffect } from "react";
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
import { useFormState, useFormStatus } from "react-dom";

function NewOrderServices() {
  const [isSaving, setIsSaving] = useState(false);
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
    amount: " 0", // number
    designs: [], // {url,key}[] is fine for Prisma Json
    finishingOptions: [],
    requirements: "",
    isReorder: false,
  });
  const initialState = { success: false, error: "",pending:false };
  const [state, formAction] = useFormState(SaveOrder, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.success) {
      toast.success("Order placed successfully 🎉");
      setDialogOpen(false);
       setIsSaving(false);
      setorderDraft({
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
        amount: " 0", // number
        designs: [], // {url,key}[] is fine for Prisma Json
        finishingOptions: [],
        requirements: "",
        isReorder: false,
      });
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setDialogOpen(false);
  //   setIsSaving(true);
  //   try {
  //     toast.loading("Saving order...", { toastId: "save-order" });
  //     const saved = await SaveOrder(orderDraft); // Call server action
  //     if (saved) {
  //       toast.update("save-order", {
  //         render: "Order placed successfully 🎉",
  //         type: "success",
  //         isLoading: false,
  //         autoClose: 3000,
  //       });
  //     }
  //   } catch (err: any) {
  //     console.error(err);
  //     toast.update("save-order", {
  //       render: err.message || "Failed to save order ❌",
  //       type: "error",
  //       isLoading: false,
  //       autoClose: 4000,
  //     });
  //   } finally {
  //     setIsSaving(false);
  //     setorderDraft({
  //       service: "",
  //       size: "",
  //       quantity: "0", // number now
  //       paperType: "",
  //       gsm: "",
  //       sides: "",
  //       colorMode: "",
  //       id: "",
  //       product: "",
  //       orderDate: new Date(), // Date object
  //       deliveryDate: null, // Date | null
  //       amount: " 0", // number
  //       designs: [], // {url,key}[] is fine for Prisma Json
  //       finishingOptions: [],
  //       requirements: "",
  //       isReorder: false,
  //     });
  //   }
  // };

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
            <DialogHeader className="px-4 md:px-6 pb-4">
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
            />
            <div className=" px-4 md:px-6 mt-8   flex justify-center gap-4 items-center w-full">
              <div className="w-full">
              <DialogClose className="w-full" asChild>
                <Button
                  variant="outline"
                  className=" w-full cursor-pointer border-gray-400 bg-gray-100 py-5"
                >
                  Cancel
                </Button>
              </DialogClose>
              </div>
              <form action={formAction} className="w-full  cursor-pointer text-[16px] font-medium">
                <input
                  type="hidden"
                  name="order"
                  value={JSON.stringify(orderDraft)}
                />
                <Button
                disabled={isSaving || pending}
                  type="submit"
                  className="w-full  cursor-pointer py-5 text-[16px] font-medium"
                >
                  {pending ? "Saving..." : "Save"}
                </Button>
              </form>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NewOrderServices;
