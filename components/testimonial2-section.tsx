"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";
import { highlightLastWord } from "@/components/ui/highlight-last-word";

type Testimonial = {
  id: number;
  name: { en: string; ur: string };
  role: { en: string; ur: string };
  company: { en: string; ur: string };
  text: { en: string; ur: string };
  rating: number;
  initials: string;
};

const testimonials: Testimonial[] = [
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

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 56;
const SLIDE_DISTANCE = 30;
const EASE = [0.4, 0, 0.2, 1] as const;

const Testimonials2Section = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const locale = useLocale();
  const isRTL = locale === "ur";
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = hasMounted && Boolean(prefersReducedMotion);

  const t = testimonials[current];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Pause while the tab is in the background.
  useEffect(() => {
    const onVisibilityChange = () => setIsTabVisible(!document.hidden);

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Only autoplay while the carousel is actually on screen.
  useEffect(() => {
    const node = sectionRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.25 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index >= current ? 1 : -1);
      setCurrent(index);
    },
    [current],
  );

  const paginate = useCallback((step: number) => {
    setDirection(step);
    setCurrent((index) => (index + step + testimonials.length) % testimonials.length);
  }, []);

  const isPaused =
    !isInView || !isTabVisible || isHovered || isFocused || isDragging || reduceMotion;

  // A timeout (rather than an interval) resets the countdown after any manual navigation.
  useEffect(() => {
    if (isPaused) return;

    const timer = window.setTimeout(() => paginate(1), AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [current, isPaused, paginate]);

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: reduceMotion ? { duration: 0 } : { duration: 0.55, ease: EASE },
  };

  const slideDirection = isRTL ? -direction : direction;

  const cardVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : dir * SLIDE_DISTANCE,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: reduceMotion ? 0 : 0.55, ease: EASE },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : dir * -SLIDE_DISTANCE,
      transition: { duration: reduceMotion ? 0 : 0.3, ease: EASE },
    }),
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      paginate(isRTL ? 1 : -1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      paginate(isRTL ? -1 : 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden py-16 scroll-mt-24 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative overflow-hidden rounded-[var(--radius-4xl)]",
            "border border-primary-border/60 bg-gradient-to-br from-primary-soft via-card to-primary-soft/70",
            "px-4 py-10 shadow-[var(--shadow-sm)] sm:px-6 sm:py-12 lg:px-10 lg:py-14",
            "dark:border-on-color/10 dark:from-[var(--neutral-900)] dark:via-[var(--neutral-900)] dark:to-[var(--neutral-800)]",
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:h-80 sm:w-80"
          />

          <motion.div
            {...reveal}
            className="relative mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center rounded-full border border-primary-border/70 bg-primary-soft px-3.5 py-1 text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.18em] text-primary-text shadow-[var(--shadow-sm)]">
              {isRTL ? "تعریفات" : "Testimonials"}
            </span>

            <h2
              id="testimonials-heading"
              className="mt-3 text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl lg:text-4xl xl:text-5xl"
            >
              {highlightLastWord(
                isRTL ? "ہمارے کلائنٹس کا اعتماد" : "Trusted by Our Clients",
              )}
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-foreground/80 sm:text-base sm:leading-7 dark:text-muted-foreground">
              {isRTL
                ? "جانیے ہمارے گاہک ہماری پرنٹنگ خدمات کے بارے میں کیا کہتے ہیں۔"
                : "Hear what our customers say about our printing services."}
            </p>
          </motion.div>

          <motion.div
            {...reveal}
            role="region"
            aria-roledescription="carousel"
            aria-label={isRTL ? "گاہکوں کی تعریفات" : "Client testimonials"}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setIsFocused(true)}
            onBlurCapture={() => setIsFocused(false)}
            className={cn(
              "relative mt-8 grid grid-cols-1 items-center gap-5 rounded-[var(--radius-3xl)] sm:mt-10",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              "lg:grid-cols-[auto_minmax(0,34rem)_auto] lg:justify-center lg:gap-6",
            )}
          >
            <div className="order-1 min-w-0 lg:order-2">
              <div
                aria-live="polite"
                aria-atomic="true"
                className="relative min-h-[19rem] sm:min-h-[17rem] md:min-h-[15.5rem] lg:min-h-[17rem]"
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                  custom={slideDirection}
                >
                  <motion.article
                    key={t.id}
                    custom={slideDirection}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    dragMomentum={false}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(_, info) => {
                      setIsDragging(false);

                      if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;

                      const swipedLeft = info.offset.x < 0;
                      paginate(isRTL ? (swipedLeft ? -1 : 1) : swipedLeft ? 1 : -1);
                    }}
                    className={cn(
                      "rounded-[var(--radius-2xl)] border border-primary-border/70 bg-card p-5 shadow-[var(--shadow-md)]",
                      "touch-pan-y sm:p-7",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        isRTL && "flex-row-reverse justify-end",
                      )}
                      role="img"
                      aria-label={
                        isRTL
                          ? `${t.rating} میں سے 5 ستارے`
                          : `${t.rating} out of 5 stars`
                      }
                    >
                      {Array.from({ length: t.rating }).map((_, index) => (
                        <motion.span
                          key={index}
                          initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: reduceMotion ? 0 : 0.3,
                            delay: reduceMotion ? 0 : 0.1 + index * 0.05,
                            ease: EASE,
                          }}
                          className="inline-flex"
                        >
                          <Star
                            className="h-4 w-4 fill-warning text-warning sm:h-[1.125rem] sm:w-[1.125rem]"
                            aria-hidden="true"
                          />
                        </motion.span>
                      ))}
                    </div>

                    <motion.p
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.45,
                        delay: reduceMotion ? 0 : 0.16,
                        ease: EASE,
                      }}
                      className="mt-3 text-sm font-semibold leading-6 text-heading sm:text-base sm:leading-7"
                    >
                      &ldquo;{t.text[locale as "en" | "ur"]}&rdquo;
                    </motion.p>

                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.45,
                        delay: reduceMotion ? 0 : 0.24,
                        ease: EASE,
                      }}
                      className={cn(
                        "mt-5 flex items-center gap-3 sm:mt-6",
                        isRTL && "flex-row-reverse",
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-[length:var(--font-size-xs)] font-bold text-on-color shadow-[var(--shadow-sm)] sm:h-11 sm:w-11">
                        {t.initials}
                      </span>
                      <div className={cn("min-w-0", isRTL ? "text-right" : "text-left")}>
                        <p className="truncate text-sm font-semibold text-heading sm:text-base">
                          {t.name[locale as "en" | "ur"]}
                        </p>
                        <p className="truncate text-xs text-muted-foreground sm:text-sm">
                          {t.role[locale as "en" | "ur"]} ·{" "}
                          <span className="font-medium text-primary-text">
                            {t.company[locale as "en" | "ur"]}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  </motion.article>
                </AnimatePresence>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                {testimonials.map((item, index) => {
                  const isActive = index === current;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={
                        isRTL
                          ? `تعریف ${index + 1} دکھائیں`
                          : `Show testimonial ${index + 1}`
                      }
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "h-2.5 cursor-pointer rounded-full transition-all duration-300",
                        isActive
                          ? "w-7 bg-primary"
                          : "w-2.5 bg-muted-foreground/25 hover:bg-muted-foreground/40",
                      )}
                    />
                  );
                })}
              </div>
            </div>

            <div className="order-2 flex items-center justify-center gap-4 lg:contents">
              <button
                type="button"
                onClick={() => paginate(-1)}
                aria-label={isRTL ? "پچھلی تعریف" : "Previous testimonial"}
                className={cn(
                  "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full sm:h-10 sm:w-10",
                  "border border-primary-border/70 bg-card text-primary-text shadow-[var(--shadow-sm)]",
                  "transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary hover:text-on-color hover:shadow-[var(--shadow-md)]",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  "lg:order-1",
                )}
              >
                <ChevronLeft
                  className={cn("h-5 w-5", isRTL && "rotate-180")}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() => paginate(1)}
                aria-label={isRTL ? "اگلی تعریف" : "Next testimonial"}
                className={cn(
                  "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full sm:h-10 sm:w-10",
                  "border border-primary-border/70 bg-card text-primary-text shadow-[var(--shadow-sm)]",
                  "transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary hover:text-on-color hover:shadow-[var(--shadow-md)]",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  "lg:order-3",
                )}
              >
                <ChevronRight
                  className={cn("h-5 w-5", isRTL && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials2Section;
