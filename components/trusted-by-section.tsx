"use client";

import { Fragment } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { useHydratedReducedMotion } from "@/components/use-hydrated-reduced-motion";
import { cn } from "@/lib/utils";

import styles from "./trusted-by-section.module.css";

type Brand = {
  name: string;
  logo: string;
};

const brandLogoDimensions: Record<string, { width: number; height: number }> = {
  "/brand-images/Multan_public_school.jpeg": { width: 225, height: 225 },
  "/brand-images/American_school .jpg": { width: 700, height: 528 },
  "/brand-images/Defense_school.jpeg": { width: 226, height: 223 },
  "/brand-images/eden-school.jpeg": { width: 259, height: 194 },
  "/brand-images/Larat_school .jpeg": { width: 225, height: 225 },
  "/brand-images/British_international_school .jpeg": {
    width: 225,
    height: 225,
  },
  "/brand-images/Punjab_college .png": { width: 225, height: 225 },
  "/brand-images/Ramada_hotel.png": { width: 425, height: 119 },
  "/brand-images/British_grammar_school.jpeg": { width: 225, height: 225 },
  "/brand-images/Nishat_school .jpeg": { width: 200, height: 200 },
};

const dotPattern = {
  backgroundImage:
    "radial-gradient(color-mix(in oklab, var(--primary) 55%, transparent) 1.5px, transparent 1.5px)",
  backgroundSize: "14px 14px",
} as const;

const MARQUEE_COPIES = [0, 1, 2];

export default function TrustedBySection() {
  const t = useTranslations("home");
  const landing = useTranslations("home.landing");
  const locale = useLocale();
  const isRTL = locale === "ur";
  const reduceMotion = useHydratedReducedMotion();
  const brands = (t.raw("brands") as Brand[]) ?? [];

  return (
    <section
      id="partners"
      aria-labelledby="trusted-heading"
      className="relative isolate w-full scroll-mt-24 overflow-hidden py-[var(--space-12)] sm:py-[var(--space-16)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* <div
          className={cn(
            "absolute -start-40 -top-24 h-56 w-[42rem] rounded-[100%] bg-gradient-to-r from-primary/15 via-landing-sky/20 to-transparent blur-3xl",
            styles.waveOne,
          )}
        />
        <div
          className={cn(
            "absolute -end-40 -bottom-24 h-52 w-[38rem] rounded-[100%] bg-gradient-to-l from-primary/15 via-landing-sky/20 to-transparent blur-3xl",
            styles.waveTwo,
          )}
        /> */}
        <div
          className="absolute end-6 top-8 h-20 w-20 opacity-40 sm:end-10 sm:h-24 sm:w-24"
          style={dotPattern}
        />
        <div
          className="absolute bottom-8 start-6 h-16 w-16 opacity-35 sm:start-10 sm:h-20 sm:w-20"
          style={dotPattern}
        />
      </div>

      <motion.div
        dir={isRTL ? "rtl" : "ltr"}
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
        }
        className="mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]"
      >
        <header className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">
            <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
            {landing("partners_label")}
          </span>

          <h2
            id="trusted-heading"
            className="landing-section-title mt-[var(--space-4)]"
          >
            {highlightLastWord(t("brand_title"), "landing-section-title-highlight")}
          </h2>

          <p className="landing-section-description mx-auto mt-[var(--space-3)]">
            {t("brand_description")}
          </p>
        </header>
      </motion.div>

      <div className="relative mt-[var(--space-8)] w-full sm:mt-[var(--space-10)]">
        <div className={cn("relative border-y border-primary-border/35 bg-gradient-to-r from-primary-soft/20 via-card/60 to-primary-soft/20 dark:border-on-color/10 dark:from-primary/5 dark:via-background/40 dark:to-primary/5", styles.marqueeRail)}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
          />

          <div className={styles.marqueeViewport} dir="ltr">
            <div className={styles.track}>
              {MARQUEE_COPIES.map((copy) => (
                <div
                  key={copy}
                  className={styles.group}
                  aria-hidden={copy === 0 ? undefined : true}
                >
                  {brands.map((brand) => {
                    const dimensions = brandLogoDimensions[brand.logo] ?? {
                      width: 225,
                      height: 225,
                    };

                    return (
                      <Fragment key={`${copy}-${brand.logo}-${brand.name}`}>
                        <div
                          className={styles.logoItem}
                          role="img"
                          aria-label={copy === 0 ? brand.name : undefined}
                          tabIndex={copy === 0 ? 0 : undefined}
                        >
                          <Image
                            src={brand.logo}
                            alt=""
                            width={dimensions.width}
                            height={dimensions.height}
                            sizes="(max-width: 639px) 110px, (max-width: 1023px) 150px, 190px"
                            draggable={false}
                            className={cn(
                              styles.logoImage,
                              "mix-blend-multiply dark:mix-blend-normal dark:invert dark:hue-rotate-180",
                            )}
                          />
                          <span
                            className={styles.logoTooltip}
                            aria-hidden="true"
                            dir="auto"
                          >
                            {brand.name}
                          </span>
                        </div>

                        <span
                          className={styles.logoSeparator}
                          aria-hidden="true"
                        />
                      </Fragment>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
          />
        </div>

        <div
          aria-hidden="true"
          className="mx-auto h-px w-[min(92vw,80rem)] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />
        <div
          aria-hidden="true"
          className="mx-auto -mt-1 h-8 w-[min(80vw,64rem)] rounded-full bg-primary/20 blur-2xl"
        />
      </div>
    </section>
  );
}
