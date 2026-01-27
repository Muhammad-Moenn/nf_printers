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
export function ServiceCard({
  title,
  description,
  icon,
  link,
  iconColor,
  iconBg,
}: ServiceCardProps) {
  const Icon = serviceIconMap[icon as ServiceIconKey];
  return (
    <div
      className="
        group rounded-2xl border border-gray-300 dark:border-white/10
        bg-white/10 shadow-md shadow-gray-100 dark:shadow-gray-800 dark:bg-gray-900
        p-6 transition-all duration-300 hover:border-gray-400
        dark:hover:border-white/20 hover:-translate-y-1 cursor-pointer hover:scale-[1.02]
        lg:min-h-[240px] 
      "
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
      <Button className="rounded-full cursor-pointer">
            Order Now <MoveRight className="ml-2 w-4 h-4" />
          </Button>
    </div>
  );
}
