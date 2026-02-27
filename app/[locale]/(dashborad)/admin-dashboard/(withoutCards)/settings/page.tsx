import { GetDBUser } from "@/app/actions/user_action";
import SettingsForms from "@/components/setting-forms";
import { redirect } from "next/navigation";

async function AdminSettingPage() {
const user =await GetDBUser()
if(!user){
  redirect("/sign-in")
}

  return (
     <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl xl:text-3xl font-semibold">Account Settings</h1>
      <SettingsForms  user={{
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email,
        }} />
    </div>
  )
}

export default AdminSettingPage;
