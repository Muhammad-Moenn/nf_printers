"use client";

import {
  ArrowRight,
  BadgeCheck,
  Play,
  Printer,
  Smile,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

type HeroStat = {
  value: string;
  label: string;
  icon: "trophy" | "smile" | "zap";
};

const statIcons: Record<HeroStat["icon"], LucideIcon> = {
  trophy: Trophy,
  smile: Smile,
  zap: Zap,
};

const HeroSection = ({ className }: Props) => {
  const locale = useLocale();
  const landing = useTranslations("home.landing");
  const reduceMotion = useReducedMotion();
  const isRTL = locale === "ur";
  const stats = (landing.raw("hero_stats") as HeroStat[]) ?? [];

  const reveal = (delay = 0, distance = 16) => ({
    initial: reduceMotion ? false : { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={cn(
        "relative isolate overflow-hidden",
        className,
      )}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative mx-auto grid min-h-[var(--hero-min-height)] w-full max-w-[var(--hero-max-width)] items-center gap-[var(--space-6)] px-[var(--hero-padding-x)] py-[var(--hero-padding-y)] sm:px-[var(--space-6)] lg:min-h-[var(--hero-desktop-min-height)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-[var(--space-8)] lg:px-[var(--space-8)] lg:py-[var(--space-8)]"
      >
        <div className={cn("relative z-10 min-w-0", isRTL ? "text-end" : "text-start")}>
          <motion.div {...reveal(0)}>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary-border bg-primary-soft/90 px-[var(--space-4)] py-[var(--space-2)] font-hero text-badge font-semibold text-primary-text shadow-[var(--shadow-sm)] backdrop-blur-sm">
              <Printer className="size-4 shrink-0" aria-hidden="true" />
              {landing("hero_badge")}
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            {...reveal(0.04, 12)}
            className="mt-[var(--space-4)] max-w-[var(--hero-title-width)] font-hero text-hero font-bold leading-hero tracking-hero text-heading sm:mt-[var(--space-5)]"
          >
            <span className="block">{landing("hero_title_line1")}</span>
            <span className="block text-primary-text">
              {landing("hero_title_line2")}
            </span>
          </motion.h1>

          <motion.p
            {...reveal(0.1, 12)}
            className="mt-[var(--space-4)] max-w-[var(--hero-description-width)] font-hero text-hero-lead font-normal leading-relaxed text-foreground/80 dark:text-foreground"
          >
            {landing("hero_description")}
          </motion.p>

          <motion.div
            {...reveal(0.16, 12)}
            className={cn(
              "mt-[var(--space-6)] flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center",
              isRTL && "sm:flex-row-reverse sm:justify-end",
            )}
          >
            <Button
              asChild
              size="lg"
              className="group min-h-12 rounded-full bg-primary px-[var(--space-6)] font-hero text-sm font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-primary-hover sm:text-control"
            >
              <Link
                href="/services"
                className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}
              >
                {landing("hero_cta_primary")}
                <ArrowRight
                  className={cn(
                    "size-4 transition-transform duration-300",
                    isRTL
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1",
                  )}
                  aria-hidden="true"
                />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="ghost"
              className="group min-h-12 rounded-full px-[var(--space-4)] font-hero text-sm font-semibold text-heading transition-transform duration-300 hover:-translate-y-0.5 hover:bg-primary-soft hover:text-primary-text sm:text-control"
            >
              <a
                href="/heroSection-video.mp4"
                target="_blank"
                rel="noreferrer"
                className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-border bg-card text-primary shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105">
                  <Play className="ms-0.5 size-4 fill-current" aria-hidden="true" />
                </span>
                {landing("hero_cta_secondary")}
              </a>
            </Button>
          </motion.div>

          <motion.dl
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              visible: {
                transition: reduceMotion
                  ? { duration: 0 }
                  : { staggerChildren: 0.1, delayChildren: 0.2 },
              },
            }}
            className="mt-[var(--space-6)] grid grid-cols-3 gap-[var(--space-2)] sm:mt-[var(--space-8)] sm:gap-[var(--space-4)]"
          >
            {stats.map((stat) => {
              const Icon = statIcons[stat.icon] ?? BadgeCheck;
              return (
                <motion.div
                  key={stat.label}
                  variants={{
                    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="flex min-w-0 items-center gap-[var(--space-2)]"
                >
                  <Icon
                    className="size-5 shrink-0 text-primary-text sm:size-6"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <dt dir="ltr" className="font-hero text-base font-bold leading-tight text-heading sm:text-lg">
                      {stat.value}
                    </dt>
                    <dd className="mt-0.5 font-hero text-[length:var(--font-size-xs)] font-medium leading-snug text-muted-foreground sm:text-sm">
                      {stat.label}
                    </dd>
                  </div>
                </motion.div>
              );
            })}
          </motion.dl>
        </div>

        <motion.div
          {...reveal(0.12, 10)}
          className="relative z-0 mx-auto flex w-full max-w-[var(--hero-image-mobile-width)] items-center justify-center lg:mx-0 lg:max-w-none"
        >
          <Image
            src="/machine-image.png"
            alt={landing("hero_image_alt")}
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
};

export { HeroSection };
