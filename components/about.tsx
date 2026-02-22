import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MoveRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

async function About() {
  const locale=await getLocale();
  const t = await getTranslations("home.about_us");
const description = t.raw("description") as string[];
const features = t.raw("features") as string[];
  return (
    <section id="about" className=" bg-gray-50 dark:bg-black ">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className={`flex flex-col-reverse  gap-12 items-center ${locale === "ur" ? "text-right  lg:flex-row-reverse " : " lg:flex-row text-left"}`}>
          {/* LEFT — CONTENT */}
          <div className={`w-full lg:w-[50%] ${locale === "ur" ? "text-right " : "text-left"}`}>
            <span className="inline-block mb-4 text-sm  tracking-wide text-blue-600 dark:text-blue-500 font-medium text-[18px]">
              {t("title")}
            </span>

            <h2 className={`text-3xl  md:text-4xl xl:text-[46px] font-semibold text-gray-800 dark:text-white/95 max-w-[600px] ${locale === "ur" ? "ml-auto " : "mr-auto "}`}>
             {t("heading")}
            </h2>

            <p className="mt-6  xl:text-lg text-gray-600 dark:text-gray-300">
              {description[0]}
            </p>

            <p className="mt-4 text-gray-600 dark:text-gray-300">
               {description[1]}
            </p>

            {/* FEATURES */}
            <div className={`mt-8 grid sm:grid-cols-2 gap-4 `}>
              {features.map((feature, index) => (
                <div className={`flex items-center gap-3 ${locale === "ur" ? "text-left flex-row-reverse" : " text-right flex-row"}`} key={index}>
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-gray-700 dark:text-gray-200">
                  {feature}
                </span>
              </div>
              ))}

              
            </div>

            {/* BUTTON */}
            <Button
              asChild
              className=" group mt-10 px-7 w-[150px] py-3 h-[42px] rounded-full  text-white transition"
            >
              <Link href="/" className={`flex gap-4 ${locale === "ur" ? "flex-row-reverse" : "flex-row"}`} >
                {t("button_text")}{" "}
                <MoveRight
                  className={` ${locale === "ur" ? " -rotate-180 group-hover:-translate-x-2 " : "group-hover:translate-x-2 "} 
                        w-4 h-4
                        transition-transform duration-500 ease-out
                        
                       `}
                ></MoveRight>
              </Link>
            </Button>
          </div>

          {/* RIGHT — IMAGE */}
          <div className={` w-full lg:w-[50%] relative ${locale === "ur" ? " " : " "}`}>
            <Image
              priority
              width={300}
              height={240}
              src="/about_img.png"
              alt="Printing Press"
              className="w-full h-auto relative rounded-3xl "
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
