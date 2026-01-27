import { getMonthlyPaidAmount } from "@/app/actions/monthly-amount";
import { fetchCardsDataAndAllOrders, getMonthlyOrdersAction } from "@/app/actions/order-action";
import OrdersLineChart from "@/components/charts/line-chart";
import MonthlyPaidChart from "@/components/charts/simple-areaChart";
import OrderTable from "@/components/order-table";
import { OrderStatus } from "@/types/order";

interface MonthlyOrdersProps {
  label: string;
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  inprogress?: number;
}

export interface Order {
   id: string;
  product: string;
  service: string;
  quantity: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate: string;
  amount: number;
}
export default async function OrderPage() {
  const monthlyTotal = await getMonthlyPaidAmount();

  const monthlyOrders= await getMonthlyOrdersAction();
  const {allOrders}=await fetchCardsDataAndAllOrders();
  const ordersData: Order[] = allOrders.map((order:any) => ({
    id: order.id,
    product: order.product,
    service: order.service,
    quantity: Number(order.quantity),
    status: order.status,
     orderDate: order.orderDate
    ? order.orderDate.toISOString().split("T")[0]
    : "-",
  deliveryDate: order.deliveryDate
    ? order.deliveryDate.toISOString().split("T")[0]
    : "-",
    amount: Number(order.amount),
  }));
  return (
    <div className="">
      {/* <SectionCards cards={cards}/> */}
      <div className="px-4  md:px-6 -ml-5 overflow-hidden flex gap-24">
        <div className="flex flex-col w-full justify-start items-start gap-8">
          <span className="text-lg font-medium px-6 text-gray-600 dark:text-gray-200">
            Monthly Order Tracing
          </span>
          <OrdersLineChart data={ monthlyOrders} />
        </div>
        <div className="flex flex-col w-full justify-start items-start gap-8">
          <span className="text-lg font-medium px-6 text-gray-600 dark:text-gray-200">
            Monthly Paid Amount tracing
          </span>
          <MonthlyPaidChart data={monthlyTotal} />
        </div>
      </div>
      <h2 className="px-6 text-xl font-semibold mb-4 mt-10 text-gray-800 dark:text-gray-200">
        My Orders
      </h2>
      <OrderTable  allOrders={ ordersData}/>
    </div>
  );
}
