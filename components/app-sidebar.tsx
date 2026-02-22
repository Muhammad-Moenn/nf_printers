"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconUsers,
  IconRepeat,
} from "@tabler/icons-react"
import {  } from "lucide-react";
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  
  navMain: [
    {
      title: "Dashboard",
      url: "/user-dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Orders",
      url: "/user-dashboard/orders",
      icon: IconListDetails,
    },
    {
      title: "New Order",
      url: "/user-dashboard/new-order",
      icon: IconChartBar,
    },
    {
      title: " My Designs",
      url: "/user-dashboard/my-designs",
      icon: IconFolder,
    },
    {
      title: "Reorder",
      url: "/user-dashboard/reorder",
      icon: IconRepeat,
    },
    {
      title: "Settings",
      url: "/user-dashboard/settings",
      icon: IconSettings,
    },
  ],
  
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: IconSettings,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "#",
  //     icon: IconHelp,
  //   },
  //   {
  //     title: "Search",
  //     url: "#",
  //     icon: IconSearch,
  //   },
  // ],
 
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar  collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      
    </Sidebar>
  )
}
