"use client";

import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { cn } from "@/lib/utils";

type Faq = {
  question: string;
  answer: string;
};

export default function FAQSection() {
  const t = useTranslations("home.faq_section");
  const landing = useTranslations("home.landing");
  const faqs = (t.raw("faqs") as Faq[]) ?? [];
  const locale = useLocale();
  const isRTL = locale === "ur";
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const reduceMotion = hasMounted && Boolean(prefersReducedMotion);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: reduceMotion
      ? { duration: 0 }
      : {
          duration: 0.45,
          delay,
          ease: [0.22, 1, 0.36, 1] as const,
        },
  });

  return (
    <section
      id="faqs"
      aria-labelledby="faq-heading"
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden py-[var(--space-12)] scroll-mt-24 sm:py-[var(--space-16)]"
    >
      <div className="relative mx-auto max-w-7xl px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <div
          className={cn(
            "relative overflow-hidden rounded-[var(--radius-4xl)]",
            "border border-primary-border/60 bg-gradient-to-br from-primary-soft via-card to-primary-soft/70",
            "px-[var(--space-4)] py-[var(--space-8)] shadow-[var(--shadow-sm)]",
            "sm:px-[var(--space-6)] sm:py-[var(--space-10)]",
            "lg:px-[var(--space-10)] lg:py-[var(--space-12)]",
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

          <div className="relative mx-auto max-w-4xl">
            <motion.div
              {...reveal()}
              className="mx-auto max-w-3xl text-center"
            >
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-[var(--space-2)] rounded-full!",
                  "border-primary-border/70 bg-primary-soft px-[var(--space-3)] py-[var(--space-1)]",
                  "text-[length:var(--font-size-xs)] font-semibold uppercase tracking-[0.18em]",
                  "text-primary-text shadow-[var(--shadow-sm)]",
                  "[&>svg]:size-[var(--space-4)]",
                )}
              >
                <HelpCircle aria-hidden="true" />
                {landing("faq_label")}
              </Badge>

              <h2
                id="faq-heading"
                className="mt-[var(--space-4)] text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl lg:text-4xl xl:text-5xl"
              >
                {highlightLastWord(t("title"))}
              </h2>

              <p className="mx-auto mt-[var(--space-3)] max-w-2xl text-[length:var(--font-size-sm)] leading-6 text-foreground/80 sm:text-[length:var(--font-size-base)] sm:leading-7 dark:text-muted-foreground">
                {t("description")}
              </p>
            </motion.div>

            <Accordion
              type="single"
              collapsible
              defaultValue="faq-0"
              dir={isRTL ? "rtl" : "ltr"}
              className="mt-[var(--space-8)] space-y-[var(--space-3)] sm:mt-[var(--space-10)]"
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  {...reveal(0.04 + index * 0.03)}
                >
                  <AccordionItem
                    value={`faq-${index}`}
                    className={cn(
                      "group overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-card",
                      "shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-300",
                      "motion-reduce:transition-none last:border-b",
                      "hover:border-primary-border",
                      "data-[state=open]:border-primary-border data-[state=open]:shadow-[var(--shadow-md)]",
                    )}
                  >
                    <AccordionTrigger
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-[var(--space-3)]",
                        "rounded-none px-[var(--space-4)] py-[var(--space-4)] text-start",
                        "font-semibold transition-colors duration-300 hover:bg-primary-soft/40 hover:no-underline",
                        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                        "motion-reduce:transition-none sm:px-[var(--space-5)] sm:py-[var(--space-5)]",
                        "dark:hover:bg-primary/10",
                        "data-[state=open]:bg-primary-soft/40 dark:data-[state=open]:bg-primary/10",
                        "[&>svg]:box-content [&>svg]:size-[var(--space-4)] [&>svg]:translate-y-0",
                        "[&>svg]:rounded-full [&>svg]:border [&>svg]:border-primary-border/70",
                        "[&>svg]:bg-primary-soft [&>svg]:p-[var(--space-2)] [&>svg]:text-primary-text",
                        "[&>svg]:transition-all [&>svg]:duration-300",
                        "[&[data-state=open]>svg]:border-primary [&[data-state=open]>svg]:bg-primary [&[data-state=open]>svg]:text-on-color",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "hidden h-[var(--space-10)] w-[var(--space-10)] shrink-0 items-center justify-center",
                          "rounded-[var(--radius-control)] border border-primary-border bg-primary-soft",
                          "text-[length:var(--font-size-xs)] font-bold text-primary-text",
                          "transition-colors duration-300 motion-reduce:transition-none sm:flex",
                          "group-data-[state=open]:border-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-on-color",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1 text-[length:var(--font-size-sm)] font-semibold leading-6 text-heading sm:text-[length:var(--font-size-base)] sm:leading-7">
                        {faq.question}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent
                      className={cn(
                        "px-[var(--space-4)] pb-[var(--space-5)] text-[length:var(--font-size-sm)] leading-7",
                        "text-muted-foreground",
                        "sm:pe-[var(--space-5)] sm:ps-[calc(var(--space-5)+var(--space-10)+var(--space-3))]",
                        "sm:text-[length:var(--font-size-base)]",
                      )}
                    >
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
