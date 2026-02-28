// import { getAllConversations } from '@/app/actions/admin-message';
import { GetDBUser } from '@/app/actions/user_action';
import AdminMessages from '@/components/admin-message'
import { currentUser } from '@clerk/nextjs/server';

async function AdminDashboardMessage() {
  const dbUser = await GetDBUser();
  const user = await currentUser();
    const userInfo = {
      name: user?.fullName ?? undefined,
      email: user?.emailAddresses[0]?.emailAddress || "No email",
      imageUrl: user?.imageUrl || "/default-avatar.png",
      username: user?.username || "user",
      userId: dbUser?.id || "unknown",
    };

  return (
    <div className='h-[80vh] w-full bg-gray-100  '>
      <AdminMessages user={userInfo} />
    </div>
  )
}

export default AdminDashboardMessage