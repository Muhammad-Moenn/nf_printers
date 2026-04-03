"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useLocale } from "next-intl";

const testimonials = [
  {
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
    name: { en: "Kazi Sajjad", ur: "قاضی سجاد" },
    role: { en: "Print Production Manager", ur: "پرنٹ پروڈکشن مینیجر" },
    company: { en: "Honey Book Center", ur: "ہنی بک سینٹر" },
    text: {
      en: "NF Printers delivers excellent book printing with consistent quality and precision.",
      ur: "NF پرنٹرز مسلسل اعلیٰ معیار اور درستگی کے ساتھ کتابوں کی بہترین پرنٹنگ فراہم کرتے ہیں۔",
    },
    rating: 5,
    initials: "KS",
  },
  {
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

const Testimonials2Section = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const locale = useLocale();
  const isRTL = locale === "ur";
  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prev = () =>
    setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () =>
    setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));
  const t = testimonials[current];

  return (
    <section
      id="testimonials"
      className="section-padding relative overflow-hidden py-16 pb-24"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220 15% 92%)]/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-amber-500 sm:text-sm">
            {isRTL ? "تعریفات" : "Testimonials"}
          </span>

          <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            {isRTL ? "ہمارے کلائنٹس کا اعتماد" : "Trusted by Our Clients"}
          </h2>
        </motion.div>

        <div className="relative mx-auto mt-12 max-w-4xl sm:mt-16">
          <div className="absolute -top-6 left-6 text-blue-500/20 sm:-top-8 sm:left-10">
            <Quote className="h-16 w-16 sm:h-24 sm:w-24" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              key={current}
              className={`relative cursor-pointer overflow-hidden rounded-3xl border flex flex-col   bg-card p-8 shadow-xl sm:p-12 md:p-16 ${
                isRTL ? "text-right items-end" : "text-left items-start"
              }`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500 sm:h-6 sm:w-6" />
                  </motion.div>
                ))}
              </div>
              <p className="text-lg leading-relaxed text-foreground font-medium sm:text-xl md:text-2xl">
                "{t.text[locale as "en" | "ur"]}"
              </p>
              <div
                className={`mt-8 flex items-center gap-4 sm:mt-10 ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex  h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg sm:h-14 sm:w-14 `}
                >
                  <span className="font-heading text-sm font-bold text-primary-foreground sm:text-base">
                    {t.initials}
                  </span>
                </motion.div>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground sm:text-lg">
                    {t.name[locale as "en" | "ur"]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.role[locale as "en" | "ur"]} at{" "}
                    <span className="text-blue-400/80 font-medium">
                      {t.company[locale as "en" | "ur"]}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary/60 cursor-pointer sm:h-12 sm:w-12"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer duration-300 ${
                    i === current
                      ? "w-8 bg-primary/80"
                      : "w-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary/60 cursor-pointer sm:h-12 sm:w-12"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials2Section;

{
  /* <div className="relative mx-auto mt-12 max-w-4xl sm:mt-16">
          <div className="absolute -top-6 left-6 text-amber-500/20 sm:-top-8 sm:left-10">
            <Quote className="h-16 w-16 sm:h-24 sm:w-24" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-xl sm:p-12 md:p-16"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500 sm:h-6 sm:w-6" />
                  </motion.div>
                ))}
              </div>
              <p className="text-lg leading-relaxed text-foreground font-medium sm:text-xl md:text-2xl">
                "{t.text}"
              </p>
              <div className="mt-8 flex items-center gap-4 sm:mt-10">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-500/70 dark:from-amber-500 dark:to-amber-500/70 shadow-lg sm:h-14 sm:w-14"
                >
                  <span className="font-heading text-sm font-bold text-primary-foreground sm:text-base">{t.initials}</span>
                </motion.div>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground sm:text-lg">{t.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.role} at <span className="text-amber-500 font-medium">{t.company}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:border-amber-500 hover:text-amber-500 sm:h-12 sm:w-12 cursor-pointer "
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                    i === current ? "w-8 bg-amber-500" : "w-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:border-amber-500 hover:text-amber-500 sm:h-12 sm:w-12 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div> */
}
