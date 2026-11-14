import { GetDBUser } from "@/app/actions/user_action";
import NewOrderServices from "@/components/newOrder-services";

export default async function NewOrderPage() {
  const dbUser = await GetDBUser();

  return (
    <div>
      <div className="overflow-hidden">
        <NewOrderServices userId={dbUser?.id ?? ""} />
      </div>
    </div>
  );
}
