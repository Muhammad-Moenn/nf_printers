import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
 const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin-dashboard",
      icon: "IconLayoutDashboard",
    },
    {
      title: "Users",
      url: "/admin-dashboard/users",
      icon: "IconUsers",
    },
    {
      title: "Orders",
      url: "/admin-dashboard/orders",
      icon: "IconShoppingCart",
    },
    {
      title: "Employees",
      url: "/admin-dashboard/employees",
      icon: "IconUserCog",
    },
    {
      title: "Services",
      url: "/admin-dashboard/services",
      icon: "IconBriefcase",
    },
    // {
    //   title: "Affiliates",
    //   url: "/admin-dashboard/affiliates",
    //   icon: "IconAffiliate",
    // },
    {
      title: "Revenue",
      url: "/admin-dashboard/revenue",
      icon: "IconCurrencyDollar",
    },
    {
      title: "Inbox",
      url: "/admin-dashboard/admin-inbox",
      icon: "IconInbox",
    },
    {
      title: "Settings",
      url: "/admin-dashboard/settings",
      icon: "settings",
    },
  ],
};
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" {...data} />
      <SidebarInset className="rounded-lg">
        <SiteHeader />
        
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-1 flex-col">{children}</div>
              
            </div>
          </div>
        </div>
      </SidebarInset>
     
    </SidebarProvider>
  );
}
