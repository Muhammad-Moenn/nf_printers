"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteAdminServiceAction,
  getAdminServicesAction,
  saveAdminServiceAction,
  toggleAdminServiceAction,
} from "@/app/actions/admin-services-action";
import {
  serviceInputSchema,
  type AdminService,
  type AdminServicesPayload,
  type ServiceInput,
} from "@/app/schemas/admin-services-schema";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

const blankForm = (): ServiceInput => ({
  name: "",
  category: "Book Printing",
  description: "",
  details: "",
  features: [],
  options: [],
  idealFor: [],
  imageUrl: "",
  pricingMethod: "FIXED",
  basePrice: 0,
  minPrice: "",
  maxPrice: "",
  priceUnit: "service",
  displayOrder: 1,
  isActive: true,
});

const inputClass =
  "mt-1.5 h-9 w-full rounded-control border border-border bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-[var(--input)] dark:bg-[var(--surface-1)] dark:text-neutral-100 dark:placeholder:text-muted-foreground dark:focus:border-primary dark:focus:ring-primary/20";

const textareaClass =
  "mt-1.5 w-full rounded-control border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-[var(--input)] dark:bg-[var(--surface-1)] dark:text-neutral-100 dark:placeholder:text-muted-foreground dark:focus:border-primary dark:focus:ring-primary/20";

const labelClass =
  "block text-xs font-medium text-muted-foreground dark:text-neutral-300";

const currency = (amount: number) =>
  `Rs ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(amount)}`;

const splitLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function withRecomputedStats(
  payload: AdminServicesPayload,
): AdminServicesPayload {
  const popular = payload.services.reduce<AdminService | null>(
    (best, service) =>
      !best || service.orderCount > best.orderCount ? service : best,
    null,
  );

  return {
    ...payload,
    stats: {
      total: payload.services.length,
      active: payload.services.filter((service) => service.isActive).length,
      inactive: payload.services.filter((service) => !service.isActive).length,
      popularName:
        popular && popular.orderCount > 0 ? popular.name : "No orders yet",
      popularOrders: popular?.orderCount ?? 0,
    },
  };
}

