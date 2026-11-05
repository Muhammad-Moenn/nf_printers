"use client";

import {
  ArrowRight,
  FolderCheck,
  Smile,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

type HeroStat = {
  value: string;
  label: string;
  icon: "trophy" | "folder" | "smile" | "zap";
};

const statIcons: Record<HeroStat["icon"], LucideIcon> = {
  trophy: Trophy,
  folder: FolderCheck,
  smile: Smile,
  zap: Zap,
};

const trustAvatars = [
  { initials: "AK", className: "bg-primary-soft text-primary-text" },
  { initials: "SR", className: "bg-info-soft text-info-text" },
  { initials: "MH", className: "bg-violet-soft text-violet-text" },
  { initials: "ZN", className: "bg-pink-soft text-pink-text" },
];

const HeroSection = ({ className }: Props) => {
  const locale = useLocale();
  const landing = useTranslations("home.landing");
  const { user } = useAuthUser();
  const createOrderHref = user ? "/user-dashboard/new-order" : "/sign-in";
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const reduceMotion = hasMounted && Boolean(prefersReducedMotion);
  const isRTL = locale === "ur";
  const stats = (landing.raw("hero_stats") as HeroStat[]) ?? [];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const reveal = (delay = 0, withScale = false) => ({
    initial: reduceMotion
      ? false
      : { opacity: 0, y: 18, ...(withScale ? { scale: 0.97 } : {}) },
    whileInView: {
      opacity: 1,
      y: 0,
      ...(withScale ? { scale: 1 } : {}),
    },
    viewport: { once: true, amount: 0.2 },
    transition: reduceMotion
      ? { duration: 0 }
      : {
          duration: 0.55,
          delay,
          ease: [0.22, 1, 0.36, 1] as const,
        },
  });

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className={cn("relative isolate overflow-hidden", className)}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative mx-auto w-full max-w-[1280px] px-4 pb-[var(--space-4)] pt-[var(--space-8)] sm:px-6 sm:pb-[var(--space-6)] sm:pt-[var(--space-10)] lg:px-8 lg:pb-[var(--space-8)] lg:pt-[var(--space-12)]"
      >
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-4">
          <div className={cn("min-w-0", isRTL ? "text-right" : "text-left")}>
            <motion.span
              {...reveal()}
              className="inline-flex items-center gap-2 rounded-full border border-primary-border bg-primary-soft/90 px-4 py-1.5 text-badge font-semibold tracking-normal text-primary-text shadow-[var(--shadow-sm)] backdrop-blur-sm dark:border-primary-border dark:bg-primary-soft dark:text-primary-soft-foreground"
            >
              <Star
                className="h-3.5 w-3.5 fill-landing-star text-landing-star"
                aria-hidden="true"
              />
              {landing("hero_badge")}
            </motion.span>

            <motion.h1
              id="hero-heading"
              {...reveal(0.06)}
              className="mt-[var(--space-4)] font-hero text-[length:clamp(1.6rem,8vw,2.25rem)] font-bold leading-hero tracking-hero text-heading sm:mt-[var(--space-5)] sm:text-hero"
            >
              <span className="block whitespace-nowrap">
                {landing("hero_title_line1")}
              </span>
              <span className="block text-primary-text">
                {landing("hero_title_line2")}
              </span>
            </motion.h1>

            <motion.p
              {...reveal(0.12)}
              className="mt-[var(--space-3)] max-w-[30rem] font-hero text-hero-lead font-normal leading-relaxed text-foreground/80 sm:mt-[var(--space-4)] dark:text-foreground"
            >
              {landing("hero_description")}
            </motion.p>

            <motion.div
              {...reveal(0.18)}
              className={cn(
                "mt-[var(--space-5)] flex flex-col gap-3 sm:mt-[var(--space-6)] sm:flex-row sm:items-center",
                isRTL && "sm:flex-row-reverse sm:justify-end",
              )}
            >
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full bg-primary px-[var(--space-6)] font-hero text-sm font-semibold text-on-color shadow-[var(--shadow-md)] hover:bg-primary-hover sm:text-control"
              >
                <Link
                  href={createOrderHref}
                  className={cn(
                    "flex items-center gap-2",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  {landing("hero_cta_primary")}
                  <ArrowRight
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
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
                variant="outline"
                className="group h-12 rounded-full border-border bg-card px-[var(--space-5)] font-hero text-sm font-semibold text-heading shadow-[var(--shadow-sm)] hover:bg-primary-soft hover:text-primary-text dark:border-border dark:bg-card/80 dark:text-heading dark:hover:border-primary-border dark:hover:bg-primary-soft dark:hover:text-primary-text sm:text-control"
              >
                <Link
                  href="/#about"
                  className={cn(
                    "flex items-center gap-2.5",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  {landing("hero_cta_secondary")}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-heading text-on-color transition-transform duration-300 group-hover:scale-105 dark:bg-primary">
                    <ArrowRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300",
                        isRTL
                          ? "rotate-180 group-hover:-translate-x-0.5"
                          : "group-hover:translate-x-0.5",
                      )}
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              {...reveal(0.24)}
              className={cn(
                "mt-[var(--space-5)] flex flex-wrap items-center gap-3 sm:mt-[var(--space-6)] sm:gap-4",
                isRTL && "flex-row-reverse justify-end",
              )}
            >
              <div
                className={cn("flex -space-x-2.5", isRTL && "space-x-reverse")}
              >
                {trustAvatars.map((avatar) => (
                  <span
                    key={avatar.initials}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 border-card text-caption font-bold shadow-sm sm:h-9 sm:w-9",
                      avatar.className,
                    )}
                    aria-hidden="true"
                  >
                    {avatar.initials}
                  </span>
                ))}
              </div>
              <p className="font-hero text-sm font-medium text-foreground/80 sm:text-control dark:text-muted-foreground">
                {landing("hero_trust")}
              </p>
            </motion.div>
          </div>

          <motion.div
            {...reveal(0.1, true)}
            className="relative flex min-w-0 items-center justify-center lg:justify-start"
          >
            <div className="landing-machine-glow w-full max-w-[560px] sm:max-w-[680px] lg:w-[135%] lg:max-w-none xl:w-[180%]">
              <Image
                src="/machine-image.png"
                alt={landing("hero_image_alt")}
                width={2068}
                height={800}
                priority
                sizes="(max-width: 1024px) 92vw, 60vw"
                className="h-auto w-full object-contain"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          {...reveal(0.3)}
          className="relative z-10 mt-[var(--space-8)] sm:mt-[var(--space-10)]"
        >
          <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-3xl)] border border-border/70 bg-card/95 px-1 py-1 shadow-[var(--shadow-xl)] backdrop-blur-md dark:border-border/70 dark:bg-card/90 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = statIcons[stat.icon] ?? Trophy;
              return (
                <div
                  key={stat.label}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-4 text-center sm:px-6 sm:py-5",
                    index % 2 === 0 && "border-e border-border/70",
                    index < 2 && "border-b border-border/70 lg:border-b-0",
                    index === 1 && "lg:border-e lg:border-border/70",
                    index === 3 && "lg:border-e-0",
                  )}
                >
                  <dt className="flex flex-col items-center gap-0.5">
                    <Icon
                      className="h-5 w-5 text-primary-text dark:text-primary-soft-foreground"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span
                      dir="ltr"
                      className="font-hero text-xl font-bold leading-tight tracking-tight text-heading"
                    >
                      {stat.value}
                    </span>
                  </dt>
                  <dd className="font-hero text-[length:var(--font-size-xs)] font-medium leading-tight text-muted-foreground sm:text-sm">
                    {stat.label}
                  </dd>
                </div>
              );
            })}
          </dl>
        </motion.div>
      </div>
    </section>
  );
};

export { HeroSection };
