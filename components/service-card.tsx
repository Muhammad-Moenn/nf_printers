"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { ServiceProps } from "@/data/services";

type ServiceCardProps = Omit<ServiceProps, "id">;

const imageByIcon: Record<string, string> = {
  bookOpen: "/03-testimonial-print-materials.png",
  fileText: "/03-testimonial-print-materials.png",
  image: "/03-testimonial-print-materials.png",
  notebookPen: "/02-about-print-materials.png",
  calendarDays: "/02-about-print-materials.png",
  sticker: "/02-about-print-materials.png",
  receipt: "/02-about-print-materials.png",
  layers: "/printingImage.jpg",
  archive: "/printingImage.jpg",
  scissors: "/printingImage.jpg",
  shieldCheck: "/printingImage.jpg",
  printer: "/machine-image.png",
};

function getServiceImage(title: string, icon: string) {
  const normalizedTitle = title.toLowerCase();

  if (/book|brochure|flyer|poster|cover/.test(normalizedTitle)) {
    return "/03-testimonial-print-materials.png";
  }
  if (/diary|notebook|calendar|business card|register|invoice|receipt/.test(normalizedTitle)) {
    return "/02-about-print-materials.png";
  }
  if (/binding|lamination|cutting|trimming/.test(normalizedTitle)) {
    return "/printingImage.jpg";
  }

  return imageByIcon[icon] ?? "/printingImage.jpg";
}

export function ServiceCard({ title, description, icon }: ServiceCardProps) {
  const t = useTranslations("home.services_page");
  const isRTL = useLocale() === "ur";
  const iconKey = typeof icon === "string" ? icon : "printer";
  const image = getServiceImage(title, iconKey);
  const isPhoto = image.endsWith(".jpg");

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="group relative flex min-h-[9.25rem] w-full items-center gap-3 overflow-hidden rounded-[var(--radius-2xl)] border border-primary-border/60 bg-card/90 p-3.5 shadow-[var(--landing-card-shadow)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary-border hover:shadow-[var(--landing-card-shadow-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[9.75rem] sm:gap-4 sm:p-4 dark:border-on-color/10 dark:bg-background/85"
    >
      <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

      <span className="relative flex h-[4.75rem] w-[5.25rem] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-soft/70 to-card sm:h-20 sm:w-24 dark:from-primary/10 dark:to-background">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 639px) 84px, 96px"
          className={isPhoto ? "object-cover" : "object-contain p-1"}
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col self-stretch py-0.5">
        <span className="font-hero text-sm font-bold leading-snug text-heading sm:text-base">
          {title}
        </span>
        <span className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground sm:text-sm dark:text-neutral-300">
          {description}
        </span>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-primary-text sm:text-sm dark:text-primary-soft-foreground">
          {t("customize_cta")}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
          />
        </span>
      </span>

      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary-border/60 bg-card text-primary-text shadow-[var(--shadow-sm)] transition-[transform,background-color,color] duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground dark:border-on-color/15 dark:bg-background dark:text-primary-soft-foreground">
        <ArrowRight
          aria-hidden="true"
          className="size-4 rtl:rotate-180"
        />
      </span>
    </div>
  );
}
