"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CircleCheck,
  CloudUpload,
  FilePenLine,
  PackageCheck,
  Settings,
  Truck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { highlightLastWord } from "@/components/ui/highlight-last-word";

const icons = [
  CloudUpload,
  FilePenLine,
  CircleCheck,
  Settings,
  PackageCheck,
  Truck,
];

export default function PrintProcessSection() {
  const locale = useLocale();
  const t = useTranslations("home.landing");
  const isRTL = locale === "ur";
  const steps = t.raw("process_steps") as {
    title: string;
    description: string;
  }[];

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="relative overflow-hidden py-16 text-foreground scroll-mt-24 sm:py-20 dark:text-on-color"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full border border-primary-border/70 bg-primary-soft px-3.5 py-1 text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.18em] text-primary-text shadow-[var(--shadow-sm)]">
            {t("process_label")}
          </span>
          <h2
            id="process-heading"
            className="mt-3 text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl lg:text-4xl xl:text-5xl xl:whitespace-nowrap"
          >
            {highlightLastWord(t("process_title"))}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {t("process_description")}
          </p>
        </motion.div>

        <ol
          role="list"
          className="mt-10 grid list-none grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-3"
        >
          {steps.map((step, index) => {
            const Icon = icons[index] ?? CloudUpload;
            const isLast = index === steps.length - 1;

            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className={cn(
                  "group flex h-full min-w-0 flex-col rounded-2xl border border-primary-border/70",
                  "bg-gradient-to-b from-card to-primary-soft/60 p-4",
                  "shadow-[var(--shadow-sm)] transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-primary-border hover:shadow-[var(--shadow-md)]",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  "dark:from-[var(--neutral-900)] dark:to-[var(--neutral-800)] dark:hover:border-on-color/20",
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex items-center justify-between gap-2",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[length:var(--font-size-caption)] font-semibold text-on-color shadow-[var(--shadow-sm)]">
                    {index + 1}
                  </span>

                  <Icon
                    className="h-6 w-6 shrink-0 text-primary-text dark:text-primary-soft-foreground"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  {isLast ? (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                    />
                  ) : (
                    <ArrowRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-primary-text/45 dark:text-primary-soft-foreground/45",
                        isRTL && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <h3 className="text-center text-sm font-semibold leading-snug text-heading">
                  {step.title}
                </h3>

                <p className="mt-1.5 text-center text-xs leading-5 text-muted-foreground dark:text-neutral-300">
                  {step.description}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
