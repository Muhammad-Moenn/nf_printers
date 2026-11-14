"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Image from "next/image";
import Link from "next/link";



export function AppSidebar({ ...data }) {

  return (
    <Sidebar  collapsible="icon">
      <SidebarHeader className="border-b border-primary-border/80 px-3 py-3 group-data-[collapsible=icon]:px-0 dark:border-on-color/10">
        <SidebarMenu>
          <SidebarMenuItem className="flex h-12 items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
              <Link href="/" className="flex min-w-0 items-center group-data-[collapsible=icon]:hidden">
                <Image src="/dashboard-NFPrinters-logo.png" alt="NF Printers" width={160} height={40} className="my-1 h-9 w-[142px] object-contain object-left" />
              </Link>
              <SidebarTrigger className="shrink-0 cursor-pointer rounded-full hover:bg-gray-100/50 hover:text-gray-800 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:[&_svg]:size-5!" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <NavMain items={data.navMain} />
      </SidebarContent>
      
    </Sidebar>
  )
}
