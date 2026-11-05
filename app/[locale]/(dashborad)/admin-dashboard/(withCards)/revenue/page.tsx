import { redirect } from "next/navigation";

import { getAdminRevenueManagementData } from "@/app/actions/admin-dashboard-action";
import AdminRevenueManagementClient from "./AdminRevenueManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const payload = await getAdminRevenueManagementData("this-month");

  if (!payload) {
    redirect("/sign-in");
  }

  return <AdminRevenueManagementClient initialData={payload} />;
}
