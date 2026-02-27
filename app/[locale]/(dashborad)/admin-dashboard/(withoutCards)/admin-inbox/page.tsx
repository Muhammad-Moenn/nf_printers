import AdminMessages from '@/components/admin-message'
import { currentUser } from '@clerk/nextjs/server';

async function AdminDashboardMessage() {
  const user = await currentUser();
    const userInfo = {
      name: user?.fullName ?? undefined,
      email: user?.emailAddresses[0]?.emailAddress || "No email",
      imageUrl: user?.imageUrl || "/default-avatar.png",
      username: user?.username || "user",
      userId: user?.id || "unknown",
    };
  return (
    <div>
      <AdminMessages user={userInfo}/>
    </div>
  )
}

export default AdminDashboardMessage