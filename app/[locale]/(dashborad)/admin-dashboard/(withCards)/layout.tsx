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
  
 
  return (
    <div>
      
      <div className="">{children}</div>
    </div>
  );
}
