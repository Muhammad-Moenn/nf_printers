"use client";

import { useSaveDesign, useUserDesigns } from "@/lib/query/hooks/use-designs";
import { useReorderOrder } from "@/lib/query/hooks/use-orders";
import { usePricingEstimate } from "@/lib/query/hooks/use-pricing";
import { useCartStore } from "@/app/store/cart-store";
import { services, type ServiceProps } from "@/data/services";
import type { Order } from "@/types/order";
import { UploadDropzone } from "@/utils/uploadthing";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Archive,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleHelp,
  FileText,
  Image as ImageIcon,
  Layers,
  LoaderCircle,
  Minus,
  NotebookPen,
  Plus,
  Printer,
  Receipt,
  Scissors,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sticker,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  notebookPen: NotebookPen,
  bookOpen: BookOpen,
  layers: Layers,
  fileText: FileText,
  archive: Archive,
  printer: Printer,
  image: ImageIcon,
  receipt: Receipt,
  sticker: Sticker,
  calendarDays: CalendarDays,
  scissors: Scissors,
  shieldCheck: ShieldCheck,
};
const featuredTitles = [
  "File & Document Printing",
  "Book Printing",
  "Title & Cover Printing",
  "Poster Printing",
  "Invoice & Receipt Books",
];
const CUSTOM_PRINT_SERVICE = "Custom Printing";
const customPrintService: ServiceProps = {
  id: "custom-printing",
  title: CUSTOM_PRINT_SERVICE,
  description: "Configure custom print materials, quantities, and finishing.",
  icon: "printer",
  iconColor: "text-primary-text",
  iconBg: "bg-primary/10",
  link: "/user-dashboard/new-order",
  slug: "custom-printing",
};
const orderServiceOptions = [...services, customPrintService];
const paperTypes = [
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
];
const sizes = [
  "A4",
  "A3",
  "A5",
  "Letter",
  "Legal",
  "16×26",
  "17×27",
  "18×28",
  "20×30",
];
const weights = [
  "52",
  "60",
  "70",
  "75",
  "80",
  "90",
  "100",
  "120",
  "150",
  "200",
  "250",
  "300",
];
const fieldOptions: Record<CustomFieldKey, string[]> = {
  paperType: paperTypes,
  sides: ["Single-sided", "Double-sided"],
  size: sizes,
  gsm: weights.map((weight) => `${weight} GSM`),
  colorMode: ["Black & White", "Two Color (CMYK)", "Full Color (CMYK)"],
};
const finishes = [
  "Lamination",
  "Folding",
  "UV Spot",
  "Cutting",
  "Binding",
  "CVC Binding",
];
const finishByService: Record<string, string[]> = {
  "File & Document Printing": ["Lamination", "Folding", "Cutting", "Binding"],
  "Book Printing": ["Lamination", "Cutting", "Binding"],
  "Title & Cover Printing": ["Lamination", "UV Spot", "Cutting"],
  "Poster Printing": ["Lamination", "UV Spot", "Cutting"],
  "Invoice & Receipt Books": ["Lamination", "Folding", "Cutting", "Binding"],
};
type DesignFile = {
  url: string;
  key: string;
  size?: number | null;
  name?: string;
  type?: string;
};
const MAX_DESIGN_FILES = 3;
const freshOrder = (): Order => ({
  id: "",
  service: "",
  product: "",
  quantity: "1",
  paperType: "",
  size: "",
  gsm: "",
  colorMode: "",
  sides: "",
  amount: "0",
  designs: [],
  finishingOptions: [],
  requirements: "",
  orderDate: new Date(),
  deliveryDate: null,
  isReorder: false,
});
const fieldClass =
  "h-9 w-full rounded-control border-border bg-card text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-on-color/15 dark:bg-neutral-900";
type CustomFieldKey = "paperType" | "sides" | "size" | "gsm" | "colorMode";

