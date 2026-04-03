"use client";
import { Link as ScrollLink } from "react-scroll";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  MoveRight,
  Sparkles,
  Printer,
  NotebookPen,
  FileText,
  LogInIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "use-intl";
import { useUser } from "@clerk/nextjs";
export const iconMap = {
  printer: Printer,
  notebook: NotebookPen,
  file: FileText,
  login: LogInIcon,
};

export type IconName = keyof typeof iconMap;

export default function ActionBanner() {
  const locale = useLocale();
  const isRTL = locale === "ur";

  const t = useTranslations("home.actionbanner");

  const heading = t("heading");
  const description = t("description");
  const primaryText = t("primaryText");
  const primaryHref = t("primaryHref");
  const secondaryText = t("secondaryText");
  const secondaryHref = t("secondaryHref");

  const showPrimary = t("showPrimary") === "true";
  const showSecondary = t("showSecondary") === "true";
  const {user} = useUser();
  return (
    <section 
    style={{
  background: "linear-gradient(135deg, #0d1b2a 0%, #0f2540 50%, #1a2f4a 100%)"
}} className="py-30 xl:py-32 bg-gradient-to-br from-[#0d1b2a] via-[#0f2540] to-[#1a2f4a]">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 sm:h-16 sm:w-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-6 w-6 text-amber-500 sm:h-7 sm:w-7" />
          </motion.div>
        </motion.div>

        {/* Heading */}
        <h2 className="text-4xl md:text-[60px] font-semibold text-white/90 w-full max-w-[800px] mx-auto">
          {heading}
        </h2>

        {/* Description */}
        <p className="mt-5 text-[18px] text-gray-200 max-w-2xl mx-auto">
          {description}
        </p>

        {/* Buttons */}
        <div className="mt-10 flex justify-center gap-4">
          {showPrimary && (
            <Button
              asChild
              className="min-w-[166px] h-[44px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full px-6 text-[16px] hover:-translate-y-0.5 transition duration-200 group font-medium"
            >
              <Link
                href={primaryHref}
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {primaryText}

                <MoveRight
                  className={`w-4 h-4 transition-transform duration-500 ${
                    isRTL
                      ? "-rotate-180 group-hover:-translate-x-2"
                      : "group-hover:translate-x-2"
                  }`}
                />
              </Link>
            </Button>
          )}

          { !user ? (
            <Button
              asChild
              className="bg-white/90 hover:bg-gray-100 dark:bg-white/90 border border-blue-700 dark:hover:bg-white text-gray-900 dark:text-gray-800 rounded-full px-6 text-[16px] hover:-translate-y-0.5 transition duration-200 group min-w-[130px] h-[42px] font-medium border-2 border-[#F97316] text-[#F97316] hover:bg-transparent  flex justify-center items-center max-w-[140px]  ${"
            >
              <Link
                href={secondaryHref}
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {secondaryText}

                <LogInIcon
                  className={`w-4 h-4 transition-transform duration-500 ${
                    isRTL
                      ? "-rotate-180 group-hover:-translate-x-2"
                      : "group-hover:translate-x-2"
                  }`}
                />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              // size="lg"
              className={`group text-[14px] border-2 bg-transparent  text-[#F59E0B] border-[#F59E0B] hover:bg-transparent lg:text-[16px]  hover:-translate-y-0.5 transition duration-200 font-medium text-center   flex justify-center items-center max-w-[150px] rounded-4xl py-5 ${
                locale === "ur" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <ScrollLink
                to="contact"
                smooth={true}
                offset={-70}
                duration={500}
                className="cursor-pointer"
              >
                {locale === "ur" ? "ہم سے رابطہ کریں" : "Contact Us"}
              </ScrollLink>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
