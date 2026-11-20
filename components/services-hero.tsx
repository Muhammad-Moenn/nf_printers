"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Printer } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { useHydratedReducedMotion } from "@/components/use-hydrated-reduced-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function ServicesHero() {
  const t = useTranslations("home.services_page");
  const isRTL = useLocale() === "ur";
  const reduceMotion = useHydratedReducedMotion();

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      id="services-hero"
      aria-labelledby="services-hero-heading"
      className="relative isolate scroll-mt-24 overflow-hidden"
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative mx-auto grid min-h-[var(--hero-min-height)] w-full max-w-[var(--hero-max-width)] items-center gap-[var(--space-6)] px-[var(--hero-padding-x)] py-[var(--hero-padding-y)] sm:px-[var(--space-6)] lg:min-h-[var(--hero-desktop-min-height)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-[var(--space-8)] lg:px-[var(--space-8)] lg:py-[var(--space-8)]"
      >
        <div className={cn("relative z-10 min-w-0", isRTL ? "text-end" : "text-start")}>
          <motion.div {...reveal()}>
            <span className="landing-eyebrow">
              <Printer aria-hidden="true" className="size-4 shrink-0" />
              {t("badge")}
            </span>
          </motion.div>

          <motion.h1
            id="services-hero-heading"
            {...reveal(0.04)}
            className="mt-[var(--space-4)] max-w-[var(--hero-title-width)] font-hero text-hero font-bold leading-hero tracking-hero text-heading sm:mt-[var(--space-5)]"
          >
            <span className="block">{t("title_line1")}</span>
            <span className="landing-section-title-highlight block">
              {t("title_line2")}
            </span>
          </motion.h1>

          <motion.p
            {...reveal(0.1)}
            className="landing-section-description mt-[var(--space-4)] max-w-[var(--hero-description-width)]"
          >
            {t("description")}
          </motion.p>

          <motion.div
            {...reveal(0.16)}
            className={cn(
              "mt-[var(--space-6)] flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center",
              isRTL && "sm:flex-row-reverse sm:justify-end",
            )}
          >
            <Button
              asChild
              size="lg"
              className="group min-h-12 rounded-full bg-primary !px-[var(--space-6)] font-hero text-sm font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-primary-hover sm:text-control"
            >
              <Link
                href="/services#all-services"
                className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}
              >
                {t("primary_cta")}
                <ArrowRight
                  aria-hidden="true"
                  className={cn(
                    "size-4 transition-transform duration-300",
                    isRTL
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1",
                  )}
                />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="ghost"
              className="group min-h-12 rounded-full bg-primary-soft !px-[var(--space-4)] font-hero text-sm font-semibold text-heading transition-transform duration-300 hover:-translate-y-0.5 hover:bg-primary-soft hover:text-primary-text sm:text-control"
            >
              <Link
                href="/services#process"
                className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-border bg-card text-primary shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105">
                  <ArrowDown className="size-4" aria-hidden="true" />
                </span>
                {t("secondary_cta")}
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          {...reveal(0.12)}
          className="relative z-0 mx-auto flex w-full max-w-[var(--hero-image-mobile-width)] items-center justify-center lg:mx-0 lg:max-w-none"
        >
          <Image
            src="/machine-image.png"
            alt={t("image_alt")}
            width={2068}
            height={800}
            priority
            sizes="(max-width: 639px) 94vw, (max-width: 1023px) 80vw, 64vw"
            className="h-auto w-full object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
