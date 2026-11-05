import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 px-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  );
}

export function CardsAndTableSkeleton() {
  return (
    <div className="space-y-6 px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-52 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="hidden h-11 w-40 rounded-control sm:block" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-card border border-border bg-card p-5 lg:flex-row lg:items-center"
          >
            <div className="flex min-w-0 flex-1 gap-4">
              <Skeleton className="size-24 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48 max-w-full" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <Skeleton className="h-6 w-40 max-w-full" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-9 w-28 rounded-control" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-20 rounded-control" />
              <Skeleton className="h-9 w-24 rounded-control" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-11 w-full rounded-control sm:ml-auto sm:w-40" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-3 px-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-5 gap-4 border-b p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-5 gap-4 border-b p-4 last:border-b-0"
          >
            {Array.from({ length: 5 }).map((_, columnIndex) => (
              <Skeleton key={columnIndex} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className="grid min-h-[560px] grid-cols-1 gap-4 px-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-3 rounded-lg border p-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col rounded-lg border p-4">
        <div className="flex items-center gap-3 border-b pb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-44" />
        </div>
        <div className="flex-1 space-y-4 py-6">
          <Skeleton className="h-12 w-2/3 rounded-lg" />
          <Skeleton className="ml-auto h-12 w-1/2 rounded-lg" />
          <Skeleton className="h-12 w-3/5 rounded-lg" />
          <Skeleton className="ml-auto h-12 w-2/3 rounded-lg" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5 px-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}
