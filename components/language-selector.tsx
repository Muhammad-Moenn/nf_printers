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

const languages = [
  { code: "en", label: "English", flag: "/us-flag.png" },
  { code: "ur", label: "Urdu", flag: "/pk-flag.png" },
];

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const current = languages.find((l) => l.code === currentLocale);

  const switchLocale = (nextLocale: "en" | "ur") => {
    if (nextLocale === currentLocale) return;

    router.push(pathname, { locale: nextLocale });
  };
  return (
    <Select
      value={currentLocale}
      onValueChange={(value) => switchLocale(value as "en" | "ur")}
    >
      <SelectTrigger className="w-[100px] gap-2 cursor-pointer border border-gray-400.">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className="rounded-full w-5 h-5 ">
              {current?.flag && (
                <Image
                  src={current?.flag}
                  alt="flag"
                  priority
                  width={20}
                  height={20}
                  className="w-full h-full"
                />
              )}
            </div>
            <span className="text-sm font-medium uppercase">
              {current?.code}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {languages.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <div className="flex items-center gap-3 cursor-pointer">
              {/* <span className="text-lg">{l.flag}</span> */}
              <div className="rounded-full w-5 h-5 ">
                {l.flag && (
                  <Image
                    src={l.flag}
                    alt="flag"
                    priority
                    width={20}
                    height={20}
                    className="w-full h-full"
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
//       <SelectTrigger className="w-[100px] gap-2 cursor-pointer border border-gray-400.">
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
