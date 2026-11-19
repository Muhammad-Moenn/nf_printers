"use client";

import Image from "next/image";
import { Link as ScrollLink } from "react-scroll";
import { LogInIcon, MoveRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuthUser } from "@/components/auth-provider";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function ActionBanner() {
  const locale = useLocale();
  const isRTL = locale === "ur";
  const t = useTranslations("home.actionbanner");
  const landing = useTranslations("home.landing");
  const { user } = useAuthUser();
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const reduceMotion = hasMounted && Boolean(prefersReducedMotion);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const heading = t("heading");
  const description = t("description");
  const primaryText = t("primaryText");
  const primaryHref = t("primaryHref");
  const secondaryText = t("secondaryText");
  const secondaryHref = t("secondaryHref");
  const showPrimary = t("showPrimary") === "true";
  const showSecondary = t("showSecondary") === "true";

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      id="cta"
      aria-labelledby="action-banner-heading"
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden py-[var(--space-8)] scroll-mt-24 sm:py-[var(--space-10)] lg:py-[var(--space-12)]"
    >
      <div className="mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <div
          className={cn(
            "relative isolate flex min-h-[18rem] overflow-hidden rounded-[var(--radius-3xl)] border border-primary-border/50 px-[var(--space-5)] py-[var(--space-7)] shadow-[var(--shadow-lg)] sm:min-h-[17rem] sm:px-[var(--space-8)] sm:py-[var(--space-8)] lg:min-h-[15rem] lg:items-center lg:px-[var(--space-10)] lg:py-[var(--space-8)]",
            isRTL
              ? "bg-gradient-to-l from-[var(--landing-footer)] via-primary-hover to-primary"
              : "bg-gradient-to-bl from-primary  to-[var(--landing-footer)]",
          )}
        >
          <Image
            src="/03-testimonial-print-materials.png"
            alt=""
            aria-hidden="true"
            width={960}
            height={640}
            sizes="(max-width: 639px) 72vw, (max-width: 1023px) 58vw, 48vw"
            className={cn(
              "pointer-events-none absolute bottom-0 end-0 z-0 h-full w-[72%] object-contain object-right-bottom mix-blend-luminosity opacity-75 sm:w-[58%] lg:w-[50%]",
              isRTL && "object-left-bottom",
            )}
          />

          <div
            className={cn(
              "relative z-10 w-full max-w-2xl",
              isRTL ? "text-end" : "text-start",
            )}
          >
            <motion.h2
              id="action-banner-heading"
              {...reveal()}
              className="landing-section-title text-on-color"
            >
              {heading}
            </motion.h2>

            <motion.p
              {...reveal(0.06)}
              className="landing-section-description mt-[var(--space-2)] max-w-xl text-on-color/85 sm:mt-[var(--space-3)]"
            >
              {description}
            </motion.p>

            <motion.div
              {...reveal(0.12)}
              className={cn(
                "mt-[var(--space-4)] flex flex-col gap-[var(--space-3)] sm:mt-[var(--space-5)] sm:flex-row sm:items-center",
                isRTL && "sm:flex-row-reverse",
              )}
            >
              <Button
                asChild
                className="group min-h-12 w-full rounded-full! bg-on-color !px-[var(--space-5)] font-hero text-control font-bold text-primary-text shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-soft hover:shadow-[var(--shadow-lg)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
              >
                <ScrollLink
                  to="contact"
                  smooth
                  offset={-70}
                  duration={500}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  {landing("cta_contact")}
                  <MoveRight
                    className={cn(
                      "size-4 transition-transform duration-300",
                      isRTL
                        ? "rotate-180 group-hover:-translate-x-1"
                        : "group-hover:translate-x-1",
                    )}
                    aria-hidden="true"
                  />
                </ScrollLink>
              </Button>

              {!user && showPrimary ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Link
                    href={primaryHref}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-hero text-sm font-semibold text-on-color/90 underline decoration-on-color/40 underline-offset-4 transition-colors hover:text-on-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-color/70"
                  >
                    {primaryText}
                  </Link>
                  {showSecondary ? (
                    <Link
                      href={secondaryHref}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-hero text-sm font-semibold text-on-color/90 underline decoration-on-color/40 underline-offset-4 transition-colors hover:text-on-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-color/70"
                    >
                      {secondaryText}
                      <LogInIcon className="size-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
