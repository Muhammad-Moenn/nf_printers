"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  CloudUpload,
  FilePenLine,
  PackageCheck,
  Printer,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { highlightLastWord } from "@/components/ui/highlight-last-word";

const icons: LucideIcon[] = [
  CloudUpload,
  FilePenLine,
  CheckCircle,
  Printer,
  PackageCheck,
  Truck,
];

export default function PrintProcessSection() {
  const locale = useLocale();
  const t = useTranslations("home.landing");
  const isRTL = locale === "ur";
  const reduceMotion = useReducedMotion();
  const steps = (t.raw("process_steps") as {
    title: string;
    description: string;
  }[]) ?? [];

  const itemVariants = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.45 },
    },
  };

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="relative overflow-hidden py-[var(--space-8)] scroll-mt-24 text-foreground sm:py-[var(--space-10)] lg:py-[var(--space-12)] dark:text-on-color"
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex items-center justify-center gap-[var(--space-3)]">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-primary-border sm:w-12"
            />
            <span className="font-hero text-badge font-bold text-primary-text">
              {t("process_label")}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-primary-border sm:w-12"
            />
          </div>

          <h2
            id="process-heading"
            className="mt-[var(--space-2)] font-hero text-landing-section font-bold leading-tight tracking-tight text-heading"
          >
            {highlightLastWord(t("process_title"))}
          </h2>

          <p className="mx-auto mt-[var(--space-2)] max-w-2xl font-hero text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {t("process_description")}
          </p>
        </motion.div>

        <motion.ol
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: reduceMotion
                ? { duration: 0 }
                : { staggerChildren: 0.08, delayChildren: 0.08 },
            },
          }}
          role="list"
          className="mt-[var(--space-6)] grid list-none grid-cols-1 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:mt-[var(--space-8)] sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
        >
          {steps.map((step, index) => {
            const Icon = icons[index] ?? CloudUpload;
            const isLast = index === steps.length - 1;

            return (
              <motion.li
                key={`${index}-${step.title}`}
                variants={itemVariants}
                className="group relative min-w-0 pt-[var(--space-3)]"
              >
                <span className="absolute start-1/2 top-0 z-20 flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-primary font-hero text-sm font-bold leading-none text-primary-foreground shadow-[var(--shadow-md)] ring-4 ring-background/80">
                  {index + 1}
                </span>

                  <div
                  className={cn(
                    "flex h-full flex-col items-center rounded-[var(--radius-2xl)] border border-primary-border/70",
                    "bg-card/75 px-[var(--space-3)] pb-[var(--space-4)] pt-[var(--space-5)] text-center shadow-[var(--shadow-md)] backdrop-blur-sm",
                    "transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary-border group-hover:shadow-[var(--shadow-lg)]",
                    "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0",
                    "dark:border-on-color/10 dark:bg-background/70",
                  )}
                >
                  <span className="mb-[var(--space-2)] flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text shadow-[var(--shadow-sm)] dark:bg-primary/15 dark:text-primary-soft-foreground">
                    <Icon className="size-6" strokeWidth={1.9} aria-hidden="true" />
                  </span>

                  <h3 className="max-w-full font-hero text-sm font-bold leading-snug text-heading sm:text-control">
                    {step.title}
                  </h3>

                  <p className="mt-1 font-hero text-xs leading-5 text-muted-foreground dark:text-neutral-300 sm:text-sm">
                    {step.description}
                  </p>
                </div>

                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -end-5 top-1/2 z-30 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-primary-border bg-card text-primary-text shadow-[var(--shadow-sm)] xl:flex"
                  >
                    <ArrowRight
                      className={cn("size-4", isRTL && "rotate-180")}
                    />
                  </span>
                ) : null}
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
