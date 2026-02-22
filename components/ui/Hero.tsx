import { MoveRight, Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server"; 
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Link from "next/link";


type Props = {
  className?: string;
};
const HeroSection =async ({
  
  className,
}: Props) => {
 const locale = await getLocale(); 
  const t = await getTranslations("home");
  return (
    <section className={cn("py-32", className)}>
      <div className="container text-center w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <h1 className="text-2xl font-semibold px-4 md:text-4xl lg:text-4xl xl:text-6xl md:max-w-xl mx-auto lg:max-w-3xl xl:max-w-5xl text-foreground dark:text-white">
            {t('hero_title')}
          </h1>
          <p className=" text-muted-foreground lg:text-lg max-w-2xl leading-6 w-full mx-auto">
           {t('description')}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className={`group text-[14px] lg:text-[16px] mt-10 hover:-translate-y-0.5 transition duration-200  text-center  mx-auto flex justify-center items-center max-w-[220px] ${locale === "ur" ? "flex-row-reverse" : "flex-row"}`}
        >
          <Link href="/">
            {t('btn_text')}
            <MoveRight
              className={`
        w-4 h-4
        transition-transform duration-500 ease-out
        ${locale === "ur" ? "rotate-180  group-hover:-translate-x-2" : "rotate-0  group-hover:translate-x-2"}
      `}
            ></MoveRight>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export { HeroSection };
