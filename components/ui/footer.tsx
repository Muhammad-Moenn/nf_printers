import Image from "next/image";
import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  ArrowUp,
  Mail,
  MapPin,
} from "lucide-react";
import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

type FooterLink = {
  text: string;
  url: string;
};

type FooterMenuSection = {
  title: string;
  links: FooterLink[];
};

type FooterSocialLink = {
  text: string;
  icon: "facebook" | "whatsapp" | "youtube" | "linkedin";
};

const socialIconMap: Record<FooterSocialLink["icon"], ComponentType<SVGProps<SVGSVGElement>>> = {
  facebook: IconBrandFacebook,
  whatsapp: IconBrandWhatsapp,
  youtube: IconBrandYoutube,
  linkedin: IconBrandLinkedin,
};

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=Naseer+Falak+Sher+Printing+Press+Multan";

function FooterAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const isExternal = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      className={className}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const t = useTranslations("home.footer");
  const sections = t.raw("menuItems") as FooterMenuSection[];
  const bottomLinks = t.raw("bottomLinks") as FooterLink[];
  const socialLinks = t.raw("socialLinks") as FooterSocialLink[];
  const locale = useLocale();
  const isRTL = locale === "ur";

  const linkClassName =
    "inline-flex min-h-8 items-center text-sm leading-6 text-on-color/80 transition-colors duration-200 hover:text-on-color focus-visible:text-on-color focus-visible:outline-none motion-reduce:transition-none";

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "relative isolate overflow-hidden border-t border-primary-border/35 bg-[var(--landing-footer)] text-on-color",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 sm:h-36 lg:h-44"
      >
        <Image
          src="/footer-wave-artwork.png"
          alt=""
          fill
          sizes="100vw"
          className="object-fill"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] pb-[var(--space-8)] pt-[var(--space-12)] sm:px-[var(--space-6)] sm:pb-[var(--space-10)] sm:pt-[var(--space-16)] lg:px-[var(--space-8)]">
        <div className="grid grid-cols-2 gap-x-[var(--space-6)] gap-y-[var(--space-8)] sm:grid-cols-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)_minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-[var(--space-10)]">
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <Link
              href="/"
              aria-label={t("home_label")}
              className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft-foreground"
            >
              <Image
                src="/footer-logo-extracted.png"
                alt={t("logo.alt")}
                width={185}
                height={42}
                className="h-auto w-[11.5rem] max-w-full"
              />
            </Link>

            <p className="mt-[var(--space-4)] max-w-xs font-hero text-sm leading-6 text-on-color/85">
              {t("tagline")}
            </p>

            <ul
              aria-label={t("social_platforms")}
              className="mt-[var(--space-4)] flex flex-wrap items-center gap-[var(--space-2)]"
            >
              {socialLinks.map(({ text, icon }) => {
                const Icon = socialIconMap[icon];
                return (
                  <li key={icon}>
                    <span
                      title={text}
                      className="flex size-8 items-center justify-center rounded-full border border-primary/45 bg-primary/25 text-on-color shadow-[var(--shadow-sm)]"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span className="sr-only">{text}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {sections.map((section) => (
            <nav key={section.title} aria-label={section.title} className="min-w-0">
              <h3 className="font-hero text-sm font-bold text-on-color">
                {section.title}
              </h3>
              <ul className="mt-[var(--space-3)] space-y-[var(--space-1)]">
                {section.links.map((link) => (
                  <li key={`${link.text}-${link.url}`}>
                    <FooterAnchor href={link.url} className={linkClassName}>
                      {link.text}
                    </FooterAnchor>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="min-w-0">
            <h3 className="font-hero text-sm font-bold text-on-color">
              {t("contact_title")}
            </h3>
            <ul className="mt-[var(--space-3)] space-y-[var(--space-3)]">
              <li>
                <FooterAnchor
                  href={mapUrl}
                  className="group flex min-h-11 items-start gap-3 text-sm leading-6 text-on-color/85 transition-colors hover:text-on-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft-foreground"
                >
                  <MapPin className="mt-1 size-4 shrink-0 text-landing-star" aria-hidden="true" />
                  <span>{t("contact_address")}</span>
                </FooterAnchor>
              </li>
              <li>
                <FooterAnchor
                  href={`mailto:${t("contact_email")}`}
                  className="group flex min-h-11 items-center gap-3 break-all text-sm leading-6 text-on-color/85 transition-colors hover:text-on-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft-foreground"
                >
                  <Mail className="size-4 shrink-0 text-landing-star" aria-hidden="true" />
                  <span>{t("contact_email")}</span>
                </FooterAnchor>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-3)] border-t border-primary-border/35 pt-[var(--space-5)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center sm:gap-[var(--space-5)]">
            <p className="text-xs leading-5 text-on-color/80">{t("copyright")}</p>

            {bottomLinks.length > 0 ? (
              <ul className="flex flex-wrap items-center gap-x-[var(--space-5)] gap-y-[var(--space-2)]">
                {bottomLinks.map((link) => (
                  <li key={`${link.text}-${link.url}`}>
                    <FooterAnchor
                      href={link.url}
                      className="text-xs leading-5 text-on-color/75 underline-offset-4 transition-colors duration-200 hover:text-on-color hover:underline focus-visible:text-on-color focus-visible:outline-none motion-reduce:transition-none"
                    >
                      {link.text}
                    </FooterAnchor>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-[var(--space-4)] sm:justify-end">
            <p className="font-hero text-xs font-semibold text-on-color/90">
              {t("brand_motto")}
            </p>
            <Link
              href="/#hero"
              aria-label={t("backToHome")}
              title={t("backToHome")}
              className="group flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft-foreground motion-reduce:transition-none"
            >
              <ArrowUp className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
