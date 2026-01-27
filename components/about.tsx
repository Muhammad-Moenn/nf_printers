import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MoveRight } from "lucide-react";

function About() {
  return (
    <section id="about" className=" bg-gray-50 dark:bg-black ">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT — CONTENT */}
          <div>
            <span className="inline-block mb-4 text-sm  tracking-wide text-blue-600 dark:text-blue-500 font-medium text-[18px]">
              About Us
            </span>

            <h2 className="text-3xl md:text-4xl xl:text-[46px] font-semibold text-gray-800 dark:text-white/95 max-w-[600px]">
              Reliable & Professional Printing Solutions
            </h2>

            <p className="mt-6  xl:text-lg text-gray-600 dark:text-gray-300">
              We are a modern printing press delivering high-quality prints for
              businesses, institutions, and individuals. From digital printing
              to large-format solutions, we focus on precision, speed, and
              excellence.
            </p>

            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Our mission is to combine advanced printing technology with expert
              craftsmanship to help brands stand out and communicate
              effectively.
            </p>

            {/* FEATURES */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-gray-700 dark:text-gray-200">
                  High-quality materials
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-gray-700 dark:text-gray-200">
                  Fast turnaround time
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-700 dark:text-gray-200">
                  Affordable pricing
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-700 dark:text-gray-200">
                  Professional support
                </span>
              </div>
            </div>

            {/* BUTTON */}
            <Button
              asChild
              className=" group mt-10 px-7 w-[150px] py-3 h-[42px] rounded-full  text-white transition"
            >
              <Link href="" className="">
                Learn More{" "}
                <MoveRight
                  className="
                        w-4 h-4
                        transition-transform duration-500 ease-out
                        group-hover:translate-x-2
                      "
                ></MoveRight>
              </Link>
            </Button>
          </div>

          {/* RIGHT — IMAGE */}
          <div className="relative">
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
