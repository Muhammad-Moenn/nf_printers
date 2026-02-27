import { getMonthlyPaidAmount } from "@/app/actions/monthly-amount";
import { fetchCardsDataAndAllOrders, getMonthlyOrdersAction } from "@/app/actions/order-action";
import OrdersLineChart from "@/components/charts/line-chart";
import MonthlyPaidChart from "@/components/charts/simple-areaChart";
import OrderTable from "@/components/order-table";
import {  Order, OrderStatus } from "@/types/order";
import { CardData, SectionCards } from "@/components/section-cards";
import RealtimeAdminOrdersClient from "./RealtimeOrdersClient";

interface MonthlyOrdersProps {
  label: string;
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  inprogress?: number;
}


export default async function AdminOrderPage() {
   

  const monthlyTotal = await getMonthlyPaidAmount();

  const monthlyOrders= await getMonthlyOrdersAction();
  const {allOrders,activeOrders, pendingOrders, completedOrders, totalPaid }=await fetchCardsDataAndAllOrders();
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
  // const ordersData: any[] = allOrders.map((order:any) => ({
  
  //   id: order.id,
  //   designs: order.designs,
  //   product: order.product,
  //   service: order.service,
  //   quantity: (order.quantity),
  //   status: order.status,
  //    orderDate: order.orderDate
  //   ? order.orderDate.toISOString().split("T")[0]
  //   : "-",
  // deliveryDate: order.deliveryDate
  //   ? order.deliveryDate.toISOString().split("T")[0]
  //   : "-",
  //   amount:(order.amount),
  //   isReorder: order.isReorder,
  // }));
  return (
    <div className="">
      {/* <SectionCards cards={cards}/> */}
      <RealtimeAdminOrdersClient
        initialMonthlyTotal={monthlyTotal}
        initialMonthlyOrders={monthlyOrders}
        initialOrders={allOrders}
      />
    </div>
  );
}
