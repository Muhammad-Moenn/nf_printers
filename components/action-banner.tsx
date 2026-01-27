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

export const iconMap = {
  printer: Printer,
  notebook: NotebookPen,
  file: FileText,
  login: LogInIcon,
};

export type IconName = keyof typeof iconMap;

interface ActionBannerProps {
  heading?: string;
  description?: string;

  iconName?: IconName;

  primaryText?: string;
  primaryHref?: string;
  showPrimary?: boolean;

  secondaryText?: string;
  secondaryHref?: string;
  showSecondary?: boolean;
}

export default function ActionBanner({
  heading="Ready to Take Your Printing Business to the Next Level?",
  description="Join thousands of satisfied clients who trust us for high-quality printing solutions.",
  iconName,
  primaryText = "Get Started",
  primaryHref = "/signup",
  showPrimary = true,
  secondaryText = "Login",
  secondaryHref = "/login",
  showSecondary = true,
}: ActionBannerProps) {
  const Icon = iconName ? iconMap[iconName] : null;

  return (
    <section className="py-30 xl:py-32 bg-gradient-to-br from-[#182851] via-[#111b2d] to-[#010a31]">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Icon */}
        {Icon && (
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-white/10">
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>
        )}

        <h2 className="text-4xl md:text-5xl font-semibold text-white/90 max-w-[800px] mx-auto">
          {heading}
        </h2>

        <p className="mt-5 text-[18px] text-gray-200 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="mt-10 flex justify-center gap-4">
          {showPrimary && (
            <Button asChild className="min-w-[166px] h-[44px]  text-white rounded-full px-6 text-[16px] hover:-translate-y-0.5 transition duration-200 group font-medium">
              <Link href={primaryHref}>
                {primaryText}
                <MoveRight className="w-4 h-4 ml-1 transition-transform duration-500 group-hover:translate-x-2" />
              </Link>
            </Button>
          )}

          {showSecondary && (
            <Button asChild className="bg-white hover:bg-gray-100 dark:bg-gray-800 border dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full px-6 text-[16px] hover:-translate-y-0.5 transition duration-200 group min-w-[130px]  h-[42px] font-medium">
              <Link href={secondaryHref}>{secondaryText} 
              <LogInIcon className="w-4 h-4 ml-1 transition-transform duration-500 group-hover:translate-x-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
































// "use client";

// import Link from "next/link";
// import { Button } from "./ui/button";
// import { MoveRight, LogInIcon, LucideIcon } from "lucide-react";

// interface ActionBannerProps {
//   heading?: string;
//   description?: string;

//   /** Icon */
//   icon?: LucideIcon;

//   /** Primary Button */
//   primaryText?: string;
//   primaryHref?: string;
//   showPrimary?: boolean;

//   /** Secondary Button */
//   secondaryText?: string;
//   secondaryHref?: string;
//   secondaryIcon?: LucideIcon;
//   showSecondary?: boolean;
// }

// export default function ActionBanner({
//   heading = "Ready to Take Your Printing Business to the Next Level?",
//   description = "Join thousands of satisfied clients who trust us for high-quality printing solutions.",

//   icon: Icon,

//   primaryText = "Get Started",
//   primaryHref = "/start",
//   showPrimary = true,

//   secondaryText = "Login",
//   secondaryHref = "/login",
//   secondaryIcon: SecondaryIcon = LogInIcon,
//   showSecondary = true,
// }: ActionBannerProps) {
//   return (
//     <section className="py-20 lg:py-30 xl:py-40 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617]">
//       <div className="max-w-7xl mx-auto px-6 text-center">
//         {/* Optional Icon */}
//         {Icon && (
//           <div className="flex justify-center mb-6">
//             <div className="p-4 rounded-full bg-white/10">
//               <Icon className="w-10 h-10 text-white" />
//             </div>
//           </div>
//         )}

//         {/* Heading */}
//         <h2 className="text-4xl md:text-5xl font-bold text-white max-w-[870px] mx-auto">
//           {heading}
//         </h2>

//         {/* Description */}
//         <p className="mt-5 text-lg text-gray-200 max-w-2xl mx-auto">
//           {description}
//         </p>

//         {/* Buttons */}
//         {(showPrimary || showSecondary) && (
//           <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
//             {/* Primary Button */}
//             {showPrimary && (
//               <Button
//                 asChild
//                 className="min-w-[170px] h-10  text-white rounded-full px-6 text-[16px] hover:-translate-y-0.5 transition duration-200 group font-medium"
//               >
//                 <Link href={primaryHref}>
//                   {primaryText}
//                   <MoveRight className="w-4 h-4 ml-1 transition-transform duration-500 group-hover:translate-x-2" />
//                 </Link>
//               </Button>
//             )}

//             {/* Secondary Button */}
//             {showSecondary && (
//               <Button
//                 asChild
//                 className="bg-white hover:bg-gray-100 dark:bg-gray-800 border dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full px-6 text-[16px] hover:-translate-y-0.5 transition duration-200 group min-w-[150px]  h-10 font-medium"
//               >
//                 <Link href={secondaryHref}>
//                   {secondaryText}
//                   {SecondaryIcon && (
//                     <SecondaryIcon className="w-4 h-4 ml-1 transition-transform duration-500 group-hover:translate-x-2" />
//                   )}
//                 </Link>
//               </Button>
//             )}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }
