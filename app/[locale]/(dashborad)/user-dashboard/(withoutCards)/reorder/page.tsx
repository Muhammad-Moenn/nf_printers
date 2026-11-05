import { getUserOrdersForReorder } from "@/app/actions/order-action";
import ReorderTable from "@/components/reorder-table";
import type { Order } from "@/types/order";

export default async function ReorderPage() {
  const orders = await getUserOrdersForReorder();
  const normalizedOrders = orders.map((order) => ({
    ...order,
    designs: Array.isArray(order.designs) ? order.designs as Order["designs"] : [],
    finishingOptions: Array.isArray(order.finishingOptions) ? order.finishingOptions : [],
    paperType: order.paperType ?? undefined,
    size: order.size ?? undefined,
    gsm: order.gsm ?? undefined,
    colorMode: order.colorMode ?? undefined,
    sides: order.sides ?? undefined,
    requirements: order.requirements ?? undefined,
    isReorder: order.isReorder ?? false,
    status: order.status ?? undefined,
    orderDate: order.orderDate ?? null,
    deliveryDate: order.deliveryDate ?? null,
  }));
  return <ReorderTable ordersData={normalizedOrders} />;
}
