"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
// import { faqs } from "@/data/faqs";
import { useLocale, useTranslations } from "next-intl";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslations("home.faq_section");
  const faqs = t.raw("faqs");
  const locale = useLocale();
  const isLocaleUr = locale === "ur";
  return (
    <section className=" bg-gray-50 dark:bg-gray-950 ">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 pb-30 flex flex-col lg:flex-row justify-between gap-4 lg:gap-12 ">
        {/* Heading */}
        <div className=" mb-12  text-center lg:text-left">
          <span className="uppercase  tracking-widest  text-amber-500 sm:text-md font-medium">
            {isLocaleUr ? "اکثر پوچھے جانے والے سوالات" : "FAQ"}
          </span>
          <h2 className="text-3xl mt-4 md:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-[580px] mx-auto text-[18px]">
            {t("description")}
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-4 basis-[80%]">
          {faqs.map((faq: any, index: number) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-800 rounded-xl  bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={` cursor-pointer w-full flex justify-between items-center px-6 py-5 text-left ${
                    isLocaleUr ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <span className="font-medium  md:text-[17px] text-gray-900 dark:text-gray-100">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Animated content */}
                <div
                  className={`px-6 transition-all duration-500 ease-in-out overflow-hidden
                    ${
                      isOpen
                        ? "max-h-40 opacity-100 pb-5"
                        : "max-h-0 opacity-0 pb-0"
                    }
                  `}
                >
                  <p
                    className={`w-full text-gray-700 dark:text-gray-300 leading-relaxed ${
                      isLocaleUr ? "text-right" : "text-left"
                    }`}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
