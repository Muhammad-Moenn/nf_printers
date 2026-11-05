import { redirect } from "next/navigation";

import { getAdminUsersDashboardDataAction } from "@/app/actions/admin-users-action";
import RealtimeAdminUsersClient from "./RealtimeAdminUsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const initialData = await getAdminUsersDashboardDataAction();

  if (!initialData) {
    redirect("/sign-in");
  }

  return <RealtimeAdminUsersClient initialData={initialData} />;
}
