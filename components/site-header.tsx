import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./ui/mode-toggle"
import LanguageSelector from "./language-selector"
import { CartButton } from "./CartButton"
import NotificationButton from "./notification-btn"
import { NavUser } from "./nav-user"
import { getCurrentUser } from "@/lib/auth"


export async function SiteHeader() {
  const user = await getCurrentUser()
  
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
          <h1 className="text-xl font-medium">My Account</h1>
          <div className="ml-auto flex items-center gap-2">
            {/* <LanguageSelector/> */}
            <ModeToggle />
          </div>
        </div>
      </header>
    );
  }
  
  const data = {
    user: {
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
      email: user.email,
      avatar: user.avatarUrl ?? undefined,
    },
  }

  const dbUser = user;
  return (
    <header className="flex  shrink-0 items-center gap-2 border-b border-primary-border/80 bg-card/90 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) dark:border-on-color/10 dark:bg-card">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-8 pb-2.5">
        {/* <SidebarTrigger className="shrink-0" /> */}
        {/* <Separator
          orientation="vertical"
          className="mx-1 data-[orientation=vertical]:h-4 cursor-pointer"
        /> */}
        <h1 className="text-lg font-semibold tracking-tight text-foreground dark:text-neutral-100">
          My Account
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {/* <LanguageSelector/> */}
          <ModeToggle />
          <NotificationButton dbUser={dbUser} />
          <NavUser user={data.user} />
        </div>
      </div>
    </header>
  );
}
