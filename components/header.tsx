"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { Link } from "react-scroll";
import { useUser } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { ModeToggle } from "./ui/mode-toggle";
import { Button } from "./ui/button";
import { LayoutDashboard, LogIn, LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavBar() {
  const navItems = [
    {
      name: "About",
      link: "#about",
    },
    {
      name: "Partners",
      link: "#partners",
    },
    {
      name: " Team",
      link: "#our-team",
    },
    {
      name: "Services",
      link: "#services",
    },
    {
      name: "Testimonials",
      link: "#testimonials",
    },
  ];
  const { user } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  const handleLogin = () => {
    if (!user) {
      router.push(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!);
    }
  };
  return (
    <div className="relative w-full" ref={ref}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onMouseLeave={() => setHovered(null)}
          className="
      fixed top-6 inset-x-0
      hidden lg:flex items-center
      justify-center gap-2
      text-sm font-medium
      dark:text-gray-900
      text-white
      bg-black/90
      dark:bg-gray-100
      backdrop-blur-md
      max-w-[600px]
      mx-auto
      px-6
      rounded-3xl
      h-[42px]
      z-50
    "
        >
          {navItems.map((item, idx) => (
            <Link
              to={item.link}
              smooth={true}
              offset={400}
              duration={500}
              key={idx}
              onMouseEnter={() => setHovered(idx)}
              href={item.link}
              className="relative px-4 py-2 "
            >
              {hovered === idx && (
                <motion.div
                  layoutId="hovered"
                  className="absolute inset-0 rounded-full bg-blue-200/[0.2]  dark:bg-[rgba(0,0,0,0.06)] h-[32px] top-1/2 -translate-y-1/2"
                />
              )}
              <span className="relative z-20  ">{item.name}</span>
            </Link>
          ))}
          <Button
            asChild
            className="
    flex items-center justify-center
    max-h-[32px] max-w-[100px] w-full
    rounded-2xl
   
  "
          >
            <a
              href="/"
              className=" group flex items-center justify-center h-full gap-1 text-sm leading-none"
            >
              Login
              <LogIn
                className="
        w-4 h-4
        transition-transform duration-500 ease-out
        group-hover:translate-x-2
      "
              />
            </a>
          </Button>
        </motion.div>
      )}

      <Navbar>
        {/* Desktop Navigation */}

        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {!user ? (
              <Button
                onClick={handleLogin}
                // asChild
                className="
    flex items-center justify-center
    cursor-pointer
    rounded-md  z-10 hover:-translate-y-0.5 transition duration-200  text-center 
  "
              >
                {/* <a
                href="/"
                className="flex items-center gap-1 text-sm leading-none"
              > */}
                <LogIn className="h-4 w-4" />
                Login
                {/* </a> */}
              </Button>
            ) : (
              <Button
                asChild
                className="
             flex items-center justify-center
             cursor-pointer
              rounded-md  z-10 hover:-translate-y-0.5 transition duration-200  text-center 
               "
              >
                <a
                  href="/user-dashboard"
                  className="flex items-center gap-1 text-sm leading-none"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </a>
              </Button>
            )}

            <ModeToggle />
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                to={item.link}
                smooth={true}
                offset={400}
                duration={500}
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-4">
              <Button
                asChild
                className="
    flex items-center justify-center
    cursor-pointer
    rounded-lg 
  "
              >
                <a
                  href="/"
                  className="flex items-center gap-1 text-sm leading-none"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </a>
              </Button>
              {/* <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Login
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Book a call
              </NavbarButton> */}
            </div>
            <ModeToggle />
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Navbar */}
    </div>
  );
}
