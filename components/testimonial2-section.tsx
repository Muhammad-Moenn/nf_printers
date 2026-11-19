"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { cn } from "@/lib/utils";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { useHydratedReducedMotion } from "@/components/use-hydrated-reduced-motion";
import styles from "./testimonial2-section.module.css";

type Testimonial = {
  id: number;
  name: { en: string; ur: string };
  role: { en: string; ur: string };
  company: { en: string; ur: string };
  text: { en: string; ur: string };
  rating: number;
  initials: string;
};

const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: { en: "Jamel Ali", ur: "جمیل علی" },
    role: { en: "Owner", ur: "مالک" },
    company: { en: "Aali Publisher", ur: "عالی پبلشر" },
    text: {
      en: "NF Printers provides very good book printing with clear text and strong binding. Their private school copies and registers are neat, durable, and well-finished. They are reliable and easy to work with.",
      ur: "NF پرنٹرز بہترین کتابی پرنٹنگ فراہم کرتے ہیں، صاف متن اور مضبوط بائنڈنگ کے ساتھ۔ ان کی اسکول کاپیاں اور رجسٹرز صاف، پائیدار اور اچھی فِنشنگ کے حامل ہوتے ہیں۔ ان کے ساتھ کام کرنا آسان اور قابلِ اعتماد ہے۔",
    },
    rating: 5,
    initials: "JA",
  },
  {
    id: 2,
    name: { en: "Kazi Sajjad", ur: "قاضی سجاد" },
    role: { en: "Print Production Manager", ur: "پرنٹ پروڈکشن مینیجر" },
    company: { en: "Honey Book Center", ur: "ہنی بک سینٹر" },
    text: {
      en: "Excellent quality and super fast delivery. Highly recommended for anyone who needs reliable printing.",
      ur: "بہترین معیار اور بہت تیز ڈیلیوری۔ ہر اُس شخص کے لیے انتہائی موزوں جو قابلِ اعتماد پرنٹنگ چاہتا ہو۔",
    },
    rating: 5,
    initials: "KS",
  },
  {
    id: 3,
    name: { en: "Prof. Subhan Sharwani", ur: "پروفیسر سبحان شروانی" },
    role: { en: "Principal", ur: "پرنسپل" },
    company: { en: "Punjab Group of Colleges", ur: "پنجاب گروپ آف کالجز" },
    text: {
      en: "NF Printers has greatly enhanced the quality of our academic materials.",
      ur: "NF پرنٹرز نے ہمارے تعلیمی مواد کے معیار کو بہت بہتر بنایا ہے۔",
    },
    rating: 5,
    initials: "SS",
  },
  {
    id: 4,
    name: { en: "Prof. Muhammad Shakeel", ur: "پروفیسر محمد شکیل" },
    role: { en: "Owner", ur: "مالک" },
    company: { en: "Shakeel Publications", ur: "شکیل پبلیکیشنز" },
    text: {
      en: "NF Printers has significantly improved the quality of our publications.",
      ur: "NF پرنٹرز نے ہماری اشاعتوں کے معیار کو نمایاں طور پر بہتر بنایا ہے۔",
    },
    rating: 5,
    initials: "MS",
  },
  {
    id: 5,
    name: { en: "Dr. Muhammad Imran", ur: "ڈاکٹر محمد عمران" },
    role: { en: "Professor", ur: "پروفیسر" },
    company: { en: "BZU", ur: "بی زی یو" },
    text: {
      en: "Fast turnaround and excellent print quality.",
      ur: "تیز سروس اور بہترین پرنٹنگ کوالٹی۔",
    },
    rating: 5,
    initials: "MI",
  },
  {
    id: 6,
    name: { en: "Hafiz Waheed", ur: "حافظ وحید" },
    role: { en: "Owner", ur: "مالک" },
    company: { en: "Waheed Book Center", ur: "وحید بک سینٹر" },
    text: {
      en: "NF Printers consistently delivers high-quality printing.",
      ur: "NF پرنٹرز ہمیشہ اعلیٰ معیار کی پرنٹنگ فراہم کرتے ہیں۔",
    },
    rating: 5,
    initials: "HW",
  },
];

