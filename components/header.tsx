"use client";

import { useAuthUser } from "@/components/auth-provider";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, ChevronDown, LayoutDashboard, LogIn, Menu } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import LanguageSelector from "./language-selector";
import NotificationButton from "./notification-btn";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ModeToggle } from "./ui/mode-toggle";

type HeaderUser = {
  id?: string;
  role?: string;
} | null;

type NavItem = {
  name: string;
  link: string;
};

export function NavBar({ dbUser }: { dbUser: HeaderUser }) {
  const t = useTranslations("home.header");
  const items = t.raw("navItems") as NavItem[];
  const aboutLinks = t.raw("aboutSubmenu") as NavItem[];
  const locale = useLocale();
  const pathname = usePathname();
  const isUrdu = locale === "ur";
  const { user } = useAuthUser();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);

  const dashboardHref =
    dbUser?.role === "ADMIN" ? "/admin-dashboard" : "/user-dashboard";
  const createOrderHref = user ? dashboardHref : "/sign-in";

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 12);
  });

  const getNavHref = (item: NavItem) => {
    if (item.link === "home") return "/";
    // if (item.link === "services") return "/services";
    return `/#${item.link}`;
  };

  const isActive = (item: NavItem) => {
    if (item.link === "home") return pathname === "/";
    if (item.link === "services") return pathname.startsWith("/services");
    return false;
  };

  const handleSectionLink = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem,
  ) => {
    if (pathname !== "/") return;
    const section = document.getElementById(item.link);
    if (!section) return;

    event.preventDefault();
    window.history.pushState(null, "", `/#${item.link}`);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileMenuOpen(false);
    setIsAboutMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        isScrolled
          ? "border-border bg-card/95 shadow-[var(--shadow-md)] backdrop-blur-xl dark:border-on-color/10 dark:bg-background/95"
          : "border-transparent bg-transparent dark:border-transparent dark:bg-transparent"
      }`}
    >
      <div
        dir={isUrdu ? "rtl" : "ltr"}
        className="mx-auto flex h-[76px] w-full max-w-[var(--hero-max-width)] items-center justify-between gap-4 px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]"
      >
        <Link
          href="/"
          aria-label="NF Printers home"
          className="flex shrink-0 items-center"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Image
            src="/dashboard-NFPrinters-logo.png"
            alt="NF Printers"
            priority
            width={190}
            height={72}
            className="h-auto w-[138px] sm:w-[156px] lg:w-[164px]"
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {items.map((item) => (
              <li key={item.link}>
                {item.link === "about" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="group flex h-10 items-center gap-1.5 px-2.5 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-primary-text focus-visible:text-primary-text dark:text-neutral-300 dark:hover:text-primary-soft-foreground xl:px-3 xl:text-[15px]">
                      {item.name}
                      <ChevronDown aria-hidden="true" className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isUrdu ? "end" : "start"} className="min-w-52 p-1.5">
                      {aboutLinks.map((subItem) => (
                        <DropdownMenuItem key={subItem.link} asChild className="min-h-10 rounded-lg px-3 font-medium">
                          <Link
                            href={getNavHref(subItem)}
                            onClick={(event) => handleSectionLink(event, subItem)}
                          >
                            {subItem.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={getNavHref(item)}
                    aria-current={isActive(item) ? "page" : undefined}
                    className={`relative flex h-10 items-center px-2.5 text-sm font-semibold transition-colors after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:origin-center after:rounded-full after:bg-primary after:transition-transform after:duration-200 hover:text-primary-text hover:after:scale-x-100 dark:hover:text-primary-soft-foreground xl:px-3 xl:text-[15px] xl:after:inset-x-3 ${
                      isActive(item)
                        ? "text-primary-text after:scale-x-100 dark:text-primary-soft-foreground"
                        : "text-muted-foreground after:scale-x-0 dark:text-neutral-300"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
          <div className="hidden xl:me-1 xl:block">
            <LanguageSelector />
          </div>
          <ModeToggle variant="icon" />
          <NotificationButton dbUser={dbUser} />

          {user ? (
            <Button
              asChild
              className="h-10 rounded-full bg-primary !px-4.5 font-semibold text-on-color shadow-none hover:bg-primary-hover ml-1"
            >
              <Link href={dashboardHref} className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                {isUrdu ? "ڈیش بورڈ" : "Dashboard"}
              </Link>
            </Button>
          ) : (
            <>
              
              <Button
                asChild
                className="group h-10 rounded-full bg-primary !px-5 font-semibold text-on-color shadow-[var(--shadow-sm)] hover:bg-primary-hover "
              >
                <Link href={createOrderHref} className="flex items-center gap-2">
                  {isUrdu ? "لاگ ان" : "Login"}
                  <LogIn className="h-5 w-5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet
          open={isMobileMenuOpen}
          onOpenChange={(open) => {
            setIsMobileMenuOpen(open);
            if (!open) setIsAboutMenuOpen(false);
          }}
        >
          <div className="flex items-center gap-2 lg:hidden">
            <ModeToggle variant="icon" />
            <SheetTrigger asChild>
              <button
                suppressHydrationWarning
                type="button"
                aria-label={isUrdu ? "نیویگیشن کھولیں" : "Open navigation"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-2 dark:border-on-color/10 dark:text-neutral-200 dark:hover:bg-on-color/[0.06]"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
          </div>

      <SheetContent
        side={isUrdu ? "left" : "right"}
        dir={isUrdu ? "rtl" : "ltr"}
        className="w-[min(24rem,88vw)] gap-0 border-border bg-card p-0 text-foreground shadow-[var(--shadow-xl)] dark:border-on-color/10 dark:bg-background lg:hidden"
      >
        <SheetHeader className="border-b border-border px-5 py-5 pe-14 text-start dark:border-on-color/10">
          <SheetTitle className="text-lg font-bold text-heading">
            {t("menuTitle")}
          </SheetTitle>
          <SheetDescription>{t("menuDescription")}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4">
                <LanguageSelector />
              </div>
              <nav aria-label={t("menuTitle")}>
                <ul className="grid gap-1">
                  {items.map((item) => (
                    <li key={item.link}>
                      {item.link === "about" ? (
                        <>
                          <button
                            type="button"
                            aria-expanded={isAboutMenuOpen}
                            aria-controls="mobile-about-submenu"
                            onClick={() => setIsAboutMenuOpen((open) => !open)}
                            className="flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-start text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-neutral-200 dark:hover:bg-on-color/[0.05]"
                          >
                            {item.name}
                            <ChevronDown className={`size-4 shrink-0 transition-transform duration-200 ${isAboutMenuOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {isAboutMenuOpen && (
                              <motion.ul
                                id="mobile-about-submenu"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="ms-3 mt-1 grid overflow-hidden border-s-2 border-primary/25 ps-3"
                              >
                                {aboutLinks.map((subItem) => (
                                  <li key={subItem.link}>
                                    <Link
                                      href={getNavHref(subItem)}
                                      onClick={(event) => {
                                        handleSectionLink(event, subItem);
                                        setIsMobileMenuOpen(false);
                                      }}
                                      className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary-text dark:hover:bg-primary/10 dark:hover:text-primary-soft-foreground"
                                    >
                                      {subItem.name}
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={getNavHref(item)}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex min-h-12 items-center rounded-xl px-3 text-sm font-semibold transition-colors ${
                            isActive(item)
                              ? "bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground"
                              : "text-foreground hover:bg-surface-2 dark:text-neutral-200 dark:hover:bg-on-color/[0.05]"
                          }`}
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 dark:border-on-color/10">
                <NotificationButton dbUser={dbUser} />
                {!user && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 flex-1 rounded-full border-primary-border bg-card font-semibold text-primary-text shadow-none hover:bg-primary-soft dark:border-primary/25 dark:bg-transparent dark:text-primary-soft-foreground"
                  >
                    <Link
                      href="/sign-in"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      {isUrdu ? "لاگ ان" : "Login"}
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  className="h-10 flex-1 rounded-full bg-primary font-semibold text-on-color shadow-none hover:bg-primary-hover"
                >
                  <Link
                    href={user ? dashboardHref : createOrderHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2"
                  >
                    {user ? (
                      <LayoutDashboard className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    )}
                    {user
                      ? isUrdu
                        ? "ڈیش بورڈ"
                        : "Dashboard"
                      : isUrdu
                        ? "آرڈر بنائیں"
                        : "Create Order"}
                  </Link>
                </Button>
              </div>
            </div>
      </SheetContent>
      </Sheet>
      </div>
    </motion.header>
  );
}
