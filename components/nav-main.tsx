"use client";
import { IconCirclePlusFilled, IconHome } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
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

  return (
    <SidebarGroup className="px-4">
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
                  tooltip={item.title}
                  className={`${
                    isActive &&
                    "bg-primary cursor-pointer text-on-color flex  hover:text-on-color hover:bg-primary"
                  } h-11 w-full rounded-lg px-3 transition-colors ${!isActive ? "text-foreground hover:bg-primary-soft hover:text-primary-text dark:text-neutral-200 dark:hover:bg-on-color/[0.06]" : "shadow-sm"}`}
                >
                  <Link
                    href={item.url}
                    className="flex w-full items-center justify-start gap-3 cursor-pointer"
                  >
                    {item.icon && <Icon className="h-5 w-5 shrink-0 " />}
                    <span className="truncate text-sm font-medium">{item.title}</span>
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
