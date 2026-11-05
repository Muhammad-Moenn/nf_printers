import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/sign-in", locale });

  // Role-based redirect
  // if (dbUser?.role === "ADMIN") {
  //   redirect("/admin-dashboard");
  // }

  // redirect("/user-dashboard");

  return (
     
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-1 flex-col">{children}</div>
            </div>
          </div>
           
        </div>
      
     
  );
}
