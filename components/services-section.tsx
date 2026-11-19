"use client";

import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Archive,
  BookOpen,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Layers,
  MoveRight,
  NotebookPen,
  Printer,
  Receipt,
  Sticker,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { services as serviceCatalog } from "@/data/services";
import { ServiceShowcaseCard } from "./service-showcase-card";

const showcaseIcons: Record<string, LucideIcon> = {
  notebookPen: NotebookPen,
  bookOpen: BookOpen,
  layers: Layers,
  fileText: FileText,
  archive: Archive,
  printer: Printer,
  image: ImageIcon,
  receipt: Receipt,
  sticker: Sticker,
  calendarDays: CalendarDays,
};

const dotPattern = {
  backgroundImage:
    "radial-gradient(color-mix(in oklab, var(--primary) 55%, transparent) 1.5px, transparent 1.5px)",
  backgroundSize: "14px 14px",
} as const;

export function ServicesSection() {
  const locale = useLocale();
  const t = useTranslations("home.servic_section");
  const landing = useTranslations("home.landing");
  const isRTL = locale === "ur";
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const reduceMotion = hasMounted && Boolean(prefersReducedMotion);
  const services = serviceCatalog.slice(0, 10);
  const localizedServices = t.raw("services") as {
    id: number | string;
    title: string;
  }[];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const reveal = (delay = 0, offset = 20) => ({
    initial: reduceMotion ? false : { opacity: 0, y: offset },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: reduceMotion
      ? { duration: 0 }
      : {
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1] as const,
        },
  });

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative overflow-hidden py-[var(--space-8)] scroll-mt-24 text-foreground sm:py-[var(--space-10)] lg:py-[var(--space-12)] dark:text-on-color"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-4 top-10 h-20 w-20 opacity-70 sm:start-8 sm:h-24 sm:w-24 lg:start-12"
        style={dotPattern}
      />
      <div className="relative mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <motion.div {...reveal()} className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-primary-border sm:w-12"
            />
            <span className="font-hero text-badge font-bold text-primary-text">
              {landing("services_label")}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-primary-border sm:w-12"
            />
          </div>

          <h2
            id="services-heading"
            className="mt-[var(--space-4)] font-hero text-landing-section font-bold leading-tight tracking-tight text-heading sm:mt-[var(--space-5)]"
          >
            {t("heading_lead")}{" "}
            <span className="text-primary-text">{t("heading_highlight")}</span>
          </h2>

          <p className="mx-auto mt-[var(--space-3)] max-w-3xl font-hero text-sm leading-6 text-muted-foreground sm:mt-[var(--space-4)] sm:text-base sm:leading-7">
            {t("description")}
          </p>
        </motion.div>

        <ul
          role="list"
          className="mt-[var(--space-6)] grid list-none grid-cols-2 gap-[var(--space-3)] sm:mt-[var(--space-8)] sm:gap-[var(--space-4)] md:grid-cols-3 xl:grid-cols-5"
        >
          {services.map((service, index) => {
            const Icon = showcaseIcons[String(service.icon)] ?? NotebookPen;
            const localizedTitle =
              locale === "ur"
                ? localizedServices.find(
                    (item) => String(item.id) === String(service.id),
                  )?.title ?? service.title
                : service.title;

            return (
              <motion.li
                key={service.id ?? service.title}
                {...reveal(0.05 + index * 0.06, 24)}
                className="min-w-0"
              >
                <Link
                  href={{
                    pathname: "/user-dashboard/new-order",
                    query: { service: service.title },
                  }}
                  className="block h-full rounded-[var(--radius-2xl)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={localizedTitle}
                >
                  <ServiceShowcaseCard title={localizedTitle} Icon={Icon} />
                </Link>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-[var(--space-6)] flex justify-center sm:mt-[var(--space-8)]">
          <Link
            href="/services"
            className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-[var(--space-6)] font-hero text-sm font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:text-control ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {landing("view_all")}
            <MoveRight
              className={`size-4 transition-transform duration-300 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
