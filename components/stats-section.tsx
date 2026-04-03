"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Award, Users, Briefcase, ThumbsUp } from "lucide-react";
import { useLocale } from "next-intl";

const CountUp = ({ end, suffix = "" }: { end: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [inView, end]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

const stats = [
  {
    label_en: "Years Experience",
    label_ur: "سال کا تجربہ",
    value: 15,
    suffix: "+",
    icon: Award,
  },
  {
    label_en: "Happy Clients",
    label_ur: "خوش کلائنٹس",
    value: 500,
    suffix: "+",
    icon: Users,
  },
  {
    label_en: "Projects Done",
    label_ur: "مکمل منصوبے",
    value: 10,
    suffix: "K+",
    icon: Briefcase,
  },
  {
    label_en: "Client Satisfaction",
    label_ur: "کلائنٹ اطمینان",
    value: 99,
    suffix: "%",
    icon: ThumbsUp,
  },
];

const StatsSection = () => {
  const isLocaleUr = useLocale();
  return (
    <section className="py-10 py-0 -mt-10 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {stats.map((stat, i) => {
            const label = isLocaleUr === "ur" ? stat.label_ur : stat.label_en;

            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-xl bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
                dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e]
                w-full border border-gray-300 dark:border-gray-600/70
                shadow-md shadow-gray-100 dark:shadow-gray-900
                p-6 text-center transition-all duration-300
                hover:border-blue-400/70 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
              >
                {/* <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <stat.icon className="h-5 w-5" />
                </div> */}

                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {label}
                </p>

                <div className="mx-auto mt-3 h-1 w-8 rounded bg-blue-500"></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
