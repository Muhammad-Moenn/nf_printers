"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Check, Play } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { useHydratedReducedMotion } from "@/components/use-hydrated-reduced-motion";
import { cn } from "@/lib/utils";

export default function About() {
  const t = useTranslations("home.about_us");
  const locale = useLocale();
  const isRTL = locale === "ur";
  const reduceMotion = useHydratedReducedMotion();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const benefits = (t.raw("features") as string[]) ?? [];

  useEffect(() => {
    if (!isVideoPlaying) return;
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        video.muted = true;
        void video.play().catch(() => {});
      });
    }
  }, [isVideoPlaying]);

  const reveal = (delay = 0, distance = 20) => ({
    initial: reduceMotion ? false : { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  const benefitVariants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.12 },
    },
  };

  const benefitItemVariants = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.4 },
    },
  };

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative isolate overflow-hidden py-[var(--space-8)] scroll-mt-24 sm:py-[var(--space-10)] lg:py-[var(--space-12)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute end-0 top-8 -z-10 h-20 w-20 opacity-80 sm:end-8 lg:end-12"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--primary) 75%, transparent) 1.5px, transparent 1.5px)",
          backgroundSize: "12px 12px",
        }}
      />

      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="relative mx-auto grid w-full max-w-[var(--hero-max-width)] items-center gap-[var(--space-6)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:grid-cols-2 lg:gap-[var(--space-8)] lg:px-[var(--space-8)]"
      >
        <motion.div
          {...reveal(0, 18)}
          className="relative min-w-0"
        >
          <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-2xl)] border border-primary-border/60 bg-primary-soft shadow-[var(--shadow-lg)]">
            {isVideoPlaying ? (
              <video
                key="about-video"
                ref={videoRef}
                src="/videos/heroSection-video.mp4"
                autoPlay
                controls
                playsInline
                preload="metadata"
                aria-label={t("video_label")}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => setIsVideoPlaying(false)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <Image
                  src="/printingImage.jpg"
                  alt={t("image_alt")}
                  fill
                  sizes="(max-width: 1023px) 92vw, 50vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setIsVideoPlaying(true)}
                  aria-label={t("play_video")}
                  className="group absolute inset-0 z-10 flex items-center justify-center bg-transparent transition-colors duration-300 hover:bg-heading/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary"
                >
                  <span className="flex size-16 items-center justify-center rounded-full border-4 border-card/90 bg-card text-primary shadow-[var(--shadow-lg)] transition-transform duration-300 group-hover:scale-110 sm:size-[4.5rem]">
                    <Play className="ms-1 size-7 fill-current" aria-hidden="true" />
                  </span>
                </button>
              </>
            )}
          </div>
        </motion.div>

        <div className={cn("min-w-0", isRTL ? "text-end" : "text-start")}>
          <motion.div {...reveal(0.06, 14)}>
            <span className="landing-eyebrow">
              <Building2 aria-hidden="true" className="size-4 shrink-0" />
              {t("badge")}
            </span>
          </motion.div>

          <motion.h2
            id="about-heading"
            {...reveal(0.1, 14)}
            className="landing-section-title mt-[var(--space-4)] max-w-2xl"
          >
            {highlightLastWord(t("heading"), "landing-section-title-highlight")}
          </motion.h2>

          <motion.p
            {...reveal(0.14, 12)}
            className="landing-section-description mt-[var(--space-3)]"
          >
            {t("description")}
          </motion.p>

          <motion.ul
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={benefitVariants}
            role="list"
            className="mt-[var(--space-5)] grid max-w-2xl grid-cols-1 gap-x-[var(--space-5)] gap-y-[var(--space-3)] sm:grid-cols-2 sm:gap-y-[var(--space-4)]"
          >
            {benefits.map((benefit) => (
              <motion.li
                key={benefit}
                variants={benefitItemVariants}
                className="flex min-w-0 items-center gap-[var(--space-2)] font-hero text-sm font-medium leading-snug text-heading sm:text-control"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                <span>{benefit}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div {...reveal(0.24, 10)} className="mt-[var(--space-6)]">
            <Button
              asChild
              size="lg"
              className="group min-h-11 rounded-full bg-primary px-[var(--space-8)] font-hero text-sm font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[var(--shadow-lg)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:text-control"
            >
              <Link
                href="/services"
                className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}
              >
                {t("button_text")}
                <ArrowRight
                  className={cn(
                    "size-4 transition-transform duration-300",
                    isRTL
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1",
                  )}
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
