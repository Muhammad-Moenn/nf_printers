"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

import { useState } from "react";
import { Button } from "./button";
import { Employee } from "@/types/user";
import { MoveRight } from "lucide-react";
import { useLocale } from "next-intl";


export const HoverEffect = ({
  users,
  className,
}: {
  users: any[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
        className
      )}
    >
      {users.map((item, idx) => (
        <a
          href={item?.name}
          key={item?.id}
          className="relative group  block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-blue-400/[0.2] dark:bg-[#2176ff]/[0.3] block  rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card user={item} className=""/>
        </a>
      ))}
    </div>
  );
};

export const Card = ({
  user,
  className,
}: {
  user: Employee;
  className?: string;
}) => {
  const locale = useLocale();
  const isLocaleUr = locale === "ur";
  return (
    <div
      className={cn(
        "relative z-20 overflow-hidden rounded-2xl bg-white shadow-lg shadow-blue-50 dark:shadow-gray-950  dark:bg-gray-950 border border-neutral-300 dark:border-neutral-600 transition py-2  ",
        className
      )}
    >
      {/* Cover */}
      <div className="relative h-30 w-full">
       { user.image && (<Image
          src={user.image}
          alt={user.name}
          fill
          className="object-cover"
        />)} 
      </div>

      {/* Profile Image */}
      <div className={ ` ${user.image ? "-mt-12":"-mt-20" }  flex justify-center`}>
        <div className="h-24 w-24 xl:h-26 xl:w-26 overflow-hidden rounded-full border-4 border-white dark:border-neutral-900 bg-white ">
          <Image
            src={user.profileImage}
            alt={user.name}
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-4 text-center">
        <h3 className="text-xl lg:text-2xl font-semibold text-neutral-900 dark:text-white">
          {user.name}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
          {user.position}
        </p>

        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {user.description}
        </p>

        {/* Buttons */}
        <div className="mt-5 flex justify-center gap-3">
          <Button  className={`cursor-pointer flex rounded-full w-[140px] group ${isLocaleUr ? "flex-row-reverse" : "flex-row"} items-center justify-center  text-sm leading-none py-2 transition-transform duration-200  hover:-translate-y-0.5 `}>
           {isLocaleUr ? "پروفائل دیکھیں  ": " View Profile "}            <MoveRight
              className={`
        w-4 h-4
        transition-transform duration-500 ease-out
        ${isLocaleUr ? " -rotate-180 group-hover:-translate-x-2" : " group-hover:translate-x-2" }
      `}
            ></MoveRight>
          </Button>

        </div>
      </div>
    </div>
  );
};
