"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Layers,
  MoveRight,
  NotebookPen,
  NotebookText,
  Printer,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type { ServiceProps } from "@/data/services";
import { cn } from "@/lib/utils";

import { ServiceShowcaseCard } from "./service-showcase-card";

const showcaseIcons: LucideIcon[] = [
  NotebookPen,
  BookOpen,
  Layers,
  FileText,
  NotebookText,
  Printer,
];

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
  const services = ((t.raw("services") as ServiceProps[]) ?? []).slice(0, 6);

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
      className="relative overflow-hidden py-16 text-foreground scroll-mt-24 sm:py-20 lg:py-24 dark:text-on-color"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-10 h-20 w-20 opacity-70 sm:left-8 sm:h-24 sm:w-24 lg:left-12"
        style={dotPattern}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-4 h-20 w-20 opacity-70 sm:right-8 sm:h-24 sm:w-24 lg:right-12"
        style={dotPattern}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal()} className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span
              aria-hidden="true"
              className="h-px w-10 bg-gradient-to-r from-transparent to-primary-border sm:w-20 lg:w-28"
            />
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-border/70 bg-primary-soft px-3.5 py-1.5 text-[length:var(--font-size-xs)] font-bold uppercase tracking-[0.16em] text-primary-text shadow-[var(--shadow-sm)] sm:text-sm">
              <Printer className="h-4 w-4" aria-hidden="true" />
              {landing("services_label")}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-10 bg-gradient-to-l from-transparent to-primary-border sm:w-20 lg:w-28"
            />
          </div>

          <h2
            id="services-heading"
            className="mt-5 text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl lg:text-4xl xl:text-5xl"
          >
            {t("heading_lead")}{" "}
            <span className="text-primary-text">{t("heading_highlight")}</span>
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg lg:text-2xl lg:leading-9">
            {t("description")}
          </p>
        </motion.div>

        <ul
          role="list"
          className="mt-12 grid list-none grid-cols-1 gap-5 sm:mt-14 md:grid-cols-2 lg:gap-6 xl:grid-cols-3"
        >
          {services.map((service, index) => {
            const Icon = showcaseIcons[index] ?? NotebookPen;

            return (
              <motion.li
                key={service.id ?? service.title}
                {...reveal(0.05 + index * 0.06, 24)}
                className="min-w-0"
              >
                <Link
                  href={service.link || `/services/${service.id}`}
                  className="block h-full"
                >
                  <ServiceShowcaseCard
                    title={service.title}
                    description={service.description}
                    Icon={Icon}
                  />
                </Link>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-12 flex items-center justify-center gap-3 sm:mt-14 sm:gap-5">
          <span
            aria-hidden="true"
            className="hidden h-px w-24 bg-gradient-to-r from-transparent to-primary-border sm:block lg:w-40"
          />
          <Link
            href="/services"
            className={cn(
              "group inline-flex h-14 max-w-full items-center justify-center gap-2.5 whitespace-nowrap",
              "rounded-full bg-gradient-to-r from-primary to-primary-hover px-6",
              "text-base font-bold text-on-color shadow-[var(--shadow-lg)]",
              "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-xl)]",
              "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              "sm:h-[3.75rem] sm:px-10 sm:text-lg",
              isRTL && "flex-row-reverse",
            )}
          >
            {landing("view_all")}
            <MoveRight
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                isRTL
                  ? "rotate-180 group-hover:-translate-x-1"
                  : "group-hover:translate-x-1",
              )}
              aria-hidden="true"
            />
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-px w-24 bg-gradient-to-l from-transparent to-primary-border sm:block lg:w-40"
          />
        </div>
      </div>
    </section>
  );
}
