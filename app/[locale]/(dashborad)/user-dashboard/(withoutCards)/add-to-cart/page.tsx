import { GetDBUser } from "@/app/actions/user_action";
import CartPageContent from "@/components/cart-page-content";

export default async function CartPage() {
  const dbUser = await GetDBUser();

  return (
    <CartPageContent
      newOrderHref="/user-dashboard/new-order"
      userId={dbUser?.id ?? ""}
    />
  );
}
