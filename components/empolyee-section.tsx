import { Employee } from "@/types/user";
import { HoverEffect } from "./ui/card-hover-effect";
import { Button } from "./ui/button";
import { MoveRight } from "lucide-react";

const employees: Employee[] = [
  {
    id: 1,
    name: "Ahmed Raza",
    position: "Production Manager",
    description:
      "Supervises daily printing operations, schedules jobs, and ensures quality output.",
    // image: "/printingImage.jpg",
    profileImage: "/profileImage.jpeg",
  },
  {
    id: 2,
    name: "Usman Ali",
    position: "Graphic Designer",
    description:
      "Creates print-ready designs, manages layouts, and handles color corrections.",
    // image: "/printingImage.jpg",
    profileImage: "/profileImage.jpeg",
  },
  {
    id: 3,
    name: "Bilal Khan",
    position: "Offset Machine Operator",
    description:
      "Operates offset and digital machines with precision and efficiency.",
    // image: "/printingImage.jpg",
    profileImage: "/profileImage.jpeg",
  },
  {
    id: 4,
    name: "Shahid Mahmood",
    position: "Quality Control Supervisor",
    description:
      "Ensures color accuracy, paper quality, and finishing standards.",
    // image: "/printingImage.jpg",
    profileImage: "/profileImage.jpeg",
  },
  {
    id: 5,
    name: "Hassan Tariq",
    position: "Sales & Client Coordinator",
    description: "Handles customer orders, pricing, and client communication.",
    // image: "/printingImage.jpg",
    profileImage: "/profileImage.jpeg",
  },
  {
    id: 6,
    name: "Imran Yousaf",
    position: "Binding & Finishing Specialist",
    description:
      "Manages cutting, lamination, binding, and final product finishing.",
    // image: "/printingImage.jpg",
    profileImage: "/profileImage.jpeg",
  },
];

export default function EmployeeSection() {
  return (
    <div id="our-team" className="max-w-6xl mx-auto px-8 py-16">
      <h1 className="text-3xl md:text-4xl lg:text-5xl text-foreground dark:text-white font-semibold text-center px-4">
        Our Skilled Printing Professionals
      </h1>
      <p className="text-gray-500 leading-6 dark:text-gray-300 text-lg text-center max-w-xl mx-auto my-7">
        Behind every high-quality print is a team of experienced professionals
        dedicated to precision, quality, and timely delivery.
      </p>
      <HoverEffect users={employees} />
      <Button
        asChild
        className="
    flex items-center justify-center
    cursor-pointer max-w-[130px] h-10 rounded-full mx-auto mt-10 
      group z-10 hover:-translate-y-0.5 transition duration-200  text-center 
  "
      >
        <a
          href="/"
          className="flex items-center gap-1 text-md leading-none py-4 "
        >
          View All{" "}
          <MoveRight
            className=" ml-1
        w-4 h-4
        transition-transform duration-500 ease-out
        group-hover:translate-x-2
      "
          ></MoveRight>
        </a>
      </Button>
    </div>
  );
}