export default function NewOrderServices({ userId }: { userId: string }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const [draft, setDraft] = useState<Order>(freshOrder);
  const [customFields, setCustomFields] = useState<
    Partial<Record<CustomFieldKey, boolean>>
  >({});
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [designDialog, setDesignDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reorderSourceId, setReorderSourceId] = useState("");
  const { data: savedDesigns = [] } = useUserDesigns(userId);
  const saveDesignMutation = useSaveDesign(userId);
  const [reorderId, setReorderId] = useState<string | null>(null);
  const { data: reorderSource, isError: reorderError } = useReorderOrder(
    userId,
    reorderId
  );
  const appliedReorderRef = useRef<string | null>(null);
  const {
    data: pricingResult,
    isFetching: pricingLoading,
    isError: pricingError,
  } = usePricingEstimate(draft as unknown as Record<string, unknown>, {
    enabled: Boolean(draft.service),
    debounceMs: 350,
  });
  const pricing =
    draft.service && pricingResult && !pricingError
      ? {
          formattedAmount: pricingResult.formattedAmount,
          predictedAmount: pricingResult.predictedAmount,
        }
      : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reorder = params.get("reorder");
    setReorderId(reorder);

    if (reorder) return;

    const requestedService = params.get("service")?.trim();
    const serviceTitle =
      params.get("custom") === "1" ? CUSTOM_PRINT_SERVICE : requestedService;
    if (!serviceTitle || serviceTitle.length > 120) return;
    const selectedService = orderServiceOptions.find(
      (service) => service.title.toLocaleLowerCase() === serviceTitle.toLocaleLowerCase(),
    );
    const selectedTitle = selectedService?.title ?? serviceTitle;

    setDraft((current) => ({
      ...current,
      service: selectedTitle,
      product: selectedTitle,
    }));
    if (selectedTitle === CUSTOM_PRINT_SERVICE) setShowAll(true);
  }, []);

  const visibleServices = useMemo(() => {
    const includeSelected =
      Boolean(draft.service) && !featuredTitles.includes(draft.service);
    const list =
      showAll || query || includeSelected
        ? orderServiceOptions
        : orderServiceOptions.filter((s) => featuredTitles.includes(s.title));
    const selectedServiceIsKnown = orderServiceOptions.some(
      (service) => service.title === draft.service,
    );
    const selectedServiceOption: ServiceProps | null =
      draft.service && !selectedServiceIsKnown
        ? {
            id: `selected-${draft.service}`,
            title: draft.service,
            description: "Selected from the Services page.",
            icon: "printer",
            iconColor: "text-primary-text",
            iconBg: "bg-primary/10",
            link: "/user-dashboard/new-order",
          }
        : null;
    const servicesToFilter = selectedServiceOption
      ? [selectedServiceOption, ...list]
      : list;
    return servicesToFilter.filter((s) =>
      `${s.title} ${s.description}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [draft.service, query, showAll]);
  const relevantFinishes = finishByService[draft.service] ?? finishes;
  const selectedDesigns = (draft.designs ?? []) as DesignFile[];

  useEffect(() => {
    if (!reorderSource || appliedReorderRef.current === reorderSource.id) {
      return;
    }

    appliedReorderRef.current = reorderSource.id;
    const source = reorderSource;

    setDraft({
      ...freshOrder(),
      service: source.service || "",
      product: source.product || source.service || "",
      quantity: source.quantity || "1",
      paperType: source.paperType || "",
      sides: source.sides || "",
      size: source.size || "",
      gsm: source.gsm || "",
      colorMode: source.colorMode || "",
      requirements: source.requirements || "",
      finishingOptions: Array.isArray(source.finishingOptions)
        ? source.finishingOptions
        : [],
      designs: source.designs,
      isReorder: true,
    });
    setCustomFields({
      paperType: Boolean(
        source.paperType && !fieldOptions.paperType.includes(source.paperType)
      ),
      sides: Boolean(
        source.sides && !fieldOptions.sides.includes(source.sides)
      ),
      size: Boolean(source.size && !fieldOptions.size.includes(source.size)),
      gsm: Boolean(source.gsm && !fieldOptions.gsm.includes(source.gsm)),
      colorMode: Boolean(
        source.colorMode && !fieldOptions.colorMode.includes(source.colorMode)
      ),
    });
    setReorderSourceId(source.id);
    toast.info(
      `Order #${source.id.slice(-6).toUpperCase()} loaded. Review the details before adding it to your cart.`
    );
  }, [reorderSource]);

  useEffect(() => {
    if (reorderError) {
      toast.error(
        "Could not load that order for reorder. Please choose another order."
      );
    }
  }, [reorderError]);

  useEffect(() => {
    if (!pricingResult) return;

    setDraft((current) =>
      current.amount === String(pricingResult.predictedAmount)
        ? current
        : { ...current, amount: String(pricingResult.predictedAmount) }
    );
  }, [pricingResult]);

  const update = (key: keyof Order, value: unknown) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };
  const selectService = (title: string) => {
    setDraft((current) => ({
      ...current,
      service: title,
      product: title,
      finishingOptions: (current.finishingOptions ?? []).filter((x) =>
        (finishByService[title] ?? finishes).includes(x),
      ),
    }));
    setErrors((current) => ({ ...current, service: "" }));
  };
  const toggleFinish = (item: string) =>
    update(
      "finishingOptions",
      draft.finishingOptions?.includes(item)
        ? draft.finishingOptions.filter((x) => x !== item)
        : [...(draft.finishingOptions ?? []), item],
    );
  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.service) next.service = "Choose a service to continue.";
    if (!draft.paperType) next.paperType = "Select a paper type.";
    if (!draft.sides) next.sides = "Select single or double-sided printing.";
    if (!draft.size) next.size = "Select a print size.";
    if (!draft.gsm) next.gsm = "Select a paper weight.";
    if (!draft.colorMode) next.colorMode = "Select a color mode.";
    if (
      !Number.isInteger(Number(draft.quantity)) ||
      Number(draft.quantity) < 1 ||
      Number(draft.quantity) > 100000
    )
      next.quantity = "Enter a quantity from 1 to 100,000.";
    if (!selectedDesigns.length)
      next.designs = "Upload a design or choose one from your saved designs.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.warning("Please complete the required order details.");
      return false;
    }
    return true;
  };
  const handleAddToCart = () => {
    if (submitLock.current || !validate()) return;
    if (pricingLoading || !pricing) {
      toast.info("Wait for the price estimate before adding this order.");
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    addToCart({
      ...draft,
      id: crypto.randomUUID(),
      amount:
        pricing?.predictedAmount != null
          ? String(pricing.predictedAmount)
          : "0",
    });
    toast.success("Order added to your cart.");
    setDraft(freshOrder());
    setCustomFields({});
    setErrors({});
    setReorderSourceId("");
    const url = new URL(window.location.href);
    if (url.searchParams.has("reorder")) {
      url.searchParams.delete("reorder");
      window.history.replaceState({}, "", url.toString());
    }
    window.setTimeout(() => {
      submitLock.current = false;
      setSubmitting(false);
    }, 250);
  };
  const handleCancel = () => {
    setDraft(freshOrder());
    setCustomFields({});
    setErrors({});
    setReorderSourceId("");
    const url = new URL(window.location.href);
    if (url.searchParams.has("reorder")) {
      url.searchParams.delete("reorder");
      window.history.replaceState({}, "", url.toString());
    }
  };
  const uploadComplete = async (
    files: {
      ufsUrl: string;
      key: string;
      size: number;
      name: string;
      type: string;
    }[],
  ) => {
    const remaining = Math.max(0, MAX_DESIGN_FILES - selectedDesigns.length);
    const designs = files.slice(0, remaining).map((file) => ({
      url: file.ufsUrl,
      key: file.key,
      size: file.size,
      name: file.name,
      type: file.type,
    }));
    if (!designs.length) {
      setUploading(false);
      toast.info(`You can attach up to ${MAX_DESIGN_FILES} design files.`);
      return;
    }
    setDraft((current) => ({
      ...current,
      designs: [...((current.designs ?? []) as DesignFile[]), ...designs],
    }));
    setErrors((current) => ({ ...current, designs: "" }));
    setUploading(false);
    setUploadProgress(100);

    // Keep newly uploaded files available in the user's existing designs list.
    const saved = await Promise.allSettled(
      designs.map((design) => saveDesignMutation.mutateAsync(design)),
    );
    const failedSaves = saved.filter(
      (result) => result.status === "rejected",
    ).length;
    if (failedSaves) {
      toast.warning(
        "The files are attached to this order, but some could not be saved to My Designs.",
      );
    } else {
      toast.success(
        `${designs.length} design ${designs.length === 1 ? "file uploaded" : "files uploaded"}.`,
      );
    }
  };
  const removeDesign = (design: DesignFile) => {
    setDraft((current) => ({
      ...current,
      designs: (current.designs ?? []).filter(
        (item) => item.key !== design.key,
      ),
    }));
  };

  const customSelect = (
    key: CustomFieldKey,
    value: string,
    placeholder: string,
    options: string[],
  ) => (
    <div className="w-full space-y-2">
      <Select
        value={customFields[key] ? "__custom__" : value}
        onValueChange={(nextValue) => {
          if (nextValue === "__custom__") {
            setCustomFields((current) => ({ ...current, [key]: true }));
            update(key, "");
          } else {
            setCustomFields((current) => ({ ...current, [key]: false }));
            update(key, nextValue);
          }
        }}
      >
        <SelectTrigger className={fieldClass}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          <SelectItem value="__custom__">Custom</SelectItem>
        </SelectContent>
      </Select>
      {customFields[key] && (
        <Input
          className={fieldClass}
          value={value}
          onChange={(event) => update(key, event.target.value)}
          placeholder={`Enter custom ${key === "gsm" ? "paper weight" : key === "paperType" ? "paper type" : key}`}
          aria-label={`Custom ${key}`}
        />
      )}
    </div>
  );
  const summaryRows = [
    ["Service", draft.service || "Select a service"],
    ["Paper Type", draft.paperType || "Select paper type"],
    ["Size", draft.size || "Select size"],
    ["Paper Weight", draft.gsm ? `${draft.gsm} GSM` : "Select GSM"],
    ["Color Mode", draft.colorMode || "Select color mode"],
    ["Quantity", draft.quantity || "1"],
  ];

  return (
    <main className="mx-auto w-full max-w-[1200px] space-y-4 px-3 pb-8 sm:px-5 lg:px-7">
      <section className="pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-neutral-100 sm:text-[27px]">
          Create Your Order
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a service and fill in the details to get started.
        </p>
        {reorderSourceId && (
          <div className="mt-3 rounded-lg border border-primary-border bg-primary-soft px-3 py-2 text-xs text-primary-text dark:border-primary dark:bg-primary/40 dark:text-primary-soft-foreground">
            Order #{reorderSourceId.slice(-6).toUpperCase()} is prefilled.
            Review or edit the details, then add it to your cart to create a new
            item.
          </div>
        )}
      </section>

      <section aria-labelledby="services-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="services-title"
            className="border-l-[3px] border-primary pl-2.5 text-base font-semibold text-foreground dark:text-neutral-100"
          >
            Our Services
          </h2>
          <label className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services..."
              className="h-9 rounded-control border-border bg-card pl-9 text-xs dark:border-on-color/10 dark:bg-neutral-900"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {visibleServices.map((service) => {
            const Icon = iconMap[service.icon] ?? Printer;
            const selected = draft.service === service.title;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => selectService(service.title)}
                aria-pressed={selected}
                className={`relative flex min-h-[108px] flex-col items-center justify-center rounded-lg border bg-card px-3 py-3 text-center transition hover:border-primary-border hover:shadow-sm dark:bg-card ${selected ? "border-primary ring-1 ring-primary/30" : "border-border dark:border-on-color/10"}`}
              >
                {selected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-color">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/10">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-xs font-semibold leading-4 text-foreground dark:text-neutral-100">
                  {service.title}
                </span>
                <span className="mt-1 line-clamp-2 text-[10px] leading-3.5 text-muted-foreground">
                  {service.description}
                </span>
              </button>
            );
          })}
          {!query && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="flex min-h-[108px] flex-col items-center justify-center rounded-lg border border-border bg-card px-3 py-3 text-center hover:border-primary-border dark:border-on-color/10 dark:bg-card"
            >
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/10">
                <ArrowRight
                  className={`h-[18px] w-[18px] transition-transform ${showAll ? "rotate-90" : ""}`}
                />
              </span>
              <span className="text-xs font-semibold">
                {showAll ? "Fewer Services" : "More Services"}
              </span>
              <span className="mt-1 text-[10px] text-muted-foreground">
                {showAll ? "Show featured services" : "Explore all services"}
              </span>
            </button>
          )}
        </div>
        {errors.service && (
          <p className="text-xs text-destructive-text">{errors.service}</p>
        )}
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm dark:border-on-color/10 dark:bg-card sm:p-5">
          <h2 className="mb-4 border-l-[3px] border-primary pl-2.5 text-base font-semibold">
            Order Details
          </h2>
          <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
            <Field label="Paper Type" error={errors.paperType}>
              {customSelect(
                "paperType",
                draft.paperType ?? "",
                "Select paper type",
                paperTypes,
              )}
            </Field>
            <Field label="Sides" error={errors.sides}>
              {customSelect("sides", draft.sides ?? "", "Select sides", [
                "Single Side",
                "Double Side (use single copy)",
                "Double Side (use two copies)",
              ])}
            </Field>
            <Field label="Size" error={errors.size}>
              {customSelect("size", draft.size ?? "", "Select size", sizes)}
            </Field>
            <Field label="Paper Weight (GSM)" error={errors.gsm}>
              {customSelect(
                "gsm",
                draft.gsm ?? "",
                "Select paper weight",
                weights.map((w) => `${w} GSM`),
              )}
            </Field>
            <Field label="Color Mode" error={errors.colorMode}>
              {customSelect(
                "colorMode",
                draft.colorMode ?? "",
                "Select color mode",
                ["Black & White", "Two Color (CMYK)", "Full Color (CMYK)"],
              )}
            </Field>
            <Field label="Quantity" error={errors.quantity}>
              <div className="flex h-9 items-center justify-between rounded-control border border-border bg-card px-2 dark:border-on-color/15 dark:bg-neutral-900">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    update(
                      "quantity",
                      String(Math.max(1, Number(draft.quantity || 1) - 1)),
                    )
                  }
                  className="p-1 text-muted-foreground"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <Input
                  aria-label="Quantity"
                  inputMode="numeric"
                  value={draft.quantity}
                  onChange={(e) =>
                    update("quantity", e.target.value.replace(/\D/g, ""))
                  }
                  className="h-8 max-w-28 border-0 text-center shadow-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    update(
                      "quantity",
                      String(Math.min(100000, Number(draft.quantity || 1) + 1)),
                    )
                  }
                  className="p-1 text-muted-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </Field>
          </div>
          <Field className="mt-3" label="Additional Requirements (Optional)">
            <Textarea
              value={draft.requirements ?? ""}
              onChange={(e) => update("requirements", e.target.value)}
              maxLength={2000}
              rows={2}
              placeholder="Tell us about colors, references, deadlines, or other requirements..."
              className="min-h-16 resize-y rounded-control border-border text-sm dark:border-on-color/15"
            />
          </Field>

          <section className="mt-4">
            <h3 className="mb-2 border-l-[3px] border-primary pl-2.5 text-sm font-semibold">
              Finishing Options
            </h3>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {relevantFinishes.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground dark:text-neutral-300"
                >
                  <Checkbox
                    checked={draft.finishingOptions?.includes(option)}
                    onCheckedChange={() => toggleFinish(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="border-l-[3px] border-primary pl-2.5 text-sm font-semibold">
                Upload Design
              </h3>
              <Dialog open={designDialog} onOpenChange={setDesignDialog}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-control text-xs"
                  >
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                    Use Existing Design
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select a saved design</DialogTitle>
                  </DialogHeader>
                  {savedDesigns.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {savedDesigns.map((design) => {
                        const alreadySelected = selectedDesigns.some(
                          (selected) => selected.key === design.key,
                        );
                        const isPdf = design.key.toLowerCase().endsWith(".pdf");
                        return (
                          <button
                            key={design.key}
                            type="button"
                            disabled={
                              alreadySelected ||
                              selectedDesigns.length >= MAX_DESIGN_FILES
                            }
                            onClick={() => {
                              if (selectedDesigns.length >= MAX_DESIGN_FILES) {
                                toast.info(
                                  `You can attach up to ${MAX_DESIGN_FILES} design files.`,
                                );
                                return;
                              }
                              update("designs", [
                                ...selectedDesigns,
                                {
                                  url: design.url,
                                  key: design.key,
                                  size: design.size,
                                },
                              ]);
                              setDesignDialog(false);
                            }}
                            className="overflow-hidden rounded-lg border border-border text-left hover:border-primary disabled:opacity-50"
                          >
                            {isPdf ? (
                              <div className="flex h-28 items-center justify-center bg-primary-soft">
                                <FileText className="h-8 w-8 text-primary-text" />
                              </div>
                            ) : (
                              <img
                                src={design.url}
                                alt="Saved design"
                                className="h-28 w-full object-cover"
                              />
                            )}
                            <span className="block truncate px-2 py-1.5 text-xs">
                              {design.key.split("/").pop()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      You have no saved designs yet.
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            {selectedDesigns.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2 rounded-lg border border-border p-2 dark:border-on-color/10">
                {selectedDesigns.map((design) => {
                  const isPdf =
                    design.type === "application/pdf" ||
                    design.name?.toLowerCase().endsWith(".pdf") ||
                    design.key.toLowerCase().endsWith(".pdf");
                  return (
                    <div
                      key={design.key}
                      className="flex min-w-0 items-center gap-2 rounded-md bg-surface-2 p-2 dark:bg-neutral-900"
                    >
                      {isPdf ? (
                        <FileText className="h-8 w-8 text-primary-text" />
                      ) : (
                        <img
                          src={design.url}
                          alt={design.name ?? "Selected design"}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <span className="max-w-[180px] truncate text-xs">
                        {design.name ?? design.key.split("/").pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDesign(design)}
                        aria-label="Remove design"
                        className="p-1 text-muted-foreground hover:text-destructive-text"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="rounded-lg border border-dashed border-primary-border bg-primary-soft/30 p-1 dark:border-primary dark:bg-primary/10">
              <UploadDropzone
                endpoint="imageUploader"
                config={{ mode: "auto" }}
                disabled={
                  uploading || selectedDesigns.length >= MAX_DESIGN_FILES
                }
                onBeforeUploadBegin={(files) => {
                  const remaining = MAX_DESIGN_FILES - selectedDesigns.length;
                  if (files.length > remaining)
                    toast.info(
                      `Only ${remaining} more design file${remaining === 1 ? "" : "s"} can be added.`,
                    );
                  return files
                    .filter((file) => {
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error(
                          `${file.name} exceeds the 10 MB file size limit.`,
                        );
                        return false;
                      }
                      return true;
                    })
                    .slice(0, remaining);
                }}
                onUploadBegin={() => {
                  setUploading(true);
                  setUploadProgress(0);
                }}
                onUploadProgress={setUploadProgress}
                onClientUploadComplete={uploadComplete}
                onUploadError={(error) => {
                  setUploading(false);
                  setUploadProgress(0);
                  toast.error(
                    error.message || "Upload failed. Please try again.",
                  );
                }}
                appearance={{
                  container: "min-h-24 border-0 bg-transparent",
                  label: "text-xs text-muted-foreground",
                  button:
                    "h-8 rounded-md bg-primary px-3 text-xs text-on-color after:hidden",
                  allowedContent: "text-[10px] text-muted-foreground",
                  uploadIcon: "h-6 w-6 text-primary-text",
                }}
                content={{
                  label:
                    "Drop artwork here or choose files — upload starts automatically",
                  button: "Choose files",
                  allowedContent:
                    "Up to 3 files: images up to 10 MB each or one PDF up to 10 MB",
                }}
              />
            </div>
            {(uploading || (uploadProgress > 0 && uploadProgress < 100)) && (
              <div className="mt-2 flex items-center gap-2 text-xs text-primary-text">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Uploading {uploadProgress}%
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-soft">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            {errors.designs && (
              <p className="mt-1 text-xs text-destructive-text">{errors.designs}</p>
            )}
          </section>
          <div className="mt-4 flex flex-col-reverse gap-2 border-t border-border-subtle pt-4 dark:border-on-color/10 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
              className="rounded-control sm:min-w-28"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={submitting || uploading}
              className="rounded-control bg-primary sm:min-w-40"
            >
              {submitting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              Add to Cart <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-card p-4 shadow-sm dark:border-on-color/10 dark:bg-card xl:sticky xl:top-4">
          <h2 className="flex items-center gap-3 text-base font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/10">
              <Layers className="h-4 w-4" />
            </span>
            Order Summary
          </h2>
          <div className="my-3 flex h-20 items-center justify-center rounded-lg bg-gradient-to-r from-primary-soft to-violet-soft text-primary-text dark:from-primary/40 dark:to-violet/40">
            <FileText className="h-9 w-9" />
            <ArrowRight className="mx-2 h-4 w-4" />
            <Printer className="h-8 w-8" />
          </div>
          <dl className="divide-y divide-border-subtle dark:divide-border">
            {summaryRows.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-3 py-2 text-xs"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="max-w-[58%] truncate text-right font-medium text-foreground dark:text-neutral-200">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {!!draft.finishingOptions?.length && (
            <div className="border-t border-border-subtle py-2 dark:border-on-color/10">
              <p className="mb-1 text-xs text-muted-foreground">Finishing</p>
              <p className="text-xs font-medium">
                {draft.finishingOptions.join(", ")}
              </p>
            </div>
          )}
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-primary-soft px-3 py-2.5 text-[10px] leading-4 text-primary-text dark:bg-primary/40 dark:text-primary-soft-foreground">
            <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Your order will be reviewed and the final price confirmed before
              production.
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">Estimated Price</span>
            <span className="text-lg font-bold text-primary-text">
              {pricingLoading ? (
                <LoaderCircle className="inline h-4 w-4 animate-spin" />
              ) : (
                (pricing?.formattedAmount ?? "Rs —")
              )}
            </span>
          </div>
          {pricing && (
            <p className="mt-1 text-right text-[10px] text-neutral-400">
              Estimate only · subject to review
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
      <label className="block text-xs font-medium text-foreground dark:text-neutral-300">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-destructive-text">{error}</p>}
    </div>
  );
}
