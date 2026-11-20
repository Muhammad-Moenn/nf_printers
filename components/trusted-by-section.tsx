"use client";

import {
  Fragment,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { highlightTrailingWords } from "@/components/ui/highlight-last-word";
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

const MARQUEE_COPIES = [0, 1, 2];

export default function TrustedBySection() {
  const t = useTranslations("home");
  const landing = useTranslations("home.landing");
  const locale = useLocale();
  const isRTL = locale === "ur";
  const reduceMotion = useHydratedReducedMotion();
  const brands = (t.raw("brands") as Brand[]) ?? [];

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const isHoveringCardRef = useRef(false);
  const isFocusWithinRef = useRef(false);
  const reduceMotionRef = useRef(reduceMotion);

  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  useEffect(() => {
    const group = trackRef.current?.firstElementChild as HTMLElement | null;
    if (!group) return;

    const measure = () => {
      groupWidthRef.current = group.getBoundingClientRect().width;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frameId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min(now - lastTime, 64) / 1000;
      lastTime = now;

      const width = groupWidthRef.current;
      if (width > 0) {
        const paused =
          isHoveringCardRef.current ||
          isFocusWithinRef.current ||
          isDraggingRef.current;

        if (!paused) {
          const speed = reduceMotionRef.current ? 14 : 42;
          offsetRef.current -= speed * elapsed;
        }

        let wrapped = offsetRef.current % width;
        if (wrapped > 0) wrapped -= width;
        offsetRef.current = wrapped;

        track.style.transform = `translate3d(${wrapped}px, 0, 0)`;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.shiftKey
            ? event.deltaY
            : 0;

      if (delta === 0) return;
      event.preventDefault();
      offsetRef.current -= delta;
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    offsetRef.current =
      dragStartOffsetRef.current + (event.clientX - dragStartXRef.current);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  };

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
        <div className={styles.backdrop} />
        <div
          className={cn(
            styles.ring,
            "start-[-16rem] top-1/2 size-[32rem] -translate-y-1/2",
          )}
        />
        <div
          className={cn(
            styles.ring,
            "start-[-9rem] top-1/2 size-[21rem] -translate-y-1/2",
          )}
        />
        <div
          className={cn(
            styles.ring,
            "end-[-16rem] top-1/2 size-[32rem] -translate-y-1/2",
          )}
        />
        <div
          className={cn(
            styles.ring,
            "end-[-9rem] top-1/2 size-[21rem] -translate-y-1/2",
          )}
        />
      </div>

      <motion.div
        dir={isRTL ? "rtl" : "ltr"}
        {...reveal}
        className="mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]"
      >
        <header className="mx-auto max-w-3xl text-center">
          <span className="landing-eyebrow">
            <Award aria-hidden="true" className="size-4 shrink-0" />
            {landing("partners_label")}
          </span>

          <h2
            id="trusted-heading"
            className="landing-section-title mt-[var(--space-4)]"
          >
            {highlightTrailingWords(
              t("brand_title"),
              2,
              "landing-section-title-highlight",
            )}
          </h2>

          <p className="landing-section-description mx-auto mt-[var(--space-3)]">
            {t("brand_description")}
          </p>
        </header>
      </motion.div>

      <motion.div
        dir={isRTL ? "rtl" : "ltr"}
        {...reveal}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }
        }
        className="mx-auto mt-[var(--space-8)] w-full sm:mt-[var(--space-10)]"
      >
        <div className={cn(styles.marqueeShell, "relative w-full")}>
          <div
            ref={viewportRef}
            className={styles.marqueeViewport}
            dir="ltr"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
          >
            <div ref={trackRef} className={styles.track}>
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
                          onPointerEnter={() => {
                            isHoveringCardRef.current = true;
                          }}
                          onPointerLeave={() => {
                            isHoveringCardRef.current = false;
                          }}
                          onFocus={() => {
                            isFocusWithinRef.current = true;
                          }}
                          onBlur={() => {
                            isFocusWithinRef.current = false;
                          }}
                        >
                          <Image
                            src={brand.logo}
                            alt=""
                            width={dimensions.width}
                            height={dimensions.height}
                            sizes="(max-width: 639px) 140px, (max-width: 1023px) 170px, 190px"
                            draggable={false}
                            className={cn(
                              styles.logoImage,
                              "mix-blend-multiply dark:mix-blend-normal dark:invert dark:hue-rotate-180",
                            )}
                          />
                          <span
                            className={styles.logoName}
                            aria-hidden="true"
                            dir="auto"
                          >
                            {brand.name}
                          </span>
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
