import { fetchCardsDataAndAllOrders } from "@/app/actions/order-action";
import NewOrderServices from "@/components/newOrder-services"
import { CardData, SectionCards } from "@/components/section-cards";

async function NewOrderPage() {

const { activeOrders, pendingOrders, completedOrders, totalPaid } =
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
  return (
    <div>
      {/* <SectionCards cards={cards}/> */}
      <div className="overflow-hidden">
       {/* <SectionCards cards={cards}/> */}
        <NewOrderServices/>
      </div>
    </div>
  );
}

export default NewOrderPage;
