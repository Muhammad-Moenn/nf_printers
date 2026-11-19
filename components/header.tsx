"use client";

import { useAuthUser } from "@/components/auth-provider";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import LanguageSelector from "./language-selector";
import NotificationButton from "./notification-btn";
import { Button } from "./ui/button";
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
  const locale = useLocale();
  const pathname = usePathname();
  const isUrdu = locale === "ur";
  const { user } = useAuthUser();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <div className="hidden xl:block">
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

        <div className="flex items-center gap-1.5 lg:hidden">
          <ModeToggle variant="icon" />
          <button
            suppressHydrationWarning
            type="button"
            aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-2 dark:border-on-color/10 dark:text-neutral-200 dark:hover:bg-on-color/[0.06]"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-card dark:border-on-color/10 dark:bg-background lg:hidden"
          >
            <div
              dir={isUrdu ? "rtl" : "ltr"}
              className="mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] py-4 sm:px-[var(--space-6)] lg:px-[var(--space-8)]"
            >
              <div className="mb-4">
                <LanguageSelector />
              </div>
              <nav>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {items.map((item) => (
                    <li key={item.link}>
                      <Link
                        href={getNavHref(item)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex min-h-11 items-center border-l-2 px-3 text-sm font-semibold transition-colors rtl:border-l-0 rtl:border-r-2 ${
                          isActive(item)
                            ? "border-primary bg-primary-soft text-primary-text dark:border-primary dark:bg-primary/10 dark:text-primary-soft-foreground"
                            : "border-transparent text-foreground hover:border-border-strong hover:bg-surface-2 dark:text-neutral-200 dark:hover:border-on-color/20 dark:hover:bg-on-color/[0.05]"
                        }`}
                      >
                        {item.name}
                      </Link>
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
