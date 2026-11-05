"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ModeToggle({
  variant = "switch",
}: {
  variant?: "switch" | "icon";
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:text-neutral-300 dark:hover:bg-primary/10 dark:hover:text-primary-soft-foreground"
      >
        {isDark ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={`
        relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center
        rounded-full border transition-colors duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
        ${isDark
          ? "border-on-color/10 bg-neutral-700"
          : "border-border bg-muted"}
      `}
    >
      {/* Animated Thumb */}
      <motion.span
        layout
        animate={{ x: isDark ? 23 : 3 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-card shadow-sm"
      >
        {/* Sun */}
        <motion.span
          animate={{
            scale: isDark ? 0 : 1,
            rotate: isDark ? 90 : 0,
            opacity: isDark ? 0 : 1
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="h-3.5 w-3.5 text-warning-text" />
        </motion.span>

        {/* Moon */}
        <motion.span
          animate={{
            scale: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90,
            opacity: isDark ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="h-3.5 w-3.5 text-primary-text" />
        </motion.span>
      </motion.span>
    </button>
  );
}
















// "use client";

// import { useEffect, useState } from "react";
// import { Sun, Moon } from "lucide-react";
// import { useTheme } from "next-themes";

// export function ModeToggle() {
//   const { theme, resolvedTheme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => setMounted(true), []);
//   if (!mounted) return null;

//   const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

//   const toggleTheme = () => {
//     setTheme(isDark ? "light" : "dark");
//   };

//   return (
//     <button
//       type="button"
//       role="switch"
//       aria-checked={isDark}
//       onClick={toggleTheme}
//       className={`
//         relative inline-flex h-[25px] w-[43px] items-center
//         rounded-full transition-colors duration-300
//         focus:outline-none focus:ring-2 focus:ring-offset-2
//         ${isDark
//           ? "bg-neutral-600 focus:ring-border"
//           : "bg-warning focus:ring-warning"}
//       `}
//     >
//       {/* Track inner */}
//       <span
//         className={`
//           absolute inset-0 rounded-full
//           transition-opacity duration-300
//           ${isDark ? "opacity-100" : "opacity-0"}
//         `}
//       />

//       {/* Thumb */}
//       <span
//         className={`
//           relative flex h-5 w-5 items-center justify-center
//           rounded-full bg-card shadow-lg
//           transform transition-all duration-500 ease-out
//           ${isDark ? "translate-x-[21px]" : "translate-x-[2px]"}
//         `}
//       >
//         {/* Icons */}
//         <Sun
//           className={`
//             absolute h-4 w-4 text-warning-text
//             transition-all duration-300
//             ${isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"}
//           `}
//         />
//         <Moon
//           className={`
//             absolute h-4 w-4 text-primary-text
//             transition-all duration-300
//             ${isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"}
//           `}
//         />
//       </span>
//     </button>
//   );
// }
