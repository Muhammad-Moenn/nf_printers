"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CardsAndTableSkeleton,
  DashboardPageSkeleton,
  FormSkeleton,
  InboxSkeleton,
  TableSkeleton,
} from "@/components/dashboard-loading";

function LoadingContent({ targetPath }: { targetPath: string | null }) {
  const path = targetPath ?? "";

  if (path.includes("inbox")) {
    return <InboxSkeleton />;
  }

  if (path.includes("new-order") || path.includes("settings")) {
    return <FormSkeleton />;
  }

  if (
    path.includes("orders") ||
    path.includes("users") ||
    path.includes("employees") ||
    path.includes("services") ||
    path.includes("revenue")
  ) {
    return <CardsAndTableSkeleton />;
  }

  if (
    path.includes("reorder") ||
    path.includes("my-designs") ||
    path.includes("add-to-cart")
  ) {
    return <TableSkeleton />;
  }

  return <DashboardPageSkeleton />;
}

export function DashboardNavigationLoading() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as HTMLElement).closest("a");
      if (!link?.href || link.target === "_blank") {
        return;
      }

      const url = new URL(link.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      const nextPath = url.pathname.replace(/\/$/, "") || "/";
      const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
      if (nextPath === currentPath || !nextPath.includes("dashboard")) {
        return;
      }

      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      setTargetPath(nextPath);
      setIsLoading(true);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    hideTimer.current = setTimeout(() => {
      setIsLoading(false);
      setTargetPath(null);
    }, 450);
  }, [pathname, isLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 bg-background/95 py-4">
      <LoadingContent targetPath={targetPath} />
    </div>
  );
}
