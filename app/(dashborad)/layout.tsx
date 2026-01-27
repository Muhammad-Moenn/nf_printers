import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchCardsDataAndAllOrders } from "../actions/order-action";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { activeOrders, pendingOrders, completedOrders, totalPaid } =
    await fetchCardsDataAndAllOrders();

  const cards = [
    {
      title: "Active Orders",
      value: Number(activeOrders.length).toFixed(2),
      description: "Orders currently in progress",
      icon: "package",
    },
    {
      title: "Pending Quotes",
      value: Number(pendingOrders.length).toFixed(2),
      description: "Awaiting approval",
      icon: "file-text",
    },
    {
      title: "Completed Orders",
      value:Number(completedOrders.length).toFixed(2),
      description: "Successfully delivered",
      icon: "check-circle",
    },
    {
      title: "Total Paid",
      value: new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(totalPaid),
      description: "Lifetime payments",
      icon: "wallet",
    },
  ];
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" />
      <SidebarInset className="rounded-lg">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards cards={cards} />
              <div className="flex flex-1 flex-col">{children}</div>
              {/* <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
                  <DataTable data={data} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </SidebarProvider>
  );
}
