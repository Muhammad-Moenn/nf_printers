"use client";
import { useState } from "react";

import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { services } from "@/data/services";
import { Input } from "./ui/input";
import { UploadButton } from "@/utils/uploadthing";
import { Images, Trash } from "lucide-react";
import { Order } from "@/types/order";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

type UploadedImage = {
  url: string;
  key: string;
};

interface OrderFieldsProps {
  orderDraft: Order;
  setorderDraft: React.Dispatch<React.SetStateAction<Order>>;
  prevdesigns?: UploadedImage[];
}

const PaperSizes = [
  "16\u00d726",
  "17\u00d727",
  "18\u00d728",
  "19\u00d729",
  "20\u00d723",
  "20\u00d730",
];
const PaperWeights = [
  "52 GSM",
  "53 GSM",
  "54 GSM",
  "55 GSM",
  "56 GSM",
  "57 GSM",
  "59 GSM",
  "58 GSM",
  "62 GSM",
  "65 GSM",
  "70 GSM",
  "75 GSM",
  "80 GSM",
  "90 GSM",
];
const PaperTypes = [
  "Offset Paper",
  "Art Paper (Gloss)",
  "Art Paper (Matt)",
  "Bond Paper",
  "Card Stock",
  "Art Card",
  "Bristol Card",
  "Ivory Card",
  "Kraft Paper",
  "Texture Paper",
  "Duplex Board",
  "Blech Card",
  "Grey Board",
];

