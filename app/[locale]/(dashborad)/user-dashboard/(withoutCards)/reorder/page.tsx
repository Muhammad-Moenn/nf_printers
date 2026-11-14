import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import ReorderTable from "@/components/reorder-table";

export default async function ReorderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <ReorderTable userId={user.id} />;
}
