import { MoveRight, Star } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface Hero7Props {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
    className?: string;
  };

  className?: string;
}

const HeroSection = ({
  heading = "High-Quality Printing Solutions That Bring Your Ideas to Life",
  description = "With modern equipment and expert staff, we provide reliable, cost-effective printing solutions tailored to your business needs.",
  button = {
    text: "Start Your Print Order",
    url: "/",
  },

  className,
}: Hero7Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container text-center w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <h1 className="text-3xl font-semibold px-4 md:text-4xl lg:text-4xl xl:text-6xl md:max-w-xl mx-auto lg:max-w-3xl xl:max-w-5xl text-foreground dark:text-white">
            {heading}
          </h1>
          <p className=" text-muted-foreground lg:text-lg max-w-2xl leading-6 w-full mx-auto">
            {description}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="group text-[14px] lg:text-[16px] mt-10 hover:-translate-y-0.5 transition duration-200  text-center  mx-auto flex justify-center items-center max-w-[220px] "
        >
          <a href={button.url}>
            {button.text}{" "}
            <MoveRight
              className="
        w-4 h-4
        transition-transform duration-500 ease-out
        group-hover:translate-x-2
      "
            ></MoveRight>
          </a>
        </Button>
      </div>
    </section>
  );
};

export { HeroSection };
