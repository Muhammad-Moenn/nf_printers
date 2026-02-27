import { fetchCardsDataAndAllOrders } from "@/app/actions/order-action";
import { CardData, SectionCards } from "@/components/section-cards";
import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";
import RealtimeAdminCardSectionClient from "./RealtimeAdminSectionCardClient";

export default async function AdminDashboardLayoutWithCards({
  children,
}: {
  children: ReactNode;
}) {
  const carddata = {
  totalUsers: 10,
  totalEmployees: 20,
  totalOrders: 30,
  pendingOrders: 49,
  cancelledOrders: 23,
  totalRevenue: 33,
};
 
  return (
    <div>
      <RealtimeAdminCardSectionClient data={carddata}/>
      <div className="">{children}</div>
    </div>
  );
}
