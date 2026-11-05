import { GetDBUser } from "@/app/actions/user_action";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardNavigationLoading } from "@/components/dashboard-navigation-loading";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "@/i18n/navigation";
import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";

export default async function UserDashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
const dbUser = await GetDBUser();
if (dbUser) {
    if (dbUser?.role === "ADMIN") {
      redirect({ href: "/admin-dashboard", locale });
    }
    // redirect(`/${locale}/user-dashboard`);
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 18)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" {...data} />
      <SidebarInset className="bg-[var(--surface-2)] dark:bg-background">
        <SiteHeader />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-5 md:py-4">
              <div className="relative flex flex-1 flex-col">
                <DashboardNavigationLoading />
                {children}
              </div>
              
            </div>
          </div>
        </div>
      </SidebarInset>
     
    </SidebarProvider>
  );
}