const AUTOPLAY_MS = 3200;
const SLIDE_SPEED = 650;
const CARD_ANIMATION_SECONDS = 0.65;

const Testimonials2Section = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperInstance | null>(null);

  const isRTL = useLocale() === "ur";
  const t = useTranslations("home.testimonial_section");
  const reduceMotion = useHydratedReducedMotion();

  const slideSpeed = reduceMotion ? 450 : SLIDE_SPEED;
  const previousCardX = reduceMotion ? 0 : isRTL ? 10 : -10;

  const cardVariants = {
    active: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1.1,
    },
    previous: {
      opacity: 0.65,
      x: previousCardX,
      y: 0,
      scale: 0.93,
    },
    next: {
      opacity: 0.65,
      x: -previousCardX,
      y: 0,
      scale: 0.93,
    },
    inactive: {
      opacity: 0.45,
      x: 0,
      y: reduceMotion ? 0 : 8,
      scale: 0.9,
    },
  };

  const cardTransition = reduceMotion
    ? { duration: 0.6 }
    : {
        duration: CARD_ANIMATION_SECONDS,
        ease: [0.5, 1, 0.5, 1] as const,
      };

  const syncActiveIndex = (swiper: SwiperInstance) => {
    setActiveIndex(swiper.realIndex);
  };

  const goPrev = () => {
    const swiper = swiperRef.current;

    if (!swiper || swiper.destroyed) return;

    swiper.slidePrev(slideSpeed);
  };

  const goNext = () => {
    const swiper = swiperRef.current;

    if (!swiper || swiper.destroyed) return;

    swiper.slideNext(slideSpeed);
  };

  const goToSlide = (index: number) => {
    const swiper = swiperRef.current;

    if (!swiper || swiper.destroyed) return;
    if (index === swiper.realIndex) return;

    swiper.slideToLoop(index, slideSpeed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();

      if (isRTL) goNext();
      else goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();

      if (isRTL) goPrev();
      else goNext();
    }
  };

  const renderCard = (
    item: Testimonial,
    index: number,
    position: "active" | "previous" | "next" | "inactive",
  ) => {
    const isActive = index === activeIndex;

    return (
      <motion.div
        initial={false}
        animate={position}
        variants={cardVariants}
        transition={cardTransition}
        className="flex h-full w-full"
      >
        <article
          onClick={isActive ? undefined : () => goToSlide(index)}
          onKeyDown={
            isActive
              ? undefined
              : (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    goToSlide(index);
                  }
                }
          }
          role={isActive ? undefined : "button"}
          tabIndex={isActive ? -1 : 0}
          aria-current={isActive ? "true" : undefined}
          aria-label={
            isActive ? undefined : t("show_testimonial", { index: index + 1 })
          }
          className={cn(
            "relative flex w-full flex-col rounded-[var(--radius-2xl)] border border-primary-border/60 bg-card/75 p-[var(--space-4)] shadow-[var(--shadow-sm)] backdrop-blur-sm transition-[box-shadow,border-color] duration-500 sm:p-[var(--space-5)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isActive
              ? "border-primary/40 shadow-[var(--shadow-lg)]"
              : "cursor-pointer hover:border-primary/30",
          )}
        >
          <Quote
            className="size-6 shrink-0 fill-primary text-primary"
            aria-hidden="true"
          />

          <p className="mt-[var(--space-2)] flex-1 font-hero text-sm font-medium leading-6 text-heading sm:text-control sm:leading-6">
            {item.text[isRTL ? "ur" : "en"]}
          </p>

          <div
            className={cn(
              "mt-[var(--space-4)] flex min-w-0 items-center gap-3",
              isRTL && "flex-row-reverse",
            )}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft font-hero text-sm font-bold text-primary-text ring-2 ring-card shadow-[var(--shadow-sm)]">
              {item.initials}
            </span>

            <div
              className={cn(
                "min-w-0 flex-1",
                isRTL ? "text-end" : "text-start",
              )}
            >
              <p className="font-hero text-sm font-bold leading-snug text-heading">
                {item.name[isRTL ? "ur" : "en"]}
              </p>

              <p className="mt-0.5 font-hero text-xs leading-snug text-muted-foreground">
                {item.role[isRTL ? "ur" : "en"]} ·{" "}
                {item.company[isRTL ? "ur" : "en"]}
              </p>

              <div
                className={cn(
                  "mt-1.5 flex items-center gap-0.5",
                  isRTL && "flex-row-reverse justify-end",
                )}
                role="img"
                aria-label={t("rating_label", { rating: item.rating })}
              >
                {Array.from({ length: item.rating }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="size-3.5 fill-warning text-warning"
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>
        </article>
      </motion.div>
    );
  };

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden py-[var(--space-8)] scroll-mt-24 sm:py-[var(--space-10)] lg:py-[var(--space-12)]"
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]"
      >
        <header className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-[var(--space-3)]">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-primary-border sm:w-12"
            />

            <span className="font-hero text-badge font-bold text-primary-text">
              {t("eyebrow")}
            </span>

            <span
              aria-hidden="true"
              className="h-px w-8 bg-primary-border sm:w-12"
            />
          </div>

          <h2
            id="testimonials-heading"
            className="mt-[var(--space-2)] font-hero text-landing-section font-bold leading-tight tracking-tight text-heading"
          >
            {highlightLastWord(t("title"))}
          </h2>

          <p className="mx-auto mt-[var(--space-2)] max-w-2xl font-hero text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {t("description")}
          </p>
        </header>

        <div
          role="region"
          aria-roledescription={t("carousel_role")}
          aria-label={t("carousel_label")}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="relative mt-[var(--space-6)] outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:mt-[var(--space-8)]"
        >
          <div className="md:px-12 lg:px-0">
            <div className="overflow-hidden px-3 py-8">
              <Swiper
                key={isRTL ? "rtl" : "ltr"}
                modules={[Autoplay]}
                dir={isRTL ? "rtl" : "ltr"}
                loop
                centeredSlides
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={{
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 28,
                  },
                }}
                speed={slideSpeed}
                autoplay={{
                  delay: AUTOPLAY_MS,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: false,
                  // Keep the autoplay clock independent from Swiper/Framer transitions.
                  waitForTransition: true,
                }}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  syncActiveIndex(swiper);

                  if (reduceMotion) {
                    swiper.autoplay.stop();
                    return;
                  }

                  swiper.autoplay.start();
                }}
                onRealIndexChange={syncActiveIndex}
                onBeforeDestroy={() => {
                  swiperRef.current = null;
                }}
                className={styles.testimonialSwiper}
              >
                {testimonialsData.map((item, index) => (
                  <SwiperSlide key={item.id}>
                    {({ isActive: slideIsActive, isPrev, isNext }) =>
                      renderCard(
                        item,
                        index,
                        slideIsActive
                          ? "active"
                          : isPrev
                            ? "previous"
                            : isNext
                              ? "next"
                              : "inactive",
                      )
                    }
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Desktop navigation */}
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("previous")}
            className="absolute start-0 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-md)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none md:inline-flex lg:-start-5"
          >
            <ChevronLeft
              className={cn("size-5", isRTL && "rotate-180")}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label={t("next")}
            className="absolute end-0 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-md)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none md:inline-flex lg:-end-5"
          >
            <ChevronRight
              className={cn("size-5", isRTL && "rotate-180")}
              aria-hidden="true"
            />
          </button>

          {/* Dots and mobile navigation */}
          <div className="mt-[var(--space-1)] flex items-center justify-center gap-[var(--space-3)]">
            <button
              type="button"
              onClick={goPrev}
              aria-label={t("previous")}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-md)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none md:hidden"
            >
              <ChevronLeft
                className={cn("size-5", isRTL && "rotate-180")}
                aria-hidden="true"
              />
            </button>

            <div className="flex items-center justify-center">
              {testimonialsData.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={t("show_testimonial", {
                    index: index + 1,
                  })}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className="flex size-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span
                    className={cn(
                      "block size-2.5 rounded-full transition-all duration-300",
                      activeIndex === index
                        ? "scale-125 bg-primary"
                        : "bg-primary/25 hover:bg-primary/50",
                    )}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label={t("next")}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-md)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none md:hidden"
            >
              <ChevronRight
                className={cn("size-5", isRTL && "rotate-180")}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials2Section;
