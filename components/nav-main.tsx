"use client";
import { IconCirclePlusFilled, IconHome } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuthUser } from "@/components/auth-provider";
import { prefetchUserDashboardRoute } from "@/lib/query/prefetch-user-dashboard";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  IconFolder,
  IconRepeat,
  IconMessageCircle,
  IconInbox,
  IconLayoutDashboard,
  IconUsers,
  IconUserCog,
  IconShoppingCart,
  IconBriefcase,
  IconAffiliate,
  IconCurrencyDollar,
  IconSettings,
} from "@tabler/icons-react";

const iconMap = {
  dashboard: IconHome,
  orders: IconShoppingCart,
  newOrder: IconCirclePlusFilled,
  designs: IconFolder,
  reorder: IconRepeat,
  settings: IconSettings,
  IconLayoutDashboard: IconLayoutDashboard,
  IconUsers: IconUsers,
  IconUserCog: IconUserCog,
  IconShoppingCart: IconShoppingCart,
  IconBriefcase: IconBriefcase,
  IconAffiliate: IconAffiliate,
  IconCurrencyDollar: IconCurrencyDollar,
  IconMessageCircle: IconMessageCircle,
  IconInbox:IconInbox
} as const;
type IconKey = keyof typeof iconMap;
export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: IconKey;
  }[];
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { user } = useAuthUser();
  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserDashboard = pathname.includes("/user-dashboard");

  const cancelDataPrefetch = () => {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
      prefetchTimer.current = null;
    }
  };

  const runDataPrefetch = (href: string) => {
    if (!user?.id) return;
    void prefetchUserDashboardRoute(queryClient, user.id, href);
  };

  const scheduleDataPrefetch = (href: string, delay = 150) => {
    if (!isUserDashboard || !user?.id) return;

    cancelDataPrefetch();

    if (delay <= 0) {
      runDataPrefetch(href);
      return;
    }

    prefetchTimer.current = setTimeout(() => {
      prefetchTimer.current = null;
      runDataPrefetch(href);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (prefetchTimer.current) clearTimeout(prefetchTimer.current);
    };
  }, [user?.id]);

  return (
    <SidebarGroup className="px-4 group-data-[collapsible=icon]:px-2">
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            const url = item.url.startsWith("/") ? item.url : `/${item.url}`;

            const baseWithLocale = `/${locale}${url}`;
            const baseWithoutLocale = url;

            const normalize = (path: string) =>
              path.split("?")[0].replace(/\/$/, "");

            const current = normalize(pathname);

            const isActive =
              current === baseWithLocale ||
              // current.startsWith(baseWithLocale + "/") ||
              current === baseWithoutLocale 
              // current.startsWith(baseWithoutLocale + "/");

            return (
              <SidebarMenuItem key={item.title} className="w-full ">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`h-10 w-full rounded-lg px-3 transition-colors group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-0! ${
                    isActive
                      ? "bg-primary cursor-pointer text-on-color shadow-sm hover:bg-primary hover:text-on-color"
                      : "text-foreground hover:bg-primary-soft hover:text-primary-text dark:text-neutral-200 dark:hover:bg-on-color/[0.06]"
                  }`}
                >
                  <Link
                    href={item.url}
                    className="flex w-full items-center justify-start gap-3 cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                    onPointerEnter={() => {
                      if (!isActive) scheduleDataPrefetch(url);
                    }}
                    onPointerLeave={cancelDataPrefetch}
                    onFocus={() => {
                      if (!isActive) scheduleDataPrefetch(url);
                    }}
                    onBlur={cancelDataPrefetch}
                    onTouchStart={() => {
                      if (!isActive) scheduleDataPrefetch(url, 0);
                    }}
                  >
                    {item.icon && <Icon className="size-5! shrink-0 group-data-[collapsible=icon]:size-5!" />}
                    <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
