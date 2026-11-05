"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";

import React, { useRef, useState } from "react";
import { Link as ScrollLink } from "react-scroll";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("sticky inset-x-0 top-20 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "var(--shadow-navbar)"
          : "none",
        width: visible ? "min(92vw, 1040px)" : "min(96vw, 1280px)",
        y: visible ? 14 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 34,
      }}
      className={cn(
        "relative z-[60] mx-auto hidden flex-row items-center justify-between self-start rounded-lg border border-border bg-card/95 px-4 py-2 shadow-lg shadow-neutral-950/5 backdrop-blur-xl lg:flex dark:border-on-color/10 dark:bg-background/90",
        visible && "bg-card/95 dark:bg-background/95",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center gap-1 text-sm font-semibold text-muted-foreground transition duration-200 lg:flex",
        className
      )}
    >
      {items.map((item, idx) => (
        <ScrollLink
          key={`link-${idx}`}
          to={item.link} // target section id
          smooth={true} // smooth scroll
          duration={500} // scroll duration in ms
          offset={-60} // adjust for sticky navbar height
          onClick={onItemClick} // optional callback
          onMouseEnter={() => setHovered(idx)}
          className="relative flex h-9 cursor-pointer items-center justify-center rounded-md px-3.5 text-muted-foreground transition-colors hover:text-foreground dark:text-neutral-300 dark:hover:text-on-color"
        >
          {hovered === idx && (
            <motion.div
              layoutId="main-nav-hover"
              className="absolute inset-0 h-full w-full rounded-md bg-primary/10 ring-1 ring-primary/10 dark:bg-primary/10 dark:ring-primary/10"
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 32,
              }}
            />
          )}
          <span className="relative z-20 whitespace-nowrap">{item.name}</span>
        </ScrollLink>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "var(--shadow-navbar)"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: "8px",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between rounded-lg border border-border bg-card/95 px-3 py-2 shadow-lg shadow-neutral-950/5 backdrop-blur-xl lg:hidden dark:border-on-color/10 dark:bg-background/90",
        visible && "bg-card/95 dark:bg-background/95",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg border border-border bg-card px-4 py-8 shadow-lg shadow-neutral-950/10 dark:border-on-color/10 dark:bg-[var(--background)]",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX
      className="cursor-pointer text-foreground transition-opacity hover:opacity-70 dark:text-on-color"
      onClick={onClick}
    />
  ) : (
    <IconMenu2
      className="cursor-pointer text-foreground transition-opacity hover:opacity-70 dark:text-on-color"
      onClick={onClick}
    />
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-foreground cursor-pointer"
    >
      <Image
        src="/dashboard-NFPrinters-logo.png"
        alt="nf logo"
        priority
        width={150}
        height={20}
        className="h-auto w-[150px] lg:w-[175px]"
      />
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-primary text-primary-foreground button bg-primray text-foreground text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[var(--shadow-navbar)]",
    secondary: "bg-transparent shadow-none dark:text-on-color",
    dark: "bg-neutral-950 text-on-color shadow-[var(--shadow-navbar)]",
    gradient:
      "bg-gradient-to-b from-primary to-primary text-on-color shadow-[var(--shadow-inset)]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
