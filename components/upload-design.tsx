"use client";

import type { Design } from "@/lib/data/designs";
import {
  designsQueryOptions,
  useDeleteDesign,
  useSaveDesign,
  useUserDesigns,
} from "@/lib/query/hooks/use-designs";
import { useQueryClient } from "@tanstack/react-query";
import { UploadDropzone } from "@/utils/uploadthing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Check,
  Download,
  FileText,
  Folder,
  Grid2X2,
  Image as ImageIcon,
  LoaderCircle,
  MoreHorizontal,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

type Filter = "all" | "images" | "documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function fileName(design: Design) {
  if (design.name) return design.name;
  const last = design.key.split("/").pop() || "design-file";
  const uploadThingName =
    last.match(/^[0-9a-f]{8}-[0-9a-f-]{27,}_([^/]+)$/i)?.[1] ?? last;
  try {
    return decodeURIComponent(uploadThingName);
  } catch {
    return uploadThingName;
  }
}

function fileExtension(design: Design) {
  return fileName(design).split(".").pop()?.toUpperCase() || "FILE";
}

function isImage(design: Design) {
  return (
    design.type?.startsWith("image/") ||
    ["JPG", "JPEG", "PNG"].includes(fileExtension(design))
  );
}

function formatSize(bytes?: number | null) {
  if (bytes == null || !Number.isFinite(bytes)) return "";
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: Date | string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return `Uploaded ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date)}`;
}

