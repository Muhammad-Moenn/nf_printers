import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

import RealtimeDashboardOverviewClient from "./RealtimeDashboardOverviewClient";

export default async function MainPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <RealtimeDashboardOverviewClient userId={user.id} />;
}
