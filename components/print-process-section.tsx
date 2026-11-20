"use client";

import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  CloudUpload,
  Printer,
  Settings2,
  SlidersHorizontal,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { useHydratedReducedMotion } from "@/components/use-hydrated-reduced-motion";

const icons: LucideIcon[] = [
  BriefcaseBusiness,
  CloudUpload,
  SlidersHorizontal,
  ClipboardCheck,
  Truck,
];

type ProcessStep = {
  title: string;
  description: string;
};

export default function PrintProcessSection() {
  const locale = useLocale();
  const t = useTranslations("home.landing");
  const isRTL = locale === "ur";
  const reduceMotion = useHydratedReducedMotion();
  const steps = (t.raw("process_steps") as ProcessStep[]) ?? [];

  const itemVariants = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      dir={isRTL ? "rtl" : "ltr"}
      className="relative scroll-mt-24 py-[var(--space-8)] text-foreground sm:py-[var(--space-10)] lg:py-[var(--space-12)] dark:text-on-color"
    >
      <div className="mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
          className="relative isolate overflow-hidden rounded-[var(--radius-4xl)] border border-primary-border/60 bg-gradient-to-br from-card via-primary-soft/25 to-card/90 px-4 py-6 shadow-[var(--shadow-lg)] sm:px-6 sm:py-8 lg:px-9 lg:py-16 dark:border-on-color/10 dark:from-background dark:via-primary/10 dark:to-background"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -start-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl sm:size-[26rem]" />
            <div className="absolute -end-32 -bottom-32 size-96 rounded-full bg-landing-sky/20 blur-3xl" />
            <div className="absolute start-1/2 top-1/2 size-[min(75vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
          </div>

          <header className="relative mx-auto max-w-3xl text-center">
            <span className="landing-eyebrow">
              <Settings2 aria-hidden="true" className="size-4 shrink-0" />
              {t("process_label")}
            </span>

            <h2
              id="process-heading"
              className="landing-section-title mt-[var(--space-4)]"
            >
              {highlightLastWord(t("process_title"), "landing-section-title-highlight")}
            </h2>

            <p className="landing-section-description mx-auto mt-[var(--space-3)]">
              {t("process_description")}
            </p>
          </header>

          <div className="relative mx-auto mt-[var(--space-6)] w-full max-w-5xl sm:mt-[var(--space-8)]">
            <div className="relative min-w-0">
              <motion.ol
                initial={reduceMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.12 }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: reduceMotion
                      ? { duration: 0 }
                      : { staggerChildren: 0.07, delayChildren: 0.05 },
                  },
                }}
                className="relative grid list-none gap-y-8 before:absolute before:inset-y-10 before:start-[1.375rem] before:z-0 before:border-s-2 before:border-dashed before:border-primary/35 sm:gap-y-10 lg:gap-y-12 lg:before:start-1/2 lg:before:-translate-x-1/2"
              >
                {steps.map((step, index) => {
                  const Icon = icons[index] ?? CloudUpload;
                  const number = String(index + 1).padStart(2, "0");
                  const isOnRight = index % 2 === 1;

                  return (
                    <motion.li
                      key={`${index}-${step.title}`}
                      variants={itemVariants}
                      className="relative z-10 grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2.5 lg:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] lg:gap-3"
                    >
                      <span className="col-start-1 row-start-1 z-20 flex size-10 items-center justify-center justify-self-center rounded-full border-[3px] border-card bg-primary font-hero text-xs font-bold leading-none text-primary-foreground shadow-[var(--shadow-md)] sm:size-11 sm:text-sm lg:col-start-2">
                        {number}
                      </span>

                      <div
                        className={cn(
                          "group col-start-2 row-start-1 min-w-0 rounded-[var(--radius-2xl)] border border-primary-border/55 bg-card/90 px-3.5 py-3.5 shadow-[var(--shadow-md)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary-border hover:shadow-[var(--shadow-lg)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-4 sm:py-4 dark:border-on-color/10 dark:bg-background/80",
                          isOnRight ? "lg:col-start-3" : "lg:col-start-1",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-hero text-sm font-bold leading-snug text-heading sm:text-base">
                              {step.title}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm dark:text-neutral-300">
                              {step.description}
                            </p>
                          </div>
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-text shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105 dark:bg-primary/15 dark:text-primary-soft-foreground sm:size-11">
                            <Icon className="size-5 sm:size-[1.375rem]" strokeWidth={1.9} aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ol>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
