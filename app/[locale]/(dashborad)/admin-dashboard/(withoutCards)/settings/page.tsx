import SettingsForms from "@/components/setting-forms";
import { requireAdminPage } from "@/lib/auth-guards";

async function AdminSettingPage() {
  const user = await requireAdminPage();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl xl:text-3xl font-semibold">Account Settings</h1>
      <SettingsForms
        userId={user.id}
        user={{
          id: user.id,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          emailNotifications: user.emailNotifications,
          marketingEmails: user.marketingEmails,
        }}
      />
    </div>
  );
}

export default AdminSettingPage;
