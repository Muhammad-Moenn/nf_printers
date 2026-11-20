import { GetDBUser } from "@/app/actions/user_action";
import { NavBar } from "@/components/header";
import { Footer } from "@/components/ui/footer";
import { ServiceCatalogProvider } from "@/components/service-catalog-context";
import { getPublicServiceCatalog } from "@/lib/data/services";
import type { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const [dbUser, services] = await Promise.all([
    GetDBUser(),
    getPublicServiceCatalog(),
  ]);
  if (!dbUser) {
    // redirect("/sign-in");
    console.log("No user found, but not redirecting to sign-in page.");
    }
  return (
    <ServiceCatalogProvider services={services}>
      <div className="landing-page-background min-h-screen">
        <NavBar dbUser={dbUser}/>
        {children}
        <Footer  />
      </div>
    </ServiceCatalogProvider>
  );
}
