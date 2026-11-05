"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { cn } from "@/lib/utils";

export default function About() {
  const t = useTranslations("home.about_us");
  const locale = useLocale();
  const isRTL = locale === "ur";
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const reduceMotion = hasMounted && Boolean(prefersReducedMotion);
  const description = (t.raw("description") as string[]) ?? [];
  const features = (t.raw("features") as string[]) ?? [];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const reveal = (delay = 0, offset = 20) => ({
    initial: reduceMotion ? false : { opacity: 0, y: offset },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
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
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden py-16 scroll-mt-24 sm:py-20 lg:py-24"
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
          <motion.div
            {...reveal()}
            className={cn("min-w-0", isRTL ? "text-right" : "text-left")}
          >
            <span className="inline-flex items-center rounded-full border border-primary-border bg-primary-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-text shadow-[var(--shadow-sm)]">
              {t("badge")}
            </span>

            <h2
              id="about-heading"
              className="mt-5 max-w-xl text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl lg:text-4xl xl:text-5xl"
            >
              {highlightLastWord(t("heading"))}
            </h2>

            {description[0] ? (
              <p className="mt-4 max-w-xl text-base leading-7 text-foreground/80 sm:mt-5 sm:text-lg dark:text-muted-foreground">
                {description[0]}
              </p>
            ) : null}

            {description[1] ? (
              <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/75 dark:text-muted-foreground">
                {description[1]}
              </p>
            ) : null}

            <ul
              role="list"
              className="mt-6 grid max-w-xl grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2"
            >
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm font-medium text-heading"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-primary-text"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full bg-primary px-6 font-hero text-sm font-semibold text-on-color shadow-[var(--shadow-md)] hover:bg-primary-hover sm:text-control"
              >
                <Link href="/services" className="items-center gap-2">
                  {t("button_text")}
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
            </div>
          </motion.div>

          <motion.div
            {...reveal(0.1, 24)}
            className="relative min-w-0"
          >
            <div
              aria-hidden="true"
              className="about-image-glow pointer-events-none absolute -inset-6 z-0 hidden dark:block"
            />
            <Image
              src="/02-about-print-materials.png"
              alt={t("image_alt")}
              width={470}
              height={180}
              sizes="(max-width: 1024px) 92vw, 52vw"
              className="about-image relative z-10 h-auto w-full max-w-none select-none object-contain mix-blend-multiply lg:w-[calc(100%+1rem)] min-[1400px]:w-[calc(100%+3rem)] min-[1600px]:w-[calc(100%+6rem)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
