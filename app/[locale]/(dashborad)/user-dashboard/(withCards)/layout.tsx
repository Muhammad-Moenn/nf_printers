import { getDashboardCardsData } from "@/lib/dashboard-data";
import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";
import RealtimeReordersClient from "./RealtimeSectionCardClient";

export default async function DesignDashboardLayoutWithCards({
  children,
}: {
  children: ReactNode;
}) {
  const data = await getDashboardCardsData();
 
  return (
    <div className="space-y-3">
      <RealtimeReordersClient Data={data} />
      <div className="">{children}</div>
    </div>
  );
}
