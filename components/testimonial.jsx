import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { getLocale, getTranslations } from "next-intl/server";

export default async function Testimonials() {
  const t = await getTranslations("home.testimonial_section");
  const locale = await getLocale();
  const isLocaleUr = locale === "ur";
  const tes = t.raw("testimonials");
  return (
    <div
      id="testimonials"
      className="py-18  mx-auto flex justify-center items-center flex-col  bg-gray-50 dark:bg-[#181818]"
    >
      <span className="uppercase text-center mx-auto w-full tracking-widest text-amber-500 sm:text-md font-medium">
         {isLocaleUr ? "تعریفی کلمات" : "Testimonials"}
      </span>
      <h1 className="text-3xl md:text-4xl lg:text-5xl mt-2 text-foreground dark:text-white font-semibold text-center px-4">
        {t("title")}
      </h1>
       
      <p className="text-gray-500 dark:text-gray-300 text-lg text-center max-w-2xl leading-6 mx-auto my-7">
        {t("description")}
      </p>
      <AnimatedTestimonials testimonials={tes} autoplay={true} />;
    </div>
  );
}