function OrderFields({
  orderDraft,
  setorderDraft,
  prevdesigns=[],
}: OrderFieldsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const uploadedImages = (orderDraft.designs ?? []) as UploadedImage[];

  // When user uploads a new design
  function handleUpload(newImages: UploadedImage | UploadedImage[]) {
    const updatedImages = Array.isArray(newImages)
      ? [...newImages]
      : [newImages];
    // Replace previous image because only 1 upload allowed
    setorderDraft((prev) => ({
      ...prev,
      designs: updatedImages,
    }));
  }

  const toggleFinishing = (option: string) => {
    setorderDraft((prev) => ({
      ...prev,
      finishingOptions: prev.finishingOptions?.includes(option)
        ? prev.finishingOptions.filter((o) => o !== option)
        : [...(prev.finishingOptions || []), option],
    }));
  };

  const deleteImage = async (key: string) => {
    try {
      setDeletingKey(key);

      const res = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!res.ok) throw new Error("Delete failed");

      if (res.ok) {
        setorderDraft((prev) => ({
          ...prev,
          designs: (prev.designs ?? []).filter((img) => img.key !== key),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingKey(null);
    }
  };

  const selectSingleDesign = (design: UploadedImage) => {
    // setorderDraft((prev) => ({
    //   ...prev,
    //   designs: [design], // 🔥 always only one
    // }));
    setSelectedKey(design.key);
  };

  // const Key = orderDraft.designs?.[0]?.key;

  return (
    <div className="overflow-y-scroll max-h-[50vh]  md:max-h-[48vh]  lg:max-h-[56vh] xl:max-h-[70vh]   px-4 md:px-6 w-full custom-scrollbar h-full pb-3">
      <div className="grid grid-cols-1 gap-3 w-full  pr-1">
        {/* Service */}
        <div className="grid  w-full gap-2">
          <Label className="mt-4 md:mt-6">Service</Label>
          <Select
            key={orderDraft.service}
            value={orderDraft.service}
            onValueChange={(v) => setorderDraft({ ...orderDraft, service: v })}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent className="w-full cursor-pointer">
              {services.map((s, i) => (
                <SelectItem key={i} value={s.title}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Common Fields */}
        <div className="grid gap-2 w-full">
          <Label>Paper Type</Label>

          {/* Show input if user selected "Custom" or typed a custom value */}
          {orderDraft.paperType === "Custom" ||
          (orderDraft.paperType &&
            !PaperTypes.includes(orderDraft.paperType)) ? (
            <Input
              placeholder="Enter paper type"
              type="text"
              value={
                orderDraft.paperType === "Custom" ? "" : orderDraft.paperType
              }
              onChange={(e) =>
                setorderDraft({
                  ...orderDraft,
                  paperType: e.target.value,
                })
              }
            />
          ) : (
            <Select
              value={orderDraft.paperType || ""}
              onValueChange={(value) =>
                setorderDraft({
                  ...orderDraft,
                  paperType: value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select paper type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Custom">Custom</SelectItem>
                {PaperTypes.map((type, i) => (
                  <SelectItem key={i} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid gap-2">
          <Label>Sides</Label>
          <Select
            value={orderDraft.sides}
            onValueChange={(v) => setorderDraft({ ...orderDraft, sides: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sides" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single Side">Single Side</SelectItem>
              <SelectItem value="Double Side (use single copy)">
                Double Side (use single copy)
              </SelectItem>
              <SelectItem value="Double Side (use two copies)">
                Double Side (use two copies)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2  gap-3">
          <div className="grid gap-2 w-full">
            <Label>Size</Label>

            {orderDraft.size === "custom" ||
            (orderDraft.size && !PaperSizes.includes(orderDraft.size)) ? (
              <Input
                placeholder="Enter size (e.g. 16\u00d726)"
                type="text"
                value={orderDraft.size === "custom" ? "" : orderDraft.size}
                onChange={(e) =>
                  setorderDraft({
                    ...orderDraft,
                    size: e.target.value,
                  })
                }
              />
            ) : (
              <Select
                value={orderDraft.size || ""}
                onValueChange={(v) =>
                  setorderDraft({
                    ...orderDraft,
                    size: v,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="custom">Custom size</SelectItem>
                  {PaperSizes.map((size, i) => (
                    <SelectItem key={i} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid gap-2 overflow-auto">
            <Label>Paper Weight (GSM)</Label>

            {orderDraft.gsm === "custom" ||
            (orderDraft.gsm && !PaperWeights.includes(orderDraft.gsm)) ? (
              <Input
                className="focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter paper weight (e.g. 68 GSM)"
                type="text"
                value={orderDraft.gsm === "custom" ? "" : orderDraft.gsm}
                onChange={(e) =>
                  setorderDraft({
                    ...orderDraft,
                    gsm: e.target.value,
                  })
                }
              />
            ) : (
              <Select
                value={orderDraft.gsm as string}
                onValueChange={(value) =>
                  setorderDraft({
                    ...orderDraft,
                    gsm: value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select paper weight" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  {PaperWeights.map((weight, i) => (
                    <SelectItem key={i} value={weight}>
                      {weight}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Color Mode</Label>
            <Select
              key={orderDraft.colorMode}
              value={orderDraft.colorMode}
              onValueChange={(v) =>
                setorderDraft({ ...orderDraft, colorMode: v })
              }
            >
              <SelectTrigger className="w-full focus:outline-none focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select color mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="White">White</SelectItem>
                <SelectItem value="Black">Black</SelectItem>
                <SelectItem value="Two Color (CMYK)">
                  Two Color (CMYK)
                </SelectItem>
                <SelectItem value="Four Color (CMYK)">
                  Four Color (CMYK)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="">Quantity</Label>
            <Input
              value={orderDraft.quantity}
              placeholder="Enter Quantity"
              type="text"
              onChange={(e) =>
                setorderDraft({
                  ...orderDraft,
                  quantity: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="">
          <label className="text-sm font-medium ">
            Describe your requirements(Optional)
          </label>

          <textarea
            value={orderDraft.requirements || ""}
            onChange={(e) =>
              setorderDraft({
                ...orderDraft,
                requirements: e.target.value,
              })
            }
            name="requirements"
            placeholder="Tell us exactly what you need (size, colors, quantity, deadline, references, etc.)"
            rows={6}
            className="w-full resize-none rounded-md border border-gray-400 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1 "
          />
        </div>
      </div>

      {/* Finishing */}
      <div className="mt-2">
        <Label className="text-xl my-4 font-semibold">Finishing Options</Label>
        <div className="grid grid-cols-2 gap-2 ">
          {["Lamination", "Cutting", "Folding", "Binding", "UV Spot"].map(
            (item, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={orderDraft.finishingOptions?.includes(item)}
                  onCheckedChange={() => toggleFinishing(item)}
                />
                <span onClick={() => toggleFinishing(item)} className="text-sm">
                  {item}
                </span>
              </label>
            )
          )}
        </div>
      </div>
      <Label className="text-md my-4 mb-2 font-medium">Upload Design</Label>
      <div className="flex gap-4 justify-start items-start mt-4">
        <div className=" flex flex-col items-start">
          <UploadButton
            className="ut-button:bg-slate-300/80
             ut-button:hover:bg-slate-300/100 
              ut-button:text-black
             ut-button:flex-ut-button:items-center
             ut-button:px-6 ut-button:py-5
             ut-button:rounded-md
             ut-button:flex ut-button:items-center ut-button:gap-4
             dark:ut-button:bg-slate-300/100
             dark:ut-button:hover:bg-slate-400
             ut-button:relative
ut-button:pl-10
ut-button:w-[150px]
ut-button:before:content-['']
ut-button:before:absolute
ut-button:before:left-[18px]
ut-button:before:top-1/2
ut-button:before:-translate-y-1/2
ut-button:before:w-4 ut-button:before:h-4
ut-button:before:bg-[url('/upload.svg')]
ut-button:before:bg-contain
ut-button:before:bg-no-repeat
             "
            endpoint="imageUploader"
            // 
            onClientUploadComplete={(res) => {
              if (!res?.length) {
                console.log("callback not runing");
                return;
              }

              const newImages = res.map((file) => {
                return {
                  url: file.ufsUrl,
                  key: file.key,
                };
              });

              console.log("New images to add:", newImages);
              handleUpload(newImages);
            }}
            onUploadError={(error) => {
              console.error("Upload error:", error);
            }}
          />
          {/* Show all uploaded images */}
        </div>
        <span className="mt-[6px]">or</span>
        <div className="w-full flex flex-col items-start">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className=" p-5  bg-slate-300/80 hover:bg-slate-300/100 text-gray-600 dark:bg-slate-300/100 dark:hover:bg-slate-400 cursor-pointer px-7">
                {" "}
                <Images className="w-4 h-4" /> Use Existing Design
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px] px-0 bg-gray-100 text-gray-800  dark:text-gray-100  dark:bg-gray-900 border border-gray-600 w-full  ">
              <DialogHeader className="px-4 md:px-6 pb-4 border-b border-gray-300 border-gray-500/60">
                <DialogTitle className="text-[20px] md:text-2xl font-semibold">
                  Select a Design
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-scroll max-h-[50vh]  md:max-h-[48vh]  lg:max-h-[56vh] xl:max-h-[70vh]   px-4 md:px-6 w-full custom-scrollbar h-full pb-3">
                { prevdesigns.length >0 && prevdesigns.map((design) => {
                  const selected = selectedKey === design.key;

                  return (
                    <div
                      key={design.key}
                      onClick={() => {
                        selectSingleDesign(design);
                      }}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border transition h-30
              ${
                selected ? "ring-2 ring-primary border-primary" : "border-muted"
              }`}
                    >
                      <img
                        src={design.url}
                        alt="design"
                        className="h-36 w-full object-cover object-center"
                      />

                      {/* Overlay */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center text-sm font-medium
                ${
                  selected
                    ? "bg-primary/50 text-white"
                    : "bg-black/40 text-white opacity-0 hover:opacity-100"
                }`}
                      >
                        {selected ? "Selected ✓" : "Click to Select"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className=" border-t  border-gray-300 dark:border-gray-500/60">
                <DialogFooter className=" px-4 md:px-6 mt-6   flex justify-center gap-4 items-center w-full  ">
                  <div className="w-full">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className=" w-full cursor-pointer border-gray-400 bg-gray-200/60 dark:bg-gray-800/50 py-5 "
                        onClick={() => {
                          setSelectedKey(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </div>
                  <div className="w-full">
                    <Button
                      className="w-full cursor-pointer py-5 "
                      type="button"
                      onClick={() => {
                        if (selectedKey) {
                          const selectedDesign = prevdesigns.find(
                            (design) => design.key === selectedKey
                          );
                          if (selectedDesign) {
                            handleUpload([selectedDesign]);
                          }
                        }
                        setDialogOpen(false);
                      }}
                    >
                      Add to Order
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Show all uploaded images */}
        </div>
      </div>
      {uploadedImages.length > 0 && (
        <div className="mt-4 max-w-[150px] w-full">
          {uploadedImages.map((url, index) => (
            <div
              key={index}
              className="relative cursor-pointer group overflow-hidden"
            >
              <img
                src={url.url}
                alt={`Uploaded Design ${index + 1}`}
                className="w-full h-28 object-cover border rounded-md"
              />
              <div className="w-full h-full absolute  justify-end hidden  group-hover:flex cursor-pointer z-40 bg-[rgba(0,0,0,0.5)] top-0 left-0 p-3 transition-all duration-500">
                <Trash
                  className="w-4 h-4 text-red-600 opacity-100 "
                  onClick={() => deleteImage(url.key)}
                />
              </div>
              {deletingKey === url.key && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderFields;
