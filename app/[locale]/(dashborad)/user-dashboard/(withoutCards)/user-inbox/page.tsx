import { getOrCreateConversation } from "@/app/actions/user-message";
import { GetDBUser } from "@/app/actions/user_action";
import UserMessage from "@/components/user-message";
import { getCurrentUser } from "@/lib/auth";

export default async function UserDashboardMessages() {
  const user = await getCurrentUser();
  const dbUuser = await GetDBUser();
  const userInfo = {
    name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || undefined,
    email: user?.email || "No email",
    imageUrl: user?.avatarUrl || "/default-avatar.png",
    username: user?.email.split("@")[0] || "user",
    userId: dbUuser?.id || "unknown",
  };

  const conversation = user ? await getOrCreateConversation() : null;

  if (user && conversation) {
    return (
      <div className="w-full min-h-0 px-3 pb-4 sm:px-5 lg:px-6">
        <UserMessage
          user={userInfo}
          conversationId={conversation.id}
          initialMessages={conversation.messages.map((message) => ({
            ...message,
            createdAt: message.createdAt.toISOString(),
          }))}
        />
      </div>
    );
  }

  return <div className="mx-3 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground sm:mx-5">Your inbox is unavailable right now. Please refresh the page.</div>;
}
