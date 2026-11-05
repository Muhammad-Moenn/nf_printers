"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { highlightLastWord } from "@/components/ui/highlight-last-word";

type TrustedByItem = {
  label: string;
  icon: "graduationCap" | "bookOpen" | "briefcase" | "users" | "landmark";
};

const trustIcons: Record<TrustedByItem["icon"], LucideIcon> = {
  graduationCap: GraduationCap,
  bookOpen: BookOpen,
  briefcase: Briefcase,
  users: Users,
  landmark: Landmark,
};

export default function TrustedBySection() {
  const t = useTranslations("home");
  const landing = useTranslations("home.landing");
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const reduceMotion = hasMounted && Boolean(prefersReducedMotion);
  const items = (t.raw("brand_items") as TrustedByItem[]) ?? [];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.07,
        delayChildren: reduceMotion ? 0 : 0.05,
      },
    },
  };

  const childVariants = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      id="partners"
      aria-labelledby="trusted-heading"
      className="relative overflow-hidden py-[var(--space-12)] sm:py-[var(--space-16)]"
    >
      <motion.div
        dir={locale === "ur" ? "rtl" : "ltr"}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="mx-auto w-full max-w-6xl px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]"
      >
        <motion.div
          variants={childVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full border border-primary-border/70 bg-primary-soft px-[var(--space-3)] py-1 text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.18em] text-primary-text shadow-[var(--shadow-sm)]">
            {landing("partners_label")}
          </span>

          <h2
            id="trusted-heading"
            className="mt-[var(--space-4)] text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl lg:text-4xl xl:text-5xl"
          >
            {highlightLastWord(t("brand_title"))}
          </h2>

          <p className="mx-auto mt-[var(--space-3)] max-w-2xl text-sm leading-6 text-foreground/80 sm:text-base sm:leading-7 dark:text-muted-foreground">
            {t("brand_description")}
          </p>
        </motion.div>

        <ul
          role="list"
          className="mt-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-3)] sm:mt-[var(--space-10)] sm:gap-[var(--space-4)] lg:gap-[var(--space-5)]"
        >
          {items.map((entry) => {
            const Icon = trustIcons[entry.icon] ?? GraduationCap;

            return (
              <motion.li
                key={entry.label}
                variants={childVariants}
                className="min-w-0 basis-[calc(50%-0.375rem)] sm:basis-[calc(33.333%-0.667rem)] lg:basis-[calc(20%-1rem)]"
              >
                <div
                  className={cn(
                    "group flex h-full flex-col items-center justify-center gap-[var(--space-2)]",
                    "rounded-[var(--radius-lg)] border border-primary-border bg-card/70 bg-gradient-to-b from-primary-soft to-primary-border/35",
                    "px-[var(--space-3)] py-[var(--space-3)] text-center shadow-[var(--shadow-sm)] backdrop-blur-sm",
                    "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-border hover:to-primary-border/50",
                    "hover:shadow-[var(--shadow-md)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                    "sm:py-[var(--space-4)]",
                  )}
                >
                  <Icon
                    className="h-6 w-6 text-primary-text transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transform-none sm:h-7 sm:w-7"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span className="text-badge font-semibold leading-tight text-heading">
                    {entry.label}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
