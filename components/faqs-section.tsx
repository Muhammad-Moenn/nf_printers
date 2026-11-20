"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, CircleHelp, Printer } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { highlightLastWord } from "@/components/ui/highlight-last-word";
import { useHydratedReducedMotion } from "@/components/use-hydrated-reduced-motion";
import { cn } from "@/lib/utils";

type Faq = {
  question: string;
  answer: string;
};

export default function FAQSection() {
  const t = useTranslations("home.faq_section");
  const landing = useTranslations("home.landing");
  const locale = useLocale();
  const isRTL = locale === "ur";
  const reduceMotion = useHydratedReducedMotion();
  const faqs = (t.raw("faqs") as Faq[]) ?? [];

  const reveal = (delay = 0, distance = 18) => ({
    initial: reduceMotion ? false : { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      id="faqs"
      aria-labelledby="faq-heading"
      dir={isRTL ? "rtl" : "ltr"}
      className="relative py-[var(--space-8)] scroll-mt-24 text-foreground sm:py-[var(--space-10)] lg:py-[var(--space-12)] dark:text-on-color"
    >
      <div className="mx-auto w-full max-w-[var(--hero-max-width)] px-[var(--hero-padding-x)] sm:px-[var(--space-6)] lg:px-[var(--space-8)]">
        <motion.div {...reveal()} className="mx-auto max-w-5xl text-center">
          <span className="landing-eyebrow">
            <CircleHelp aria-hidden="true" className="size-4 shrink-0" />
            {landing("faq_label")}
          </span>

          <h2
            id="faq-heading"
            className="landing-section-title mt-[var(--space-4)]"
          >
            {highlightLastWord(t("title"), "landing-section-title-highlight")}
          </h2>

          <p className="landing-section-description mx-auto mt-[var(--space-3)]">
            {t("description")}
          </p>

          <div aria-hidden="true" className="mt-[var(--space-3)] flex items-center justify-center gap-4 text-primary sm:mt-[var(--space-4)]">
            <span className="h-0.5 w-16 rounded-full bg-primary-border sm:w-20" />
            <Printer className="size-6" strokeWidth={2.2} />
            <span className="h-0.5 w-16 rounded-full bg-primary-border sm:w-20" />
          </div>
        </motion.div>

        <div className="mt-[var(--space-5)] grid items-stretch gap-[var(--space-4)] sm:mt-[var(--space-6)] sm:gap-[var(--space-5)] lg:grid-cols-[minmax(17rem,0.78fr)_minmax(0,1.42fr)] lg:gap-12">
          <motion.aside
            {...reveal(0.05, 22)}
            aria-label={t("help_card_title")}
            className="group relative isolate flex min-h-[25rem] overflow-hidden rounded-[var(--radius-3xl)] border border-primary-border/60 bg-landing-navy shadow-[var(--shadow-lg)] sm:min-h-[29rem] lg:min-h-0 p-4 md:p-6"
          >
            <Image
              src="/faq-machine-image.png"
              alt={t("image_alt")}
              fill
              sizes="(max-width: 1023px) 92vw, 34vw"
              className="-z-20 object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-landing-navy via-landing-navy/90 via-45% to-landing-navy/0" />
            <div className="mt-auto w-full p-[var(--space-5)] text-on-color sm:p-[var(--space-6)] lg:p-[var(--space-7)]">
              <h3 className="max-w-sm font-hero text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl">
                {t("help_card_title")} {" "}
                <span className="text-landing-sky">{t("help_card_highlight")}</span>
              </h3>
              <span aria-hidden="true" className="mt-[var(--space-3)] block h-1 w-20 rounded-full bg-primary" />
              <p className="mt-[var(--space-3)] max-w-sm font-hero text-base leading-snug text-on-color/90 sm:text-lg">
                {t("help_card_description")}
              </p>
              <a
                href="#contact"
                className={cn(
                  "group/link mt-[var(--space-4)] inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary !px-[var(--space-5)] font-hero text-control font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-landing-navy motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  isRTL && "flex-row-reverse",
                )}
              >
                {landing("cta_contact")}
                <ArrowRight className={cn("size-4 transition-transform duration-300 group-hover/link:translate-x-1", isRTL && "rotate-180 group-hover/link:-translate-x-1")} aria-hidden="true" />
              </a>
            </div>
          </motion.aside>

          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            dir={isRTL ? "rtl" : "ltr"}
            className="space-y-[var(--space-2)] sm:space-y-[var(--space-3)]"
          >
            {faqs.map((faq, index) => (
              <motion.div key={faq.question} {...reveal(0.06 + index * 0.035, 14)}>
                <AccordionItem
                  value={`faq-${index}`}
                  className={cn(
                    "group overflow-hidden rounded-[var(--radius-2xl)] border border-primary-border/70 bg-card/95 shadow-[var(--shadow-sm)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary-border hover:shadow-[var(--shadow-md)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                    "data-[state=open]:border-primary-border data-[state=open]:shadow-[var(--shadow-md)]",
                  )}
                >
                  <AccordionTrigger
                    className={cn(
                      "flex min-h-16 w-full items-center gap-[var(--space-3)] rounded-none px-[var(--space-3)] py-[var(--space-3)] text-start hover:bg-primary-soft/35 hover:no-underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none sm:min-h-[4.75rem] sm:gap-[var(--space-4)] sm:px-[var(--space-4)] sm:py-[var(--space-3)]",
                      "dark:hover:bg-primary/10 data-[state=open]:bg-primary-soft/35 dark:data-[state=open]:bg-primary/10",
                      "[&>svg]:box-content [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:rounded-full [&>svg]:bg-primary-soft [&>svg]:p-2 [&>svg]:text-primary [&>svg]:transition-all [&>svg]:duration-300",
                      "[&[data-state=open]>svg]:bg-primary [&[data-state=open]>svg]:text-primary-foreground",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-primary-border bg-primary-soft font-hero text-control font-bold text-primary-text transition-colors duration-300 group-data-[state=open]:border-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground motion-reduce:transition-none"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 font-hero text-sm font-semibold leading-snug tracking-tight text-heading sm:text-base lg:text-lg">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-[var(--space-4)] pb-[var(--space-4)] font-hero text-sm leading-relaxed text-muted-foreground sm:ps-[calc(var(--space-4)+2.75rem+var(--space-4))] sm:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
