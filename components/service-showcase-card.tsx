"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ServiceShowcaseCardProps = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

export function ServiceShowcaseCard({
  title,
  description,
  Icon,
}: ServiceShowcaseCardProps) {
  const landing = useTranslations("home.landing");
  const locale = useLocale();
  const isRTL = locale === "ur";

  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[11.5rem] overflow-hidden rounded-[var(--radius-3xl)]",
        "border border-primary-border/70 bg-gradient-to-br from-card via-card to-primary-soft/70",
        "p-5 shadow-[var(--shadow-sm)] transition-all duration-300 sm:p-6",
        "hover:-translate-y-1 hover:border-primary-border hover:shadow-[var(--shadow-lg)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "dark:border-on-color/10 dark:from-[var(--neutral-900)] dark:via-[var(--neutral-900)] dark:to-[var(--neutral-800)]",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-16 h-44 w-44 rounded-full border border-primary-border/40 bg-primary-soft/60 dark:border-primary/10 dark:bg-primary/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -right-8 h-32 w-32 rounded-full bg-card/70 dark:bg-[var(--neutral-900)]/70"
      />

      <div
        className={cn(
          "relative flex min-w-0 items-stretch gap-4 sm:gap-5",
          isRTL && "flex-row-reverse",
        )}
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-2xl)] bg-primary-soft text-primary-text shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105 dark:bg-primary/10 dark:text-primary-soft-foreground sm:h-20 sm:w-20">
          <Icon
            className="h-8 w-8 sm:h-9 sm:w-9"
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </span>

        <span
          aria-hidden="true"
          className="hidden w-px shrink-0 self-stretch bg-primary-border/90 dark:bg-primary/30 sm:block"
        />

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            isRTL ? "text-right" : "text-left",
          )}
        >
          <h3 className="text-lg font-bold leading-snug text-heading sm:text-xl">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {description}
          </p>
          <span
            className={cn(
              "mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary-text sm:text-base",
              isRTL && "flex-row-reverse",
            )}
          >
            {landing("order_now")}
            <ArrowRight
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isRTL
                  ? "rotate-180 group-hover:-translate-x-1"
                  : "group-hover:translate-x-1",
              )}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
