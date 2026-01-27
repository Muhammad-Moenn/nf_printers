"use client"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useEffect, useState } from "react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {

const pathname = usePathname();
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
           pathname === item.url 
          // pathname.startsWith(item.url + "/");
          return(
            <SidebarMenuItem key={item.title} className="w-full">
              <SidebarMenuButton tooltip={item.title} className={`${ isActive && "bg-blue-600 cursor-pointer text-white hover:text-white hover:bg-blue-600"}`}  >
              <Link href={item.url} className="flex gap-3 justify-center items-center cursor-pointer ">
                {item.icon && <item.icon  className="w-5 h-5"/>}
                <span>{item.title}</span>
              </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
)})}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
