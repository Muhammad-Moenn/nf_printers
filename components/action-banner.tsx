"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { MoveRight } from "lucide-react";

import {
  Printer,
  NotebookPen,
  FileText,
  LogInIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "use-intl";
import { use } from "react";

export const iconMap = {
  printer: Printer,
  notebook: NotebookPen,
  file: FileText,
  login: LogInIcon,
};

export type IconName = keyof typeof iconMap;

// interface ActionBannerProps {
//   heading?: string;
//   description?: string;

//   // iconName?: IconName;

//   primaryText?: string;
//   primaryHref?: string;
//   showPrimary?: boolean;

//   secondaryText?: string;
//   secondaryHref?: string;
//   showSecondary?: boolean;
// }

export default function ActionBanner() {
  // const Icon = iconName ? iconMap[iconName] : null;
  const t=useTranslations("home.actionbanner")
  const locale=useLocale()
   const isLocale=locale==="ur";

    const heading=t("heading")
    const description=t("description")
    const primaryText=t("primaryText")
    const primaryHref=t("primaryHref")
    const secondaryText=t("secondaryText")
    const secondaryHref=t("secondaryHref")
    const showPrimary=t("showPrimary")
    const showSecondary=t("showSecondary")
  return (
    <section className="py-30 xl:py-32 bg-gradient-to-br from-[#182851] via-[#111b2d] to-[#010a31]">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Icon */}
        {/* {Icon && (
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-white/10">
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>
        )} */}

        <h2 className="text-4xl md:text-5xl font-semibold text-white/90 max-w-[800px] mx-auto">
          {heading}
        </h2>

        <p className="mt-5 text-[18px] text-gray-200 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="mt-10 flex justify-center gap-4">
          {showPrimary && (
            <Button asChild className={`min-w-[166px] h-[44px]  text-white rounded-full px-6 text-[16px] hover:-translate-y-0.5 transition duration-200 group font-medium ${isLocale ? "flex-row-reverse" : "flex-row"}`}>
              <Link href={primaryHref}>
                {primaryText}
                <MoveRight className={`w-4 h-4 ml-1 transition-transform duration-500  ${isLocale ? " -rotate-180 group-hover:-translate-x-2" : " group-hover:translate-x-2" }`} />
              </Link>
            </Button>
          )}

          {showSecondary && (
            <Button asChild className={`bg-white hover:bg-gray-100 dark:bg-gray-800 border dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full px-6 text-[16px] hover:-translate-y-0.5 transition duration-200 group min-w-[130px]  h-[42px] font-medium ${isLocale ? "flex-row-reverse" : "flex-row"}`}>
              <Link href={secondaryHref}>{secondaryText} 
              <LogInIcon className={`w-4 h-4 ml-1 transition-transform duration-500 ${isLocale ? " -rotate-180 group-hover:-translate-x-2" : " group-hover:translate-x-2" }`} />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}




