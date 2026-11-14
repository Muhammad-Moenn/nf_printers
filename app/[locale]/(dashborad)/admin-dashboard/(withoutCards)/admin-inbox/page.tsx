import AdminMessages from "@/components/admin-message";
import { requireAdminPage } from "@/lib/auth-guards";

async function AdminDashboardMessage() {
  const user = await requireAdminPage();

  const userInfo = {
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
    email: user.email || "No email",
    imageUrl: user.avatarUrl || "/default-avatar.png",
    username: user.email.split("@")[0] || "user",
    userId: user.id,
  };

  return (
    <div className="min-h-[85vh] w-full bg-transparent">
      <AdminMessages user={userInfo} />
    </div>
  );
}

export default AdminDashboardMessage;
