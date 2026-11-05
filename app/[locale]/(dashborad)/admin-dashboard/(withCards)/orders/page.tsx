import { getAdminOrdersPageData } from "@/app/actions/admin-dashboard-action";
import { redirect } from "next/navigation";

import RealtimeAdminOrdersClient from "./RealtimeAdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage() {
  const ordersData = await getAdminOrdersPageData();

  if (!ordersData) {
    redirect("/sign-in");
  }

  return (
    <div className="overflow-hidden" >
    <RealtimeAdminOrdersClient initialData={ordersData} />
    </div>
  );
}
