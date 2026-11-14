import {
  SaveOrder as SaveOrderAction,
  UpdateOrder as UpdateOrderAction,
  getOrderById as getOrderByIdAction,
  getOrderForReorder as getOrderForReorderAction,
  getUserOrdersForReorder as getUserOrdersForReorderAction,
} from "@/app/actions/order-action";

export async function SaveOrder(
  ...args: Parameters<typeof SaveOrderAction>
) {
  return SaveOrderAction(...args);
}

export async function UpdateOrder(
  ...args: Parameters<typeof UpdateOrderAction>
) {
  return UpdateOrderAction(...args);
}

export async function getOrderById(orderId: string) {
  return getOrderByIdAction(orderId);
}

export async function getOrderForReorder(orderId: string) {
  return getOrderForReorderAction(orderId);
}

export async function getUserOrdersForReorder() {
  return getUserOrdersForReorderAction();
}
