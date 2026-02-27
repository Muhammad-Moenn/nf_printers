import { fetchCardsDataAndAllOrders } from "@/app/actions/order-action";
import { CardData, SectionCards } from "@/components/section-cards";
import type { ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";
import RealtimeReordersClient from "./RealtimeSectionCardClient";

export default async function DesignDashboardLayoutWithCards({
  children,
}: {
  children: ReactNode;
}) {
  const data =
    await fetchCardsDataAndAllOrders();
 
  return (
    <div >
      <RealtimeReordersClient Data={data} />
      <div className="">{children}</div>
    </div>
  );
}
