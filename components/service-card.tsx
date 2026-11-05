"use client";

import { ServiceProps } from "@/data/services";
import {
  Archive,
  BookOpen,
  CalendarDays,
  FileText,
  Image,
  Layers,
  MoveRight,
  NotebookPen,
  Printer,
  Receipt,
  Scissors,
  ShieldCheck,
  Sticker,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const serviceIconMap = {
  bookOpen: BookOpen,
  fileText: FileText,
  layers: Layers,
  printer: Printer,
  notebookPen: NotebookPen,
  archive: Archive,
  image: Image,
  receipt: Receipt,
  sticker: Sticker,
  calendarDays: CalendarDays,
  scissors: Scissors,
  shieldCheck: ShieldCheck,
};

type ServiceIconKey = keyof typeof serviceIconMap;
export type ServiceCardProps = Omit<ServiceProps, "id">;

export function ServiceCard({
  title,
  description,
  icon,
}: ServiceCardProps) {
  const Icon = serviceIconMap[icon as ServiceIconKey] ?? NotebookPen;
  const locale = useLocale();
  const landing = useTranslations("home.landing");
  const isRTL = locale === "ur";

  return (
    <div
      className={`group relative flex min-h-[250px] w-full flex-col overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-border hover:shadow-xl hover:shadow-primary/10 dark:border-on-color/10 dark:bg-[var(--neutral-900)] dark:hover:border-primary/40 ${
        isRTL ? "items-end text-right" : "items-start text-left"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-info opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary-text shadow-sm transition-transform duration-300 group-hover:scale-105 dark:bg-primary/10 dark:text-primary-soft-foreground">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-xl font-semibold text-foreground dark:text-on-color">
        {title}
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground dark:text-neutral-300">
        {description}
      </p>

      <span
        className={`mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-on-color transition-colors group-hover:bg-primary dark:bg-primary dark:group-hover:bg-primary ${
          isRTL ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {landing("order_now")}
        <MoveRight
          className={`h-4 w-4 transition-transform duration-500 ${
            isRTL
              ? "rotate-180 group-hover:-translate-x-1.5"
              : "group-hover:translate-x-1.5"
          }`}
        />
      </span>
    </div>
  );
}