export default function UploadDesign({
  designs: initialDesigns,
  userId,
}: {
  designs: Design[];
  userId: string;
}) {
  const queryClient = useQueryClient();
  const { data: cachedDesigns } = useUserDesigns(userId, initialDesigns);
  const designs = cachedDesigns ?? initialDesigns;
  const saveDesignMutation = useSaveDesign(userId);
  const deleteDesignMutation = useDeleteDesign(userId);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Design | null>(null);
  const [deleting, setDeleting] = useState(false);

  const counts = useMemo(
    () => ({
      all: designs.length,
      images: designs.filter(isImage).length,
      documents: designs.filter((design) => !isImage(design)).length,
    }),
    [designs],
  );

  const visibleDesigns = useMemo(
    () =>
      designs.filter((design) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "images" ? isImage(design) : !isImage(design));
        return (
          matchesFilter &&
          fileName(design).toLowerCase().includes(query.trim().toLowerCase())
        );
      }),
    [designs, filter, query],
  );

  const refreshDesigns = async (
    metadata?: Map<string, { name: string; type: string }>,
  ) => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const refreshed = await queryClient.fetchQuery(
        designsQueryOptions(userId)
      );
      queryClient.setQueryData(
        designsQueryOptions(userId).queryKey,
        refreshed.map((design) => ({
          ...design,
          name: metadata?.get(design.key)?.name,
          type: metadata?.get(design.key)?.type,
        }))
      );
    } catch {
      toast.error("Could not refresh your designs. Please reload the page.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleUploadComplete = async (
    files: { ufsUrl: string; key: string; size: number; name: string }[],
  ) => {
    const uploadedDesigns = files.map((file) => ({
      url: file.ufsUrl,
      key: file.key,
      size: file.size,
      name: file.name,
      type: file.name.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : `image/${file.name.split(".").pop()?.toLowerCase() === "jpg" ? "jpeg" : file.name.split(".").pop()?.toLowerCase()}`,
    }));

    const results = await Promise.allSettled(
      uploadedDesigns.map((design) => saveDesignMutation.mutateAsync(design)),
    );
    const succeeded = results.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const metadata = new Map(
      uploadedDesigns.map((design) => [
        design.key,
        { name: design.name, type: design.type },
      ]),
    );
    await refreshDesigns(metadata);
    setUploading(false);
    setUploadProgress(100);

    if (succeeded === uploadedDesigns.length) {
      toast.success(
        `${succeeded} design${succeeded === 1 ? "" : "s"} uploaded successfully.`,
      );
    } else {
      toast.error(
        `${succeeded} of ${uploadedDesigns.length} files were saved. Please retry the remaining files.`,
      );
    }
  };

  const handleDownload = (design: Design) => {
    if (!design.id) {
      toast.error(
        "This design cannot be downloaded. Refresh the page and try again.",
      );
      return;
    }
    window.location.assign(
      `/api/user/designs/${encodeURIComponent(design.id)}/download?name=${encodeURIComponent(fileName(design))}`,
    );
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setDeleting(true);
    try {
      await deleteDesignMutation.mutateAsync(target);
      queryClient.setQueryData(
        designsQueryOptions(userId).queryKey,
        (current: Design[] | undefined) =>
          (current ?? []).filter((design) => design.id !== target.id)
      );
      toast.success("Design deleted.");
      setPendingDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete this design.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const filterOptions: {
    key: Filter;
    label: string;
    count: number;
    icon: typeof Grid2X2;
  }[] = [
    { key: "all", label: "All Designs", count: counts.all, icon: Grid2X2 },
    { key: "images", label: "Images", count: counts.images, icon: ImageIcon },
    {
      key: "documents",
      label: "Documents",
      count: counts.documents,
      icon: FileText,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-5 px-4 pb-8 sm:px-6 lg:px-8">
      <header className="relative isolate -mx-4 overflow-hidden rounded-b-lg border-b border-primary-border/70 bg-gradient-to-r from-[var(--surface-2)] via-[var(--surface-2)] to-[var(--primary-soft)] px-5 py-6 sm:-mx-6 sm:px-8 lg:-mx-8">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
          viewBox="0 0 1200 190"
          preserveAspectRatio="none"
        >
          <path
            d="M0 118C180 40 286 185 492 97S850 34 1200 94V0H0Z"
            fill="var(--on-color)"
            fillOpacity=".48"
          />
          <path
            d="M525 180C680 52 788 35 924 89s191 64 276-32v133H525Z"
            fill="var(--primary-border)"
            fillOpacity=".36"
          />
        </svg>
        <div className="relative flex min-h-20 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-soft/80 text-[var(--primary)]">
            <Folder className="h-7 w-7" strokeWidth={2.3} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--heading)] sm:text-[28px]">
              My Designs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your uploaded designs and use them for future orders.
            </p>
          </div>
          <div
            aria-hidden="true"
            className="ml-auto hidden h-24 w-56 items-center justify-center sm:flex"
          >
            <div className="relative flex h-16 w-16 rotate-[-10deg] items-center justify-center rounded-lg border border-primary-border bg-card/90 text-primary-soft-foreground shadow-sm">
              <FileText className="h-9 w-9" />
            </div>
            <div className="relative z-10 -ml-7 flex h-16 w-20 rotate-[4deg] items-center justify-center rounded-lg bg-[var(--primary)] text-on-color shadow-lg shadow-primary">
              <ImageIcon className="h-9 w-9" />
            </div>
            <span className="-ml-4 mt-12 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-color shadow">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
          </div>
        </div>
      </header>

      <section
        aria-label="Upload designs"
        className="rounded-lg border border-dashed border-primary-border bg-gradient-to-b from-[var(--surface-2)] to-card p-3 dark:border-primary dark:from-neutral-900 dark:to-card sm:p-5"
      >
        <UploadDropzone
          endpoint="imageUploader"
          config={{ mode: "auto" }}
          onBeforeUploadBegin={(files) => {
            const valid = files.filter((file) => {
              const ext = file.name.split(".").pop()?.toLowerCase();
              const supported = ["jpg", "jpeg", "png", "pdf"].includes(
                ext ?? "",
              );
              const withinSize = file.size <= MAX_FILE_SIZE;
              if (!supported)
                toast.error(`${file.name}: use JPG, PNG, or PDF files.`);
              else if (!withinSize)
                toast.error(`${file.name}: the maximum file size is 10 MB.`);
              return supported && withinSize;
            });
            if (valid.length) {
              setUploading(true);
              setUploadProgress(0);
            }
            return valid;
          }}
          onUploadBegin={() => {
            setUploading(true);
            setUploadProgress(0);
          }}
          onUploadProgress={setUploadProgress}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error) => {
            setUploading(false);
            setUploadProgress(0);
            toast.error(error.message || "Upload failed. Please try again.");
          }}
          appearance={{
            container: "min-h-40 border-0 bg-transparent px-2 py-4",
            uploadIcon: "h-10 w-10 text-[var(--primary)]",
            label:
              "text-sm font-semibold text-foreground dark:text-neutral-100",
            button:
              "h-9 rounded-control bg-[var(--primary)] px-4 text-sm font-medium text-on-color after:hidden hover:bg-primary",
            allowedContent: "text-xs text-muted-foreground",
          }}
          content={{
            uploadIcon: <UploadCloud className="h-10 w-10" />,
            label: "Upload Your Design",
            button: "Choose File(s)",
            allowedContent:
              "Drag and drop or browse · JPG, PNG, PDF · Max size: 10 MB per file",
          }}
        />
        {uploading && (
          <div className="mx-auto mt-1 flex max-w-md items-center gap-3 px-3 pb-2 text-xs text-primary-text">
            <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />
            <span className="shrink-0">Uploading {uploadProgress}%</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-soft">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <section
        aria-label="Filter designs"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {filterOptions.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-control border px-3 py-2 text-xs font-medium transition",
                filter === key
                  ? "border-[var(--primary)] bg-[var(--primary)] text-on-color shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary-border dark:border-on-color/10 dark:bg-card dark:text-neutral-200",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label} ({count})
            </button>
          ))}
        </div>
        <label className="relative w-full sm:max-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search designs..."
            className="h-9 rounded-control border-border bg-card pl-9 text-sm dark:border-on-color/10 dark:bg-card"
          />
        </label>
      </section>

      {refreshing && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          Refreshing designs…
        </div>
      )}
      {visibleDesigns.length > 0 ? (
        <section
          aria-label="Your uploaded designs"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {visibleDesigns.map((design) => {
            const image = isImage(design);
            const name = fileName(design);
            const extension = fileExtension(design);
            return (
              <article
                key={design.id ?? design.key}
                className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md dark:border-on-color/10 dark:bg-card"
              >
                <div className="relative m-2.5 flex h-32 items-center justify-center overflow-hidden rounded-lg border border-border-subtle bg-surface-2 dark:border-on-color/10 dark:bg-neutral-900 sm:h-36">
                  {image ? (
                    <a
                      href={design.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Preview ${name}`}
                      className="flex h-full w-full items-center justify-center"
                    >
                      <img
                        src={design.url}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    </a>
                  ) : (
                    <a
                      href={design.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-full w-full flex-col items-center justify-center gap-2 text-primary-text"
                      aria-label={`Preview ${name}`}
                    >
                      <FileText className="h-12 w-12" />
                      <span className="text-xs font-medium">
                        Open PDF preview
                      </span>
                    </a>
                  )}
                  <span
                    className={cn(
                      "absolute left-2 top-2 rounded-badge px-2 py-1 text-[9px] font-bold text-on-color",
                      extension === "PDF"
                        ? "bg-destructive"
                        : extension === "PNG"
                          ? "bg-violet"
                          : "bg-primary",
                    )}
                  >
                    {extension}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        aria-label={`More actions for ${name}`}
                        className="absolute right-2 top-2 h-7 w-7 rounded-full bg-card/95 shadow-sm opacity-100 dark:bg-neutral-800 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleDownload(design)}>
                        <Download className="h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive-text focus:text-destructive-text"
                        onSelect={() => setPendingDelete(design)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 px-3 pb-3 pt-0.5">
                  <div className="min-w-0 flex-1">
                    <h2
                      title={name}
                      className="truncate text-xs font-semibold text-foreground dark:text-neutral-100"
                    >
                      {name}
                    </h2>
                    <p className="mt-1 truncate text-[10px] text-muted-foreground">
                      {formatDate(design.createdAt)}
                      {design.size != null
                        ? ` · ${formatSize(design.size)}`
                        : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Download ${name}`}
                    onClick={() => handleDownload(design)}
                    className="h-8 w-8 shrink-0 rounded-full bg-primary-soft text-primary-text hover:bg-primary-soft dark:bg-primary/50 dark:text-primary-soft-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${name}`}
                    onClick={() => setPendingDelete(design)}
                    className="h-8 w-8 shrink-0 rounded-full bg-destructive-soft text-destructive-text hover:bg-destructive-soft dark:bg-destructive/40 dark:text-destructive-soft-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-border bg-card px-5 py-12 text-center dark:border-on-color/10 dark:bg-card">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/50">
            <Folder className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-base font-semibold text-foreground dark:text-neutral-100">
            {designs.length ? "No designs match your search" : "No designs yet"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {designs.length
              ? "Try another name or choose a different filter."
              : "Upload your first design to use it in a future order."}
          </p>
        </section>
      )}

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this design?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the design from your saved library. Files attached to
              past orders remain available with those orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="bg-destructive hover:bg-destructive"
            >
              {deleting && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete design
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
