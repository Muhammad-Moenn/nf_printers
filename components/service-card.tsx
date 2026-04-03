"use client";
import { ServiceProps } from "@/data/services";


import {
  BookOpen,
  FileText,
  Layers,
  Printer,
  NotebookPen,
  Archive,
  Image,
  Receipt,
  Sticker,
  CalendarDays,
  Scissors,
  ShieldCheck,
  MoveRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { useLocale } from "next-intl";

const serviceIconMap = {
  bookOpen: BookOpen,
  fileText: FileText,
  layers: Layers,
  printer: Printer,
  notebookPen: NotebookPen,
  archive: Archive,
  image: Image,
  receipt: Receipt,
  sticker: Sticker,
  calendarDays: CalendarDays,
  scissors: Scissors,
  shieldCheck: ShieldCheck,
};
type ServiceIconKey = keyof typeof serviceIconMap;
export type ServiceCardProps = Omit<ServiceProps, "id">;
export  function ServiceCard({
  title,
  description,
  icon,
  link,
  iconColor,
  iconBg,
}: ServiceCardProps) {
  const Icon = serviceIconMap[icon as ServiceIconKey] ?? NotebookPen;
 const locale = useLocale();
const isLocaleUr = locale === "ur";
  return (
    <div
      className={`
        group rounded-2xl p-6 bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e]  w-full     border-1 border-gray-300/100 dark:border-gray-600/70 shadow-md shadow-gray-100 dark:shadow-gray-900 dark:bg-gray-900
        p-6 transition-all duration-300 hover:border-blue-400
        hover:dark:border-blue-600/70 hover:-translate-y-1 cursor-pointer hover:scale-[1.02]
        lg:min-h-[240px] flex flex-col  ${isLocaleUr ? "items-end text-right" : "items-start text-left"}
      `}
    >
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${iconBg}`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      {/* Title */}
      <h3 className="text-lg xl:text-xl font-semibold text-gray-800  dark:text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{description}</p>

      {/* Link */}
       <Button
              className={`
                bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600
          flex items-center justify-center
          cursor-pointer  max-w-[140px] w-full h-10 rounded-full   
            group z-10 hover:-translate-y-0.5 transition duration-200  text-center mt-6
         ${isLocaleUr ? "flex-row-reverse " : "flex-row "}`}
            >
              
                {isLocaleUr ? "سب دیکھیں" : "Order Now"}
      
                <MoveRight
                  className={` ml-1
              w-4 h-4
              transition-transform duration-500 ease-out
              
              ${isLocaleUr ? " -rotate-180 group-hover:-translate-x-2" : " group-hover:translate-x-2" }`}
                ></MoveRight>
            </Button>
    </div>
  );
}
