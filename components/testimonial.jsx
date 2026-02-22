import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { getLocale, getTranslations } from "next-intl/server";

export default async function Testimonials() {
  
  const t=await getTranslations("home.testimonial_section");
  const locale =await  getLocale();
    const isLocaleUr = locale === "ur";
    const tes = t.raw("testimonials");
  return (
  <div id="testimonials" className="py-18 max-w-6xl mx-auto ">
     <h1 className="text-3xl md:text-4xl lg:text-5xl text-foreground dark:text-white font-semibold text-center px-4">{t("title")}</h1>
       <p className= "text-gray-500 dark:text-gray-300 text-lg text-center max-w-2xl leading-6 mx-auto my-7">{t("description")}</p>

    <AnimatedTestimonials testimonials={tes} autoplay = {true} />;
  </div>
  )
}
