import { redirect } from "next/navigation";
import { getAdminServicesAction } from "@/app/actions/admin-services-action";
import RealtimeAdminServicesClient from "./RealtimeAdminServicesClient";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const initialData = await getAdminServicesAction();
  if (!initialData) redirect("/sign-in");
  
  return <RealtimeAdminServicesClient initialData={initialData} />;
}
