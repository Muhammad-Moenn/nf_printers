import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUp,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

type FooterLink = {
  text: string;
  url: string;
  icon?: string;
};

type FooterMenuSection = {
  title: string;
  links: FooterLink[];
};

const socialIconMap = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
} as const;

function FooterAnchor({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const isExternal = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const t = useTranslations("home.footer");
  const items = t.raw("menuItems") as FooterMenuSection[];
  const bottomLinks = t.raw("bottomLinks") as FooterLink[];
  const locale = useLocale();
  const isRTL = locale === "ur";

  const lastSection = items[items.length - 1];
  const socialLinks =
    lastSection?.links.some((link) => Boolean(link.icon)) === true
      ? lastSection.links
      : [];
  const menuColumns = socialLinks.length > 0 ? items.slice(0, -1) : items;

  const linkClassName =
    "text-[length:var(--font-size-sm)] leading-6 text-muted-foreground transition-colors duration-200 hover:text-primary-text focus-visible:text-primary-text focus-visible:outline-none dark:text-neutral-300 dark:hover:text-primary-soft-foreground motion-reduce:transition-none";

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "relative overflow-hidden border-t border-border bg-card text-foreground",
        "dark:border-on-color/10 dark:bg-background dark:text-on-color",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(circle_at_100%_100%,color-mix(in_oklab,var(--primary)_9%,transparent),transparent_55%)]",
          "dark:bg-[radial-gradient(circle_at_100%_100%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_55%)]",
        )}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-[var(--space-4)] pb-[var(--space-6)] pt-[var(--space-12)] sm:px-[var(--space-6)] sm:pt-[var(--space-16)] lg:px-[var(--space-8)]">
        <div className="grid grid-cols-2 gap-x-[var(--space-8)] gap-y-[var(--space-10)] sm:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-x-[var(--space-12)]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link
              href="/"
              aria-label="NF Printers home"
              className="inline-flex items-center"
            >
              <Image
                src="/dashboard-NFPrinters-logo.png"
                alt="NF Printers"
                width={289}
                height={100}
                className="h-auto w-[168px] sm:w-[180px]"
              />
            </Link>

            <p className="mt-[var(--space-4)] max-w-sm text-[length:var(--font-size-sm)] leading-6 text-muted-foreground dark:text-neutral-300">
              {t("tagline")}
            </p>

            <ul className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-2)]">
              {socialLinks.map((link, linkIdx) => {
                const Icon =
                  socialIconMap[
                    (link.icon ?? "") as keyof typeof socialIconMap
                  ] ?? Globe;

                return (
                  <li key={`${link.text}-${linkIdx}`}>
                    <FooterAnchor
                      href={link.url}
                      ariaLabel={link.text}
                      className={cn(
                        "flex h-[var(--space-10)] w-[var(--space-10)] items-center justify-center rounded-full",
                        "border border-border bg-card text-muted-foreground shadow-[var(--shadow-sm)]",
                        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-border",
                        "hover:bg-primary-soft hover:text-primary-text",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        "dark:border-on-color/15 dark:bg-on-color/5 dark:text-neutral-300",
                        "dark:hover:border-primary/30 dark:hover:bg-primary/10 dark:hover:text-primary-soft-foreground",
                        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      )}
                    >
                      <Icon
                        className="h-[var(--space-4)] w-[var(--space-4)]"
                        aria-hidden="true"
                      />
                    </FooterAnchor>
                  </li>
                );
              })}
            </ul>
          </div>

          {menuColumns.map((section, sectionIdx) => (
            <nav
              key={`${section.title}-${sectionIdx}`}
              aria-label={section.title}
              className="col-span-1"
            >
              <h3 className="text-[length:var(--font-size-sm)] font-semibold text-heading dark:text-on-color">
                {section.title}
              </h3>

              <ul className="mt-[var(--space-4)] space-y-[var(--space-3)]">
                {section.links.map((link, linkIdx) => (
                  <li key={`${link.text}-${linkIdx}`}>
                    <FooterAnchor href={link.url} className={linkClassName}>
                      {link.text}
                    </FooterAnchor>
                  </li>
                ))}

                {sectionIdx === 0 && (
                  <li>
                    <FooterAnchor
                      href="/services"
                      className={cn(
                        linkClassName,
                        "group inline-flex items-center gap-[var(--space-1)] font-semibold text-primary-text",
                        "hover:text-primary-hover dark:text-primary-soft-foreground dark:hover:text-primary-soft-foreground",
                      )}
                    >
                      {t("moreServices")}
                      <ArrowRight
                        className={cn(
                          "h-[var(--space-4)] w-[var(--space-4)] transition-transform duration-200 motion-reduce:transition-none",
                          isRTL
                            ? "rotate-180 group-hover:-translate-x-0.5"
                            : "group-hover:translate-x-0.5",
                        )}
                        aria-hidden="true"
                      />
                    </FooterAnchor>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-[var(--space-10)] flex justify-end">
            <Link
              href="/#hero"
              aria-label={t("backToHome")}
              title={t("backToHome")}
            className={cn(
              "group flex h-[var(--space-10)] w-[var(--space-10)] shrink-0 items-center justify-center",
              "rounded-full bg-primary text-on-color shadow-[var(--shadow-sm)]",
              "transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[var(--shadow-md)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:focus-visible:ring-offset-background",
              "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            )}
          >
            <ArrowUp
              className="h-[var(--space-5)] w-[var(--space-5)] transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)] border-t border-border/80 pt-[var(--space-6)] dark:border-on-color/10 md:flex-row md:items-center md:justify-between">
          <p className="text-[length:var(--font-size-xs)] leading-5 text-muted-foreground dark:text-neutral-300">
            {t("copyright")}
          </p>

          <div className="flex w-full flex-wrap items-center justify-between gap-[var(--space-4)] md:w-auto md:justify-end">
            <ul className="flex flex-wrap items-center gap-x-[var(--space-6)] gap-y-[var(--space-2)]">
              {bottomLinks.map((link, linkIdx) => (
                <li key={`${link.text}-${linkIdx}`}>
                  <FooterAnchor
                    href={link.url}
                    className={cn(
                      "text-[length:var(--font-size-xs)] leading-5 text-muted-foreground underline-offset-4",
                      "transition-colors duration-200 hover:text-primary-text hover:underline",
                      "focus-visible:text-primary-text focus-visible:outline-none",
                      "dark:text-neutral-300 dark:hover:text-primary-soft-foreground",
                      "motion-reduce:transition-none",
                    )}
                  >
                    {link.text}
                  </FooterAnchor>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
