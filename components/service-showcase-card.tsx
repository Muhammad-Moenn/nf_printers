"use client";

import { type LucideIcon } from "lucide-react";

type ServiceShowcaseCardProps = {
  title: string;
  Icon: LucideIcon;
};

export function ServiceShowcaseCard({ title, Icon }: ServiceShowcaseCardProps) {
  return (
    <div className="group flex min-h-32 h-full flex-col items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-2xl)] border border-primary-border/60 bg-card/75 px-[var(--space-2)] py-[var(--space-4)] text-center shadow-[var(--shadow-md)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-border hover:shadow-[var(--shadow-lg)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-on-color/10 dark:bg-background/70">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105 dark:bg-primary/15 dark:text-primary-soft-foreground sm:size-14">
        <Icon className="size-7 sm:size-8" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <h3 className="max-w-full font-hero text-sm font-bold leading-tight text-heading text-balance whitespace-normal break-normal hyphens-none sm:text-base">
        {title}
      </h3>
    </div>
  );
}
