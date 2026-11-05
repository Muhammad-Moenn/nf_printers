// import { getAllConversations } from '@/app/actions/admin-message';
import { GetDBUser } from '@/app/actions/user_action';
import AdminMessages from '@/components/admin-message'
import { getCurrentUser } from '@/lib/auth';

async function AdminDashboardMessage() {
  const dbUser = await GetDBUser();
  const user = await getCurrentUser();
    const userInfo = {
      name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || undefined,
      email: user?.email || "No email",
      imageUrl: user?.avatarUrl || "/default-avatar.png",
      username: user?.email.split("@")[0] || "user",
      userId: dbUser?.id || "unknown",
    };

  return (
    <div className="min-h-[85vh] w-full bg-transparent">
      <AdminMessages user={userInfo} />
    </div>
  )
}

export default AdminDashboardMessage
