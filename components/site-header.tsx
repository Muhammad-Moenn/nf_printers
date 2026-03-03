import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./ui/mode-toggle"
import LanguageSelector from "./language-selector"
import { CartButton } from "./CartButton"
import NotificationButton from "./notification-btn"
import { NavUser } from "./nav-user"
import { currentUser } from "@clerk/nextjs/server"
import { GetDBUser } from "@/app/actions/user_action"


export async function SiteHeader() {
  const user = await currentUser()
  
  // If no user, return a minimal header without user-specific elements
  if (!user) {
    return (
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-4 cursor-pointer"
          />
          <h1 className="text-xl font-medium">Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSelector/>
            <ModeToggle />
          </div>
        </div>
      </header>
    )
  }
  
  const data = {
    user: {
      name: user?.fullName ?? undefined,
      email: user?.emailAddresses[0]?.emailAddress ?? undefined,
      avatar: user?.imageUrl ?? undefined,
    },
  }

  const dbUser = await GetDBUser()
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 data-[orientation=vertical]:h-4 cursor-pointer"
        />
        <h1 className="text-xl font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          
           <LanguageSelector/>
           <ModeToggle />
           <NotificationButton  dbUser ={ dbUser }/>
           <CartButton />
           <NavUser user={data.user} />
        </div>
      </div>
    </header>
  )
}
