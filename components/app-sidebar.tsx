"use client"

import * as React from "react"
import {
  
   IconInnerShadowTop,
} from "@tabler/icons-react";

import {  } from "lucide-react";
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 justify-between">
            {/* <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            > */}
              <Link href="/" className="flex items-center ">
                <Image src="/dashboard-NFPrinters-logo.png" alt="Logo" width={160} height={14} className=" object-cover text-left aspect-auto my-2" />
              </Link>
              <SidebarTrigger className=" cursor-pointer" />
            {/* </SidebarMenuButton> */}
          </SidebarMenuItem>
          <hr className="w-[98%] mb-2"/>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      
    </Sidebar>
  )
}
