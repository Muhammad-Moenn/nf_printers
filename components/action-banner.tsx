"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as ScrollLink } from "react-scroll";
import { LayoutDashboard, LogInIcon, MoveRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuthUser } from "@/components/auth-provider";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { Button } from "@/components/ui/button";
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

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: reduceMotion
      ? { duration: 0 }
      : {
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1] as const,
        },
  });

  const buttonClassName = cn(
    "h-[var(--space-12)] w-full rounded-full! px-[var(--space-6)]",
    "text-[length:var(--font-size-sm)] font-semibold",
    "transition-all duration-300 motion-reduce:transition-none",
    "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
    "sm:w-auto",
  );

  return (
    <section
      id="cta"
      aria-labelledby="action-banner-heading"
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden py-[var(--space-12)] scroll-mt-24 sm:py-[var(--space-16)]"
    >
      <div className="mx-auto max-w-7xl px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <div
          className={cn(
            "relative overflow-hidden rounded-[var(--radius-2xl)]",
            "bg-gradient-to-br from-primary to-primary-hover",
            "px-[var(--space-6)] py-[var(--space-10)] shadow-[var(--shadow-lg)]",
            "sm:px-[var(--space-8)] sm:py-[var(--space-12)]",
            "lg:px-[var(--space-12)] lg:py-[var(--space-16)]",
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <Image
              src="/03-testimonial-print-materials.png"
              alt=""
              width={720}
              height={390}
              sizes="(max-width: 640px) 74vw, (max-width: 1024px) 56vw, 46vw"
              className="absolute bottom-0 end-0 w-[74%] max-w-none object-contain opacity-20 mix-blend-luminosity sm:w-[56%] sm:opacity-30 lg:w-[46%]"
            />
            <div
              className={cn(
                "absolute inset-0",
                isRTL
                  ? "bg-gradient-to-l from-primary via-primary/85 to-primary/35"
                  : "bg-gradient-to-r from-primary via-primary/85 to-primary/35",
              )}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-2xl text-center lg:mx-0 lg:text-start">
            <motion.div {...reveal()}>
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-[var(--space-2)] rounded-full!",
                  "border-on-color/25 bg-on-color/10 px-[var(--space-3)] py-[var(--space-1)]",
                  "text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.18em]",
                  "text-on-color shadow-[var(--shadow-sm)]",
                  "[&>svg]:size-[var(--space-4)]",
                )}
              >
                <Sparkles aria-hidden="true" />
                {landing("contact_cta")}
              </Badge>
            </motion.div>

            <motion.h2
              id="action-banner-heading"
              {...reveal(0.06)}
              className="mt-[var(--space-4)] text-2xl font-bold leading-tight tracking-tight text-on-color sm:text-3xl lg:text-4xl xl:text-5xl"
            >
              {highlightLastWord(heading, "text-sky-200")}
            </motion.h2>

            <motion.p
              {...reveal(0.12)}
              className="mx-auto mt-[var(--space-3)] max-w-xl text-[length:var(--font-size-sm)] leading-6 text-on-color/80 sm:text-[length:var(--font-size-base)] sm:leading-7 lg:mx-0"
            >
              {description}
            </motion.p>

            <motion.div
              {...reveal(0.18)}
              className="mt-[var(--space-8)] flex flex-col justify-center gap-[var(--space-3)] sm:flex-row lg:justify-start"
            >
              {showPrimary && (
                <Button
                  asChild
                  className={cn(
                    buttonClassName,
                    "group bg-on-color text-primary-text shadow-[var(--shadow-md)]",
                    "hover:bg-primary-soft hover:shadow-[var(--shadow-lg)]",
                  )}
                >
                  <Link
                    href={primaryHref}
                    className={cn(
                      "flex items-center gap-[var(--space-2)]",
                      isRTL && "flex-row-reverse",
                    )}
                  >
                    {primaryText}
                    <MoveRight
                      className={cn(
                        "h-[var(--space-4)] w-[var(--space-4)] transition-transform duration-300",
                        isRTL
                          ? "rotate-180 group-hover:-translate-x-1"
                          : "group-hover:translate-x-1",
                      )}
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              )}

              {!user ? (
                <Button
                  asChild
                  className={cn(
                    buttonClassName,
                    "border border-on-color/30 bg-on-color/10 text-on-color",
                    "hover:border-on-color/40 hover:bg-on-color/20",
                  )}
                >
                  <Link
                    href={secondaryHref}
                    className={cn(
                      "flex items-center gap-[var(--space-2)]",
                      isRTL && "flex-row-reverse",
                    )}
                  >
                    {secondaryText}
                    <LogInIcon
                      className="h-[var(--space-4)] w-[var(--space-4)]"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className={cn(
                    buttonClassName,
                    "border border-on-color/30 bg-on-color/10 text-on-color",
                    "hover:border-on-color/40 hover:bg-on-color/20",
                  )}
                >
                  <ScrollLink
                    to="contact"
                    smooth={true}
                    offset={-70}
                    duration={500}
                    className={cn(
                      "flex cursor-pointer items-center gap-[var(--space-2)]",
                      isRTL && "flex-row-reverse",
                    )}
                  >
                    {landing("cta_contact")}
                    <LayoutDashboard
                      className="h-[var(--space-4)] w-[var(--space-4)]"
                      aria-hidden="true"
                    />
                  </ScrollLink>
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
