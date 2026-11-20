"use client";
// import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English", flag: "/us-flag.png" },
  { code: "ur", label: "Urdu", flag: "/pk-flag.png" },
];

export default function LanguageSelector() {
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const current = languages.find((l) => l.code === currentLocale);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const switchLocale = (nextLocale: "en" | "ur") => {
    if (nextLocale === currentLocale) return;

    router.push(pathname, { locale: nextLocale });
  };

  if (!hasMounted) {
    return (
      <div
        aria-hidden="true"
        className="h-9 w-24 shrink-0 rounded-full border border-primary-border bg-primary-soft/80 backdrop-blur-md"
      />
    );
  }

  return (
    <Select
      value={currentLocale}
      onValueChange={(value) => switchLocale(value as "en" | "ur")}
    >
      <SelectTrigger
        aria-label="Select language"
        className={cn(
          "h-9 w-25 cursor-pointer gap-2 rounded-full px-3",
          "border border-primary-border bg-primary-soft/80 text-heading backdrop-blur-md",
          "shadow-sm shadow-primary/20",
          "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-soft",
          "hover:shadow-md hover:shadow-primary/25",
          "focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0",
          "data-[state=open]:border-primary data-[state=open]:bg-primary-soft",
          "[&>svg]:text-primary-text/70!",
          "dark:border-on-color/15 dark:bg-on-color/[0.08] dark:text-neutral-100 dark:hover:bg-on-color/[0.12] dark:[&>svg]:text-primary-soft-foreground!",
        )}
      >
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className="h-4 w-6 overflow-hidden rounded-[3px] ring-1 ring-black/10 dark:ring-white/15">
              {current?.flag && (
                <Image
                  src={current?.flag}
                  alt="flag"
                  priority
                  width={24}
                  height={16}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <span className="text-sm font-semibold uppercase text-primary-text">
              {current?.code}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="rounded-md border-border dark:border-on-color/10">
        {languages.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-4 w-6 overflow-hidden rounded-sm">
                {l.flag && (
                  <Image
                    src={l.flag}
                    alt="flag"
                    priority
                    width={24}
                    height={16}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <span className="text-sm">{l.label}</span>
              <span className="ml-auto text-xs text-muted-foreground uppercase">
                {l.code}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
     {/* <GoogleTranslate/> */}
    </Select>
  );
}
























// "use client";
// // import { usePathname, useRouter } from "next/navigation";
// import { useLocale } from "next-intl";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import Image from "next/image";
// import { usePathname, useRouter } from "@/i18n/navigation";

// const languages = [
//   { code: "en", label: "English", flag: "/us-flag.png" },
//   { code: "ur", label: "Urdu", flag: "/pk-flag.png" },
// ];
// export default function LanguageSelector() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const currentLocale = useLocale();

//   const current = languages.find((l) => l.code === currentLocale);
//   const switchLocale = (nextLocale: "en" | "ur") => {
//     if (nextLocale === currentLocale) return;

//     router.push(pathname, { locale: nextLocale });
//   };
//   return (
//     <Select
//       value={currentLocale}
//       onValueChange={(value) => switchLocale(value as "en" | "ur")}
//     >
//       <SelectTrigger className="w-[100px] gap-2 cursor-pointer border border-border-strong.">
//         <SelectValue>
//           <div className="flex items-center gap-2">
//             <div className="rounded-full w-5 h-5 ">
//               {current?.flag && (
//                 <Image
//                   src={current?.flag}
//                   alt="flag"
//                   priority
//                   width={20}
//                   height={20}
//                   className="w-full h-full"
//                 />
//               )}
//             </div>
//             <span className="text-sm font-medium uppercase">
//               {current?.code}
//             </span>
//           </div>
//         </SelectValue>
//       </SelectTrigger>

//       <SelectContent>
//         {languages.map((l) => (
//           <SelectItem key={l.code} value={l.code}>
//             <div className="flex items-center gap-3 cursor-pointer">
//               {/* <span className="text-lg">{l.flag}</span> */}
//               <div className="rounded-full w-5 h-5 ">
//                 {l.flag && (
//                   <Image
//                     src={l.flag}
//                     alt="flag"
//                     priority
//                     width={20}
//                     height={20}
//                     className="w-full h-full"
//                   />
//                 )}
//               </div>
//               <span className="text-sm">{l.label}</span>
//               <span className="ml-auto text-xs text-muted-foreground uppercase">
//                 {l.code}
//               </span>
//             </div>
//           </SelectItem>
//         ))}
//       </SelectContent>
//       <div id="google_translate_element" />
//     </Select>
//   );
// }
