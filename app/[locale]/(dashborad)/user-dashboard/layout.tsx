import { GetDBUser } from "@/app/actions/user_action";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";

export default async function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
 const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/user-dashboard",
      icon: "dashboard",
    },
    {
      title: "My Orders",
      url: "/user-dashboard/orders",
      icon: "orders",
    },
    {
      title: "New Order",
      url: "/user-dashboard/new-order",
      icon: "newOrder",
    },
    {
      title: "My Designs",
      url: "/user-dashboard/my-designs",
      icon: "designs",
    },
    {
      title: "Reorder",
      url: "/user-dashboard/reorder",
      icon: "reorder",
    },
    {
      title: "Inbox",
      url: "/user-dashboard/user-inbox",
      icon: "IconMessageCircle",
    },
    {
      title: "Settings",
      url: "/user-dashboard/settings",
      icon: "settings",
    },
  ],
};
const locale=await getLocale();
const dbUser = await GetDBUser();
if (dbUser) {
    if (dbUser?.role === "ADMIN") {
      redirect(`/${locale}/admin-dashboard`);
    }
    // redirect(`/${locale}/user-dashboard`);
  }
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
