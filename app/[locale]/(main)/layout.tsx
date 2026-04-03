import { GetDBUser } from "@/app/actions/user_action";
import { NavBar } from "@/components/header";
import { Footer } from "@/components/ui/footer";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const dbUser = await GetDBUser();
  if (!dbUser) {
    // redirect("/sign-in");
    console.log("No user found, but not redirecting to sign-in page.");
    }
  return (
    <div>
      <NavBar dbUser={dbUser}/>
      {children}
      <Footer  />
    </div>
  );
}
