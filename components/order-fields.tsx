"use client"
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
import { Trash } from "lucide-react";
import { Order } from "@/types/order";

type UploadedImage = {
  url: string;
  key: string;
};

interface OrderFieldsProps {
  orderDraft: Order;
  setorderDraft: React.Dispatch<React.SetStateAction<Order>>;
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

function OrderFields({ orderDraft, setorderDraft }: OrderFieldsProps) {
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const uploadedImages = (orderDraft.designs ?? []) as UploadedImage[];

  // When user uploads a new design
  function handleUpload(newImages: UploadedImage | UploadedImage[]) {
    const updatedImages = Array.isArray(newImages) ? [...newImages] : [newImages];
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
      <div className="w-full flex flex-col items-start">
        <Label className="text-xl my-4 font-semibold">Upload Designs</Label>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              console.log("Upload complete on client:", res);
              console.log("Response structure:", JSON.stringify(res, null, 2));
              
              if (!res?.length) {
                console.log("No response received");
                return;
              }
              
              const newImages = res.map((file) => {
                console.log("Processing file:", file);
                return {
                  url: file.url,
                  key: file.key,
                };
              });

              console.log("New images to add:", newImages);
              handleUpload(newImages);
            }}
            onUploadError={(error) => {
              console.error("Upload error:", error);
            }}
            onBeforeUploadBegin={(files) => {
              console.log("Starting upload for files:", files);
              return files;
            }}
            onUploadBegin={(fileName) => {
              console.log("Upload began for:", fileName);
            }}
          />
        {/* Show all uploaded images */}
        {uploadedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {uploadedImages.map((url, index) => (
              <div
                key={index}
                className="relative cursor-pointer group overflow-hidden"
              >
                <img
                  src={url.url}
                  alt={`Uploaded Design ${index + 1}`}
                  className="w-full h-20 object-cover border rounded-md"
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
    </div>
  );
}

export default OrderFields;
