import { cn } from "@/lib/utils";
import { Mail, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

// import { Logo, LogoImage, LogoText } from "@/components/shadcnblocks/logo";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const t = useTranslations("home.footer");
  const items = t.raw("menuItems");
  const bottomLinks = t.raw("bottomLinks");
  const locale = useLocale();
  const isLocale = locale === "ur";
  return (
    <section
      className={cn(
        "pt-32 pb-8 bg-gray-200 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700",
        className
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2 lg:justify-start lg:items-start">
                {/* <Logo url="https://shadcnblocks.com">
                  <LogoImage
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-10 dark:invert"
                  />
                  <LogoText className="text-xl">{logo.title}</LogoText>
                </Logo> */}
                <Image
                  src="/nf-logo2.png"
                  alt="nf logo"
                  priority
                  width={150}
                  height={70}
                  className=" w-[180px] lg:w-[220px] h-auto dark:invert"
                />
              </div>
              <p
                className={`mt-4 text-gray-700 dark:text-gray-200 ${
                  isLocale ? "text-right" : "text-left"
                }`}
              >
                {t("tagline")}
              </p>
              <div className="mt-4 space-y-2">
              <a href="tel:+923045033707" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors sm:text-sm">
                <Phone className="h-4 w-4 text-amber-500" />
                +92 304 5033707
              </a>
              <a href="tel:+923009774895" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors sm:text-sm">
                <Phone className="h-4 w-4 text-amber-500" />
                +92 300 9774895
              </a>
              <a href="mailto:nfprinter3610@gmail.com" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors sm:text-sm">
                <Mail className="h-4 w-4 text-amber-500" />
                nfprinter3610@gmail.com
              </a>
            </div>
            </div>
            {items.map((section: any, sectionIdx: number) => (
              <div
                key={sectionIdx}
                className={`${isLocale ? "text-right" : "text-left"}`}
              >
                <h3 className="mb-4 font-semibold xl:text-lg text-gray-800 dark:text-white">
                  {section.title}
                </h3>
                <ul className="space-y-4 text-muted-foreground dark:text-gray-300">
                  {section.links.map((link: any, linkIdx: number) => (
                    <li key={linkIdx} className=" hover:underline ">
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-24 flex flex-col justify-between gap-4 border-t pt-8 text-sm font-medium text-muted-foreground dark:text-gray-300 md:flex-row md:items-center">
            {/* <p>{t("copyright")}</p> */}
            <p className="text-white/70">© {new Date().getFullYear()} PrimePrint Press. All rights reserved.</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link: any, linkIdx: number) => (
                <li key={linkIdx} className="underline text-white/80 hover:text-white transition-colors">
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer };
