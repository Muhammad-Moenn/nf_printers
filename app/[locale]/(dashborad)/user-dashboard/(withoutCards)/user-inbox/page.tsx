import UserMessage from "@/components/user-message";
import { currentUser } from "@clerk/nextjs/server";

export default async function UserDashboardMessages() {
  const user = await currentUser();
  const userInfo = {
    name: user?.fullName ?? undefined,
    email: user?.emailAddresses[0]?.emailAddress || "No email",
    imageUrl: user?.imageUrl || "/default-avatar.png",
    username: user?.username || "user",
    userId: user?.id || "unknown",
  };

  if (user) {
    return (
      <div className="h-full w-full bg-gray-100  ">
        <UserMessage user={userInfo} />
      </div>
    );
  }
}
