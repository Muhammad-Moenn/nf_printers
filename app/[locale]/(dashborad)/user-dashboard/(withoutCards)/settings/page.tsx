import { GetDBUser } from "@/app/actions/user_action";
import SettingsForms from "@/components/setting-forms";
import { redirect } from "next/navigation";

async function SettingPage() {
  const user = await GetDBUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-2">
        <p className="text-sm font-medium text-primary">My Account</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Account Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your profile and account preferences.</p>
      </header>
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

export default SettingPage;
