import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

/**
 * App Router layouts are reused on client navigation, so the admin layout's
 * role check does not run for every page render. Each admin page calls this
 * guard to re-verify the role against the database on its own render.
 */
export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect("/user-dashboard");

  return user;
}
