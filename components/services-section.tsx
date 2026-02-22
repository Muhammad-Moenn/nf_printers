"use client";

import Slider from "react-slick";
import { Button } from "./ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState } from "react";
import { getLocale } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import { ServiceCard } from "./service-card";

// Custom Next Arrow
function NextArrow({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="absolute top-1/2 -right-12 transform -translate-y-1/2 z-20 bg-blue-100 dark:bg-gray-800 text-gray-500 dark:text-white p-2 rounded-full shadow-lg hover:bg-gray-200 transition cursor-pointer"
      onClick={onClick}
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  );
}

// Custom Prev Arrow
function PrevArrow({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="absolute top-1/2 -left-12 transform -translate-y-1/2 z-20 bg-blue-100 dark:bg-gray-800 text-gray-500 dark:text-white p-2 rounded-full shadow-lg hover:bg-gray-200 transition cursor-pointer"
      onClick={onClick}
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
  );
}

export function ServicesSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 0, // 🔥 continuous
    speed: 5000, // 🔥 smooth flow
    cssEase: "linear", // 🔥 no snapping
    pauseOnHover: true,
    pauseOnFocus: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,

    beforeChange: (_current: number, next: number) => setActiveSlide(next),
    customPaging: function (i: number) {
      return (
        <div
          id="services"
          className={`w-2 h-2 rounded-full transition ${
            i === activeSlide
              ? "bg-blue-500"
              : "bg-gray-300 dark:bg-gray-100/[0.4]"
          }`}
        />
      );
    },
    appendDots: (dots: React.ReactNode) => (
      <div className="mt-6 flex justify-center ">{dots}</div>
    ),
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };
  const locale =  useLocale();
  const t= useTranslations("home.servic_section");
  const isLocaleUr = locale === "ur";
  const services = t.raw("services");
  return (
    <section id="services" className=" bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-950 dark:text-white">
            {t("heading")}
          </h2>
          <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl text-lg mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Slider */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4">
          {services.slice(0,6).map((service:any,i:number) => (
            <Link href={`services/${service.id}`} key={i} className="px-3 mt-2">
              <ServiceCard {...service} />
            </Link>
          ))}
          </div>
        {/* <Slider {...settings} className="py-5  ">
          {services.map((service) => (
            <div key={service.id} className="px-3 mt-2">
              <ServiceCard {...service} />
            </div>
          ))}
        </Slider> */}

        {/* CTA */}
        <Button
               asChild
               className="
           flex items-center justify-center
           cursor-pointer max-w-[130px] h-10 rounded-full mx-auto mt-10 
             group z-10 hover:-translate-y-0.5 transition duration-200  text-center 
         "
             >
               <Link
                 href="/"
                 className={`flex items-center gap-1 text-md leading-none py-4 ${isLocaleUr ? "flex-row-reverse" : "flex-row"}`}
               >
                 {isLocaleUr ? "سب دیکھیں" : "View All"}
       
                 <MoveRight
                   className={` ml-1
               w-4 h-4
               transition-transform duration-500 ease-out
               
               ${isLocaleUr ? " -rotate-180 group-hover:-translate-x-2" : " group-hover:translate-x-2" }`}
                 ></MoveRight>
               </Link>
             </Button>
      </div>
    </section>
  );
}
