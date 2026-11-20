"use client";

import { type LucideIcon } from "lucide-react";

type ServiceShowcaseCardProps = {
  title: string;
  Icon: LucideIcon;
};

export function ServiceShowcaseCard({ title, Icon }: ServiceShowcaseCardProps) {
  return (
    <div className="group flex h-full flex-col items-center justify-center gap-[var(--space-3)] rounded-[var(--radius-2xl)] border border-primary-border/60 bg-card/80 px-[var(--space-3)] py-[var(--space-5)] text-center shadow-[var(--landing-card-shadow)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.015] hover:border-primary-border hover:shadow-[var(--landing-card-shadow-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 dark:border-on-color/10 dark:bg-background/70 sm:gap-[var(--space-4)] sm:px-[var(--space-4)] sm:py-[var(--space-6)]">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105 dark:bg-primary/15 dark:text-primary-soft-foreground sm:size-16">
        <Icon className="size-8 sm:size-9" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <h3 className="max-w-full font-hero text-sm font-bold leading-tight text-heading text-balance whitespace-normal break-normal hyphens-none sm:text-base lg:text-lg">
        {title}
      </h3>
    </div>
  );
}
