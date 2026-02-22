import { cn } from "@/lib/utils";
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
              <div className="flex items-center gap-2 lg:justify-start">
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
                  src={t("logo.src")}
                  alt={t("logo.alt")}
                  priority
                  width={100}
                  height={80}
                />
              </div>
              <p
                className={`mt-4 text-gray-700 dark:text-gray-200 ${
                  isLocale ? "text-right" : "text-left"
                }`}
              >
                {t("tagline")}
              </p>
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
            <p>{t("copyright")}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link: any, linkIdx: number) => (
                <li key={linkIdx} className="underline ">
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
