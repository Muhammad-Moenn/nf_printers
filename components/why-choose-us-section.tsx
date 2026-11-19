"use client";

import { motion } from "framer-motion";
import { Gem, HandCoins, Headset, Zap, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { useHydratedReducedMotion } from "@/components/use-hydrated-reduced-motion";
import { cn } from "@/lib/utils";

type BenefitCard = {
  title: string;
  description: string;
};

const benefitIcons: LucideIcon[] = [Gem, Zap, HandCoins, Headset];
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export default function WhyChooseUsSection() {
  const t = useTranslations("home.why_choose_us");
  const locale = useLocale();
  const isRTL = locale === "ur";
  const reduceMotion = useHydratedReducedMotion();
  const cards = t.raw("cards") as BenefitCard[];

  const revealVariants = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 0.55, ease: REVEAL_EASE },
    },
  };

  const cardListVariants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.12, delayChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 22, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 190, damping: 23 },
    },
  };

  return (
    <section
      id="why-choose-us"
      aria-labelledby="why-choose-us-heading"
      className="relative isolate overflow-hidden py-[var(--space-8)] scroll-mt-24 text-foreground sm:py-[var(--space-10)] lg:py-[var(--space-12)] dark:text-on-color"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-4 top-5 h-16 w-16 opacity-60 sm:start-8 sm:h-20 sm:w-20 lg:start-12"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--primary) 55%, transparent) 1.5px, transparent 1.5px)",
          backgroundSize: "12px 12px",
        }}
      />

      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]"
      >
        <motion.header
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={revealVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex items-center justify-center gap-[var(--space-3)]">
            <span aria-hidden="true" className="h-px w-8 bg-primary-border sm:w-12" />
            <span className="font-hero text-badge font-bold text-primary-text">
              {t("eyebrow")}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-primary-border sm:w-12" />
          </div>

          <h2
            id="why-choose-us-heading"
            className="mt-[var(--space-2)] font-hero text-landing-section font-bold leading-tight tracking-tight text-heading"
          >
            {t("title")}
          </h2>
        </motion.header>

        <motion.ul
          role="list"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={cardListVariants}
          className="mt-[var(--space-6)] grid list-none grid-cols-2 items-stretch gap-[var(--space-3)] sm:mt-[var(--space-8)] sm:gap-[var(--space-4)] lg:grid-cols-4"
        >
          {cards.map((card, index) => {
            const Icon = benefitIcons[index] ?? Gem;

            return (
              <motion.li
                key={card.title}
                variants={cardVariants}
                className="min-w-0"
              >
                <motion.article
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.015 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 320, damping: 24 }
                  }
                  className="flex h-full min-w-0 flex-col items-center justify-center gap-[var(--space-3)] rounded-[var(--radius-2xl)] border border-primary-border/60 bg-card/80 px-[var(--space-3)] py-[var(--space-5)] text-center shadow-[var(--landing-card-shadow)] backdrop-blur-sm transition-shadow duration-300 hover:border-primary-border hover:shadow-[var(--landing-card-shadow-hover)] sm:gap-[var(--space-4)] sm:px-[var(--space-4)] sm:py-[var(--space-6)] dark:border-on-color/10 dark:bg-background/70"
                >
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text shadow-[var(--shadow-sm)] sm:size-16">
                    <Icon
                      className={cn(
                        "size-8 sm:size-9",
                        index === 1 && "fill-current",
                      )}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0">
                    <h3 className="font-hero text-sm font-bold leading-tight text-heading text-balance sm:text-base lg:text-lg">
                      {card.title}
                    </h3>
                    <p className="mx-auto mt-[var(--space-2)] max-w-52 font-hero text-xs leading-5 text-foreground/75 text-balance sm:text-sm sm:leading-6 dark:text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </motion.article>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
