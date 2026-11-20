"use client";

import { ArrowRight, Printer, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { ServiceCard } from "@/components/service-card";
import { useServiceCatalog } from "@/components/service-catalog-context";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function AllServicesSection({
  className = "",
}: {
  className?: string;
}) {
  const t = useTranslations("home.services_page");
  const catalog = useServiceCatalog();
  const orderedCatalog = [...catalog].sort(
    (first, second) =>
      (first.displayOrder ?? 0) - (second.displayOrder ?? 0) ||
      String(first.title).localeCompare(String(second.title)),
  );
  const customOrderHref = "/user-dashboard/new-order?service=Custom%20Printing&custom=1";

  return (
    <section
      id="all-services"
      className={cn(
        "relative isolate scroll-mt-24 overflow-hidden py-[var(--space-10)] sm:py-[var(--space-14)] lg:py-[var(--space-16)]",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -start-32 top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -end-36 bottom-0 size-80 rounded-full bg-landing-sky/20 blur-3xl" />
        <div
          className="absolute end-6 top-10 h-20 w-20 opacity-45 sm:end-10 sm:h-24 sm:w-24"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklab, var(--primary) 55%, transparent) 1.5px, transparent 1.5px)",
            backgroundSize: "14px 14px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <header className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">
            <Printer aria-hidden="true" className="size-4 shrink-0" />
            {t("badge")}
          </span>
          <h2 className="landing-section-title mt-[var(--space-4)]">
            {highlightLastWord(t("catalog_title"), "landing-section-title-highlight")}
          </h2>
          <p className="landing-section-description mx-auto mt-[var(--space-3)]">
            {t("catalog_description")}
          </p>
        </header>

        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-3 sm:mt-[var(--space-8)] sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {orderedCatalog.map((service) => {
            const params = new URLSearchParams({ service: service.title });
            return (
              <Link
                href={`/user-dashboard/new-order?${params.toString()}`}
                key={service.id}
                aria-label={`${t("customize_cta")}: ${service.title}`}
                className="block h-full rounded-[var(--radius-2xl)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ServiceCard {...service} />
              </Link>
            );
          })}

          <Link
            href={customOrderHref}
            aria-label={t("custom_accessible")}
            className="group relative flex min-h-36 items-center overflow-hidden rounded-[var(--radius-2xl)] border border-primary/35 bg-gradient-to-br from-[var(--landing-footer)] via-primary/90 to-primary px-5 py-5 text-on-color shadow-[var(--shadow-md)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:col-span-2 sm:min-h-40 sm:px-6 xl:col-span-2"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -end-8 -top-16 size-56 rounded-full border border-on-color/10" />
            <div aria-hidden="true" className="pointer-events-none absolute -end-2 -top-10 size-40 rounded-full border border-on-color/10" />
            <div className="relative z-10 flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-on-color/15 bg-on-color/10 text-on-color shadow-[var(--shadow-sm)] backdrop-blur sm:size-16">
                <Sparkles className="size-7" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-hero text-lg font-bold leading-tight sm:text-xl">
                  {t("custom_title")}
                </span>
                <span className="mt-1.5 block max-w-xl text-sm leading-5 text-on-color/85 sm:text-base sm:leading-6">
                  {t("custom_description")}
                </span>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-on-color">
                  {t("customize_cta")}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AllServicesSection;