function ServiceThumbnail({
  service,
  className,
}: {
  service: AdminService;
  className: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [service.imageUrl]);

  if (!service.imageUrl || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-primary-soft font-semibold text-primary-text dark:bg-primary dark:text-primary-soft-foreground ${className}`}
      >
        {service.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={service.imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`rounded-lg object-cover ${className}`}
    />
  );
}

function ServiceForm({
  service,
  categories,
  onClose,
  onSaved,
}: {
  service: AdminService | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ServiceInput>(
    service
      ? {
          name: service.name,
          category: service.category,
          description: service.description,
          details: service.details ?? "",
          features: service.features,
          options: service.options,
          idealFor: service.idealFor,
          imageUrl: service.imageUrl ?? "",
          pricingMethod: service.pricingMethod,
          basePrice: service.basePrice,
          minPrice: service.minPrice ?? "",
          maxPrice: service.maxPrice ?? "",
          priceUnit: service.priceUnit,
          displayOrder: service.displayOrder,
          isActive: service.isActive,
        }
      : blankForm(),
  );
  const [featureText, setFeatureText] = useState(
    service?.features.join("\n") ?? "",
  );
  const [optionText, setOptionText] = useState(
    service?.options.join("\n") ?? "",
  );
  const [idealForText, setIdealForText] = useState(
    service?.idealFor.join("\n") ?? "",
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, pending]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const candidate: ServiceInput = {
      ...form,
      features: splitLines(featureText),
      options: splitLines(optionText),
      idealFor: splitLines(idealForText),
    };
    const parsed = serviceInputSchema.safeParse(candidate);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Check the service details.";
      setError(message);
      toast.error(message);
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveAdminServiceAction(parsed.data, service?.id);
        if (!result.success) {
          setError(result.error);
          toast.error(result.error);
          return;
        }
        onSaved();
        onClose();
      } catch {
        const message = "Could not save this service. Please try again.";
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-form-title"
      className="fixed inset-0 z-50 flex justify-end bg-neutral-950/35"
      onMouseDown={(event) => {
        if (!pending && event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-card shadow-2xl dark:bg-[var(--surface-1)]"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-border-subtle bg-card p-5 dark:border-[var(--border)] dark:bg-[var(--surface-1)] sm:p-6">
          <div>
            <h2
              id="service-form-title"
              className="text-lg font-semibold text-foreground dark:text-neutral-100"
            >
              {service ? "Edit service" : "Add new service"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the service details customers see.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 space-y-5 p-5 sm:p-6">
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-text dark:bg-destructive/40 dark:text-destructive-soft-foreground"
            >
              {error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Service name *
              <input
                required
                autoFocus
                minLength={2}
                maxLength={100}
                className={inputClass}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Book Printing"
              />
            </label>
            <label className={labelClass}>
              Category *
              <input
                list="service-categories"
                required
                className={inputClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Choose or enter category"
              />
              <datalist id="service-categories">
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </datalist>
            </label>
          </div>
          <label className={labelClass}>
            Short description *
            <textarea
              required
              minLength={10}
              maxLength={1000}
              rows={3}
              className={textareaClass}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the service and its main value."
            />
          </label>
          <label className={labelClass}>
            Service details
            <textarea
              rows={3}
              maxLength={3000}
              className={inputClass}
              value={form.details ?? ""}
              onChange={(e) => set("details", e.target.value)}
              placeholder="Additional information shown on the service detail page."
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Features
              <textarea
                rows={4}
                className={textareaClass}
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
                placeholder="One feature per line"
              />
            </label>
            <label className={labelClass}>
              Options
              <textarea
                rows={4}
                className={textareaClass}
                value={optionText}
                onChange={(e) => setOptionText(e.target.value)}
                placeholder="One option per line"
              />
            </label>
          </div>
          <label className={labelClass}>
            Ideal for
            <textarea
              rows={2}
              className={textareaClass}
              value={idealForText}
              onChange={(e) => setIdealForText(e.target.value)}
              placeholder="One audience per line"
            />
          </label>
          <label className={labelClass}>
            Image URL
            <input
              type="url"
              className={inputClass}
              value={form.imageUrl ?? ""}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://…"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Pricing method
              <Select
                value={form.pricingMethod}
                onValueChange={(v) =>
                  set("pricingMethod", v as ServiceInput["pricingMethod"])
                }
              >
                <SelectTrigger className={`${inputClass} justify-between`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed price</SelectItem>
                  <SelectItem value="PER_PAGE">Per page / unit</SelectItem>
                  <SelectItem value="CUSTOM">Custom quote</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className={labelClass}>
              Price unit
              <input
                className={inputClass}
                maxLength={40}
                value={form.priceUnit}
                onChange={(e) => set("priceUnit", e.target.value)}
                placeholder="page, copy, service"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Base price (PKR) *
              <input
                required
                type="number"
                min="0"
                step="1"
                className={inputClass}
                value={form.basePrice}
                onChange={(e) => set("basePrice", Number(e.target.value))}
              />
            </label>
            <label className={labelClass}>
              Minimum price
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.minPrice ?? ""}
                onChange={(e) =>
                  set(
                    "minPrice",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </label>
            <label className={labelClass}>
              Maximum price
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.maxPrice ?? ""}
                onChange={(e) =>
                  set(
                    "maxPrice",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Display order *
              <input
                required
                type="number"
                min="0"
                className={inputClass}
                value={form.displayOrder}
                onChange={(e) => set("displayOrder", Number(e.target.value))}
              />
              <span className="mt-1 block text-[11px] text-neutral-400">
                Lower numbers appear first.
              </span>
            </label>
            <label className={labelClass}>
              Availability
              <Select
                value={form.isActive ? "active" : "inactive"}
                onValueChange={(v) => set("isActive", v === "active")}
              >
                <SelectTrigger className={`${inputClass} justify-between`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </div>
        <footer className="sticky bottom-0 flex gap-3 border-t border-border-subtle bg-card p-5 dark:border-[var(--border)] dark:bg-[var(--surface-1)] sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-2 disabled:opacity-50 dark:border-[var(--input)] dark:bg-[var(--surface-3)] dark:text-neutral-200 dark:hover:bg-[var(--border-subtle)]"
          >
            Cancel
          </button>
          <button
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-color hover:bg-primary disabled:opacity-60"
          >
            {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {service ? "Save changes" : "Save service"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function ConfirmDeleteDialog({
  service,
  pending,
  onCancel,
  onConfirm,
}: {
  service: AdminService;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onCancel();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel, pending]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-service-title"
      aria-describedby="delete-service-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4"
      onMouseDown={(event) => {
        if (!pending && event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-card p-5 shadow-2xl dark:bg-[var(--surface-3)] sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive-text dark:bg-destructive/40 dark:text-destructive-soft-foreground">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="delete-service-title"
              className="text-lg font-semibold text-foreground dark:text-neutral-100"
            >
              Delete service
            </h2>
            <p
              id="delete-service-description"
              className="mt-1 text-sm text-muted-foreground dark:text-neutral-300"
            >
              Are you sure you want to delete{" "}
                <span className="font-medium text-foreground dark:text-neutral-100">
                {service.name}
              </span>
              ? This cannot be undone. Existing orders keep their service name.
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-2 disabled:opacity-50 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-200 dark:hover:bg-[var(--surface-4)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-on-color hover:bg-destructive disabled:opacity-60"
          >
            {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Delete service
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RealtimeAdminServicesClient({
  initialData,
}: {
  initialData: AdminServicesPayload;
}) {
  const [payload, setPayload] = useState(initialData);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "live" | "offline"
  >("connecting");
  const [pending, startTransition] = useTransition();

  const channelId = useId();
  const channelName = useMemo(
    () => `admin-services-realtime-${channelId.replaceAll(":", "")}`,
    [channelId],
  );

  const refreshInFlight = useRef(false);
  const refreshQueued = useRef(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<() => void>(() => {});
  const hasSubscribed = useRef(false);
  const wasHidden = useRef(false);

  const refresh = useCallback(() => {
    if (refreshInFlight.current) {
      refreshQueued.current = true;
      return;
    }

    refreshInFlight.current = true;
    startTransition(async () => {
      try {
        const data = await getAdminServicesAction();
        if (!data) {
          setError("Services data is unavailable. Please try again.");
          return;
        }
        setPayload(data);
        setError(null);
      } catch {
        setError("Unable to refresh services. Please try again.");
      } finally {
        refreshInFlight.current = false;
        if (refreshQueued.current) {
          refreshQueued.current = false;
          refreshRef.current();
        }
      }
    });
  }, [startTransition]);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      refreshRef.current();
    }, 500);
  }, []);

  useEffect(() => {
    setPayload(initialData);
  }, [initialData]);

  useEffect(() => {
    let active = true;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Service" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order" },
        scheduleRefresh,
      )
      .subscribe((subscriptionStatus) => {
        if (!active) return;

        if (subscriptionStatus === "SUBSCRIBED") {
          setRealtimeStatus("live");
          if (hasSubscribed.current) scheduleRefresh();
          hasSubscribed.current = true;
          return;
        }

        if (
          subscriptionStatus === "CHANNEL_ERROR" ||
          subscriptionStatus === "TIMED_OUT"
        ) {
          setRealtimeStatus("offline");
          return;
        }

        setRealtimeStatus("connecting");
      });

    return () => {
      active = false;
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
      void supabase.removeChannel(channel);
    };
  }, [channelName, scheduleRefresh]);

  useEffect(() => {
    if (realtimeStatus === "live") return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refreshRef.current();
    }, 30000);
    return () => clearInterval(interval);
  }, [realtimeStatus]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        wasHidden.current = true;
        return;
      }
      if (wasHidden.current) {
        wasHidden.current = false;
        scheduleRefresh();
      }
    };
    const onOnline = () => scheduleRefresh();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", onOnline);
    };
  }, [scheduleRefresh]);

  const patchService = useCallback(
    (id: string, patch: Partial<AdminService>) => {
      setPayload((current) =>
        withRecomputedStats({
          ...current,
          services: current.services.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        }),
      );
    },
    [],
  );

  const removeService = useCallback((id: string) => {
    setPayload((current) => {
      const services = current.services.filter((item) => item.id !== id);
      return withRecomputedStats({
        ...current,
        services,
        categories: [...new Set(services.map((item) => item.category))].sort(
          (a, b) => a.localeCompare(b),
        ),
      });
    });
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      payload.services.filter((service) => {
        const matchesQuery =
          !normalizedQuery ||
          `${service.name} ${service.category} ${service.description}`
            .toLowerCase()
            .includes(normalizedQuery);
        return (
          matchesQuery &&
          (category === "all" || service.category === category) &&
          (status === "all" ||
            (status === "active" ? service.isActive : !service.isActive))
        );
      }),
    [payload.services, normalizedQuery, category, status],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedServices = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );
  const firstVisible = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastVisible = Math.min(currentPage * pageSize, filtered.length);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const hasActiveFilters =
    query.trim().length > 0 || category !== "all" || status !== "all";

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setPage(1);
  };

  const toggle = async (service: AdminService) => {
    if (busyId) return;

    const nextActive = !service.isActive;
    setBusyId(service.id);
    patchService(service.id, { isActive: nextActive });

    try {
      const result = await toggleAdminServiceAction(service.id, nextActive);
      if (!result.success) {
        patchService(service.id, { isActive: service.isActive });
        toast.error(result.error);
        return;
      }
      setError(null);
      toast.success(`${service.name} is now ${nextActive ? "active" : "inactive"}.`);
      refreshRef.current();
    } catch {
      patchService(service.id, { isActive: service.isActive });
      toast.error("Could not update service availability. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    if (!target) return;

    setBusyId(target.id);
    try {
      const result = await deleteAdminServiceAction(target.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      removeService(target.id);
      if (category === target.category) {
        const remainingInCategory = payload.services.some(
          (service) =>
            service.id !== target.id && service.category === target.category,
        );
        if (!remainingInCategory) setCategory("all");
      }
      setError(null);
      toast.success(`${target.name} was deleted.`);
      refreshRef.current();
    } catch {
      toast.error("Could not delete this service. Please try again.");
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDeleteTarget(null);
    setFormOpen(true);
  };

  const openEdit = (service: AdminService) => {
    setEditing(service);
    setDeleteTarget(null);
    setFormOpen(true);
  };

  const realtimeLabel =
    realtimeStatus === "live"
      ? "Live updates"
      : realtimeStatus === "connecting"
        ? "Connecting…"
        : "Reconnecting…";

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          
          <h1 className=" text-2xl font-bold tracking-tight text-foreground dark:text-on-color sm:text-3xl">
            Services management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground dark:text-neutral-400">
            Manage printing services, pricing, availability, and display order.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* <span
            title={realtimeLabel}
            className={`inline-flex h-10 items-center gap-2 rounded-control border px-3 text-xs font-medium ${
              realtimeStatus === "live"
                ? "border-success-border bg-success-soft text-success-text dark:border-success dark:bg-success/40 dark:text-success-soft-foreground"
                : realtimeStatus === "connecting"
                  ? "border-warning-border bg-warning-soft text-warning-text dark:border-warning dark:bg-warning/40 dark:text-warning-soft-foreground"
                  : "border-destructive-border bg-destructive-soft text-destructive-text dark:border-destructive dark:bg-destructive/40 dark:text-destructive-soft-foreground"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            {realtimeLabel}
          </span> */}
          <button
            type="button"
            onClick={() => refreshRef.current()}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-control border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-surface-2 disabled:opacity-60 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-200 dark:hover:bg-[var(--surface-4)]"
          >
            <RefreshCw
              className={`h-4 w-4 ${pending ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-on-color shadow-sm hover:bg-primary"
          >
            <Plus className="h-4 w-4" />
            Add service
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-destructive-border bg-destructive-soft px-4 py-2.5 text-sm text-destructive-text dark:border-destructive dark:bg-destructive/40 dark:text-destructive-soft-foreground"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total services",
            value: payload.stats.total,
            hint: "In your catalog",
            icon: Database,
            color: "text-primary-text bg-primary-soft dark:bg-primary/20 dark:text-primary-soft-foreground",
          },
          {
            label: "Active services",
            value: payload.stats.active,
            hint: "Available to customers",
            icon: Check,
            color: "text-success-text bg-success-soft dark:bg-success/20 dark:text-success-soft-foreground",
          },
          {
            label: "Inactive services",
            value: payload.stats.inactive,
            hint: "Temporarily hidden",
            icon: EyeOff,
            color: "text-warning-text bg-warning/10 dark:bg-warning/20 dark:text-warning-soft-foreground",
          },
          {
            label: "Most ordered",
            value: payload.stats.popularName,
            hint: `${payload.stats.popularOrders} orders`,
            icon: Sparkles,
            color: "text-violet-text bg-violet-soft dark:bg-violet/20 dark:text-violet-soft-foreground",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="flex min-h-28 items-start gap-4 rounded-lg border border-border bg-card p-4 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-3)]"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground dark:text-neutral-400">{stat.label}</p>
              <p className="mt-1 truncate text-xl font-bold text-foreground dark:text-on-color">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground dark:text-neutral-400">{stat.hint}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)]">
        <div className="flex flex-col gap-4 border-b border-border-subtle p-4 dark:border-[var(--border)] dark:bg-[var(--surface-3)] sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-foreground dark:text-on-color">
              Services list
            </h2>
            <p className="mt-1 text-xs text-muted-foreground dark:text-neutral-400">
              {filtered.length} of {payload.services.length} services
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="relative">
              <span className="sr-only">Search services</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search services…"
                className={`${inputClass} mt-0 pl-9`}
              />
            </label>
            <label>
              <span className="sr-only">Filter category</span>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className={`${inputClass} mt-0 justify-between`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {payload.categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label>
              <span className="sr-only">Filter status</span>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className={`${inputClass} mt-0 justify-between`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </div>

        {pending && realtimeStatus !== "live" && (
          <div
            role="status"
            className="flex items-center gap-2 px-5 py-2 text-xs text-muted-foreground"
          >
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Syncing services…
          </div>
        )}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-surface-2 text-xs text-muted-foreground dark:bg-[var(--surface-1)] dark:text-neutral-300">
              <tr>
                {[
                  "Service",
                  "Category",
                  "Pricing",
                  "Price",
                  "Status",
                  "Orders",
                  "Order",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle dark:divide-border">
              {paginatedServices.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-surface-2/70 dark:hover:bg-[var(--surface-4)]"
                >
                  <td className="max-w-64 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ServiceThumbnail
                        service={service}
                        className="h-10 w-10 text-sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground dark:text-on-color">
                          {service.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground dark:text-neutral-400">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-badge bg-primary-soft px-2.5 py-1 text-xs text-primary-text dark:bg-primary/70 dark:text-primary-soft-foreground">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground dark:text-neutral-300">
                    {service.pricingMethod === "FIXED"
                      ? "Fixed price"
                      : service.pricingMethod === "PER_PAGE"
                        ? `Per ${service.priceUnit}`
                        : "Custom pricing"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground dark:text-neutral-300">
                    {service.minPrice !== null || service.maxPrice !== null
                      ? `${currency(service.minPrice ?? service.basePrice)} – ${currency(service.maxPrice ?? service.basePrice)}`
                      : currency(service.basePrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-badge px-2.5 py-1 text-xs font-medium ${service.isActive ? "bg-success-soft text-success-text dark:bg-success dark:text-success-soft-foreground" : "bg-warning-soft text-warning-text dark:bg-warning dark:text-warning-soft-foreground"}`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground dark:text-neutral-300">
                    {service.orderCount}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground dark:text-neutral-300">
                    {service.displayOrder}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        aria-label={`Edit ${service.name}`}
                        className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:bg-[var(--surface-4)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void toggle(service);
                        }}
                        disabled={busyId === service.id}
                        aria-label={`${service.isActive ? "Deactivate" : "Activate"} ${service.name}`}
                        className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:bg-[var(--surface-4)]"
                      >
                        {service.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(service)}
                        aria-label={`Delete ${service.name}`}
                        className="rounded-md border border-border p-2 text-muted-foreground hover:border-destructive-border hover:bg-destructive-soft hover:text-destructive-text disabled:opacity-50 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:border-destructive dark:hover:bg-destructive/50 dark:hover:text-destructive-soft-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border-subtle md:hidden dark:divide-[var(--border)]">
          {paginatedServices.map((service) => (
            <article key={service.id} className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <ServiceThumbnail
                  service={service}
                  className="h-12 w-12 text-base"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground dark:text-on-color">
                      {service.name}
                    </h3>
                    <span
                      className={`rounded-badge px-2 py-0.5 text-[11px] ${service.isActive ? "bg-success-soft text-success-text dark:bg-success/70 dark:text-success-soft-foreground" : "bg-warning-soft text-warning-text dark:bg-warning/70 dark:text-warning-soft-foreground"}`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-neutral-400">
                    {service.category} · {service.orderCount} orders
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground dark:text-neutral-300">
                {service.pricingMethod === "CUSTOM"
                  ? "Custom pricing"
                  : currency(service.basePrice)}
                {service.pricingMethod === "PER_PAGE"
                  ? ` / ${service.priceUnit}`
                  : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(service)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-200 dark:hover:bg-[var(--surface-4)]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void toggle(service);
                  }}
                  disabled={busyId === service.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-50 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-200 dark:hover:bg-[var(--surface-4)]"
                >
                  {service.isActive ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {service.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(service)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-destructive-text disabled:opacity-50 dark:border-destructive/70 dark:bg-destructive/30 dark:text-destructive-soft-foreground dark:hover:bg-destructive/60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="px-6 py-14 text-center">
            <Database className="mx-auto h-8 w-8 text-neutral-300 dark:text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground dark:text-neutral-200">
              {payload.services.length
                ? "No services match your filters"
                : "No services in the catalog yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground dark:text-neutral-400">
              {payload.services.length
                ? "Try changing your search or filters."
                : "Add a service to start managing your catalog."}
            </p>
            {payload.services.length ? (
              hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium dark:border-border"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-on-color"
              >
                <Plus className="h-4 w-4" />
                Add service
              </button>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <footer className="flex flex-col gap-3 border-t border-border-subtle px-4 py-4 dark:border-border sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground dark:text-neutral-400">
              <span>
                Showing <span className="font-medium text-foreground dark:text-neutral-200">{firstVisible}–{lastVisible}</span> of {filtered.length} services
              </span>
              <label className="flex items-center gap-2">
                Rows per page
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    className="h-8 w-[76px] rounded-control border-border bg-card px-2 text-xs text-foreground dark:border-[var(--input)] dark:bg-[var(--surface-1)] dark:text-neutral-200"
                    aria-label="Rows per page"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
            <nav aria-label="Services table pagination" className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:bg-[var(--surface-4)]"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span aria-live="polite" className="min-w-20 text-center text-xs text-muted-foreground dark:text-neutral-400">
                Page {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                disabled={currentPage === pageCount}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:bg-[var(--surface-4)]"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </footer>
        )}
      </section>

      {formOpen && (
        <ServiceForm
          key={editing?.id ?? "new"}
          service={editing}
          categories={payload.categories}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setError(null);
            toast.success(
              editing
                ? "Service updated successfully."
                : "Service created successfully.",
            );
            refreshRef.current();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          service={deleteTarget}
          pending={busyId === deleteTarget.id}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </main>
  );
}
