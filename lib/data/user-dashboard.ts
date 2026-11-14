import { getUserDesigns as getUserDesignsAction } from "@/app/actions/designs-action";
import { getUserOrdersForReorder as getUserOrdersForReorderAction } from "@/app/actions/order-action";
import { getOrCreateConversation as getOrCreateConversationAction } from "@/app/actions/user-message";

export async function getUserDesigns() {
  return getUserDesignsAction();
}

export async function getUserOrdersForReorder() {
  return getUserOrdersForReorderAction();
}

export async function getOrCreateConversation() {
  return getOrCreateConversationAction();
}
