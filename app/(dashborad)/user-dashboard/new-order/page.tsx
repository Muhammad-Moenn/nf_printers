import NewOrderServices from "@/components/newOrder-services"
import { SectionCards } from "@/components/section-cards";
import { cards } from "@/data/cards";

function NewOrderPage() {
  return (
    <div>
      {/* <SectionCards cards={cards}/> */}
      <div className="overflow-hidden">

        <NewOrderServices/>
      </div>
    </div>
  );
}

export default NewOrderPage;
