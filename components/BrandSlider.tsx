"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Slider from "react-slick";
import Image from "next/image";

const brands = [
  { name: "Multan Public", logo: "/Multan_public_school.jpeg" },
  // { name: "British Grammar ", logo: "/British_grammar_school.jpeg" },
  // { name: "Nishat ", logo: "/Nishat_school .jpeg" },
  { name: "American ", logo: "/American_school .jpg" },
  { name: "Defense ", logo: "/Defense_school.jpeg" },
  { name: "Eden ", logo: "/eden-school.jpeg" },
  { name:  "Laureate", logo: "/Larat_school .jpeg" },
  { name: " Dritish International ", logo: "/British_international_school .jpeg" },
  { name: "Punjab College ", logo: "/Punjab_college .png" },
    { name: "Ramada Hotel", logo: "/Ramada_hotel.png" },

];

export default function BrandSlider() {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,

    slidesToShow: 5,
    slidesToScroll: 1,

    autoplay: true,
    autoplaySpeed: 0, // 🔥 continuous
    speed: 2900, // 🔥 smooth flow
    cssEase: "linear", // 🔥 no snapping
    pauseOnHover: true,
    pauseOnFocus: true,

    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 2 },
      },
    ],
  };

  return (
    <section id="partners" className="relative py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 md:my-14 lg:my-17">
      <h2 className="mb-4 lg:mb-6 text-center text-4xl md:text-5xl font-semibold text-foreground dark:text-white">
        Brands We Work With
      </h2>

      <p className="text-center text-lg text-gray-600 dark:text-gray-200 max-w-[700px] mx-auto">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Possimus ipsa.
      </p>

      <Slider {...settings} className="mt-16 flex items-center justify-center">
        {brands.map((brand, index) => (
          <Tooltip  key={index}>
            <div className=" flex justify-center items-center text-center w-full" >
            <TooltipTrigger className="flex items-center justify-center h-[100px]">
              <Image
                src={brand.logo}
                alt={brand.name}
                width={200}
                height={100}
                className="
                flex items-center justify-center
                  w-fit  object-cover h-[80px] md:h-[100px]
                  transition duration-300 cursor-pointer
                "
              />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white font-medium dark:text-gray-700 rounded-md px-3 py-1 text-sm">
              {brand.name}
            </TooltipContent>
          </div>
          </Tooltip>
        ))}
      </Slider>
    </section>
  );
}
