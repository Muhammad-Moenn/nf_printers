"use client";
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  IconDashboard,
  IconListDetails,
  IconChartBar,
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
  dashboard: IconDashboard,
  orders: IconListDetails,
  newOrder: IconChartBar,
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
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
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
                    "bg-blue-600 cursor-pointer text-white flex  hover:text-white hover:bg-blue-600"
                  }`}
                >
                  <Link
                    href={item.url}
                    className="flex gap-3 justify-center items-center cursor-pointer "
                  >
                    {item.icon && <Icon className="w-5 h-5" />}
                    <span>{item.title}</span>
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
