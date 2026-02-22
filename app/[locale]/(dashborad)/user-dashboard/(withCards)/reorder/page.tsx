import { fetchCardsDataAndAllOrders } from '@/app/actions/order-action';
import ReorderTable from '@/components/reorder-table'
import { Order } from '@/types/order';
import React from 'react'
import RealtimeReordersClient from './RealtimeReordersClient';
import { CardData, SectionCards } from '@/components/section-cards';

async function  ReorderPage() {
   const { activeOrders, pendingOrders, completedOrders, totalPaid, allOrders } =
       await fetchCardsDataAndAllOrders();
   
     const cards:CardData[] = [
       {
         title: "Active Orders",
         value: Number(activeOrders.length).toFixed(2),
         description: "Orders currently in progress",
         icon: "package",
       },
       {
         title: "Pending Quotes",
         value: Number(pendingOrders.length).toFixed(2),
         description: "Awaiting approval",
         icon: "file-text",
       },
       {
         title: "Completed Orders",
         value:Number(completedOrders.length).toFixed(2),
         description: "Successfully delivered",
         icon: "check-circle",
       },
       {
         title: "Total Paid",
         value: new Intl.NumberFormat("en-PK", {
         style: "currency",
         currency: "PKR",
       }).format(totalPaid),
         description: "Lifetime payments",
         icon: "wallet",
       },
     ];
   const normalizedOrders: any[] = allOrders.map((o) => ({
  ...o,
  designs: Array.isArray(o.designs) ? (o.designs as { url: string; key: string }[]) : [],
  finishingOptions: Array.isArray(o.finishingOptions) ? o.finishingOptions : [],
  paperType: o.paperType ?? "",
  size: o.size ?? "",
  colorMode: o.colorMode ?? "",
  sides: o.sides ?? "",
  gsm: o.gsm ?? "",
  requirements: o.requirements ?? "",
}));
  return (
    <div>
      <>
      {/* <SectionCards cards={cards}/> */}
      <RealtimeReordersClient ordersData={normalizedOrders}/>
      </>
    </div>
  )
}

export default ReorderPage
