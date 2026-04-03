"use client";
import { CheckCircle2, MoveRight, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";
import {Link as ScrollLink} from "react-scroll";
type Props = {
  className?: string;
};
const HeroSection = ({ className }: Props) => {
  const locale = useLocale();
  const t = useTranslations("home");
  const features = t.raw("hero_features");
  return (
    <section id="hero" className="py-32 relative overflow-hidden ">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/videos/heroSection-video.mp4" type="video/mp4" />
      </video>
      <div className=" relative z-10 bg-transparent text-center w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <motion.span
            initial={{  y: -10 }}
            animate={{
            
              y: [0, -3, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(36,90%,55%)]/20 px-4 py-1.5 -mb-1 text-sm font-medium text-[hsl(36,90%,55%)] w-fit mx-auto"
          >
            <Sparkles className="h-4 w-4" />

            {locale === "ur"
              ? "پریمیم پرنٹنگ سلوشنز"
              : "Premium Printing Solutions"}
          </motion.span>
          <h1 className="text-2xl font-semibold px-4 md:text-4xl lg:text-4xl xl:text-6xl md:max-w-xl mx-auto lg:max-w-3xl xl:max-w-5xl text-gray-900 dark:text-white">
            {t("hero_title")}
          </h1>
          <p className=" text-muted-foreground lg:text-lg max-w-2xl leading-6 w-full mx-auto">
            {t("description")}
          </p>
        </div>
       <div className="flex items-center gap-4 justify-center">
         <Button
          asChild
          size="lg"
          className={`group text-[14px] bg-[#F97316] hover:bg-[#EA580C] lg:text-[16px] mt-10 hover:-translate-y-0.5 transition duration-200  text-center   flex justify-center items-center max-w-[220px] ${
            locale === "ur" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Link href="/user-dashboard">
            {t("btn_text")}
            <MoveRight
              className={`
        w-4 h-4
        transition-transform duration-500 ease-out
        ${
          locale === "ur"
            ? "rotate-180  group-hover:-translate-x-2"
            : "rotate-0  group-hover:translate-x-2"
        }
      `}
            ></MoveRight>
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          className={`group text-[14px] border-2 bg-transparent  text-[#F59E0B] border-[#F59E0B] hover:bg-transparent lg:text-[16px] mt-10 hover:-translate-y-0.5 transition duration-200  text-center   flex justify-center items-center max-w-[140px]  ${
            locale === "ur" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <ScrollLink to="contact" smooth={true} offset={-70} duration={500} className="cursor-pointer">
            {locale === "ur"
              ? "ہم سے رابطہ کریں"
              : "Contact Us"}
           
          </ScrollLink>
        </Button>
       </div>
        {/* <motion.div
          className="mt-12 grid grid-cols-1 text-center md:grid-cols-2 gap-8 text-sm text-muted-foreground w-full md:max-w-[450px] mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {features.map((item: any) => (
            <span
              key={item}
              className={`flex items-center justify-center md:justify-start gap-2 ${
                locale === "ur"
                  ? "flex-row-reverse md:mr-10 lg:mr-12"
                  : "flex-row lg:ml-10 md:ml-8"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-[hsl(36,90%,55%)]" />
              {item}
            </span>
          ))}
        </motion.div> */}
      </div>
    </section>
  );
};

export { HeroSection };
