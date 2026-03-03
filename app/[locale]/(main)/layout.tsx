import { GetDBUser } from "@/app/actions/user_action";
import { NavBar } from "@/components/header";
import { Footer } from "@/components/ui/footer";
import type { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const dbUuser = await GetDBUser();
  
  return (
    <div>
      <NavBar dbUuser={dbUuser}/>
      {children}
      <Footer  />
    </div>
  );
}
