"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className={`
        relative inline-flex h-[21px] w-[40px] items-center
        rounded-full transition-colors duration-300
        focus:outline-none ring-2 ring-offset-2 cursor-pointer mx-[5px]
        ${isDark
          ? "bg-zinc-700/70 ring-gray-400"
          : "bg-yellow-400 ring-yellow-500"}
      `}
    >
      {/* Animated Thumb */}
      <motion.span
        layout
        animate={{ x: isDark ? 21 : 2.3 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        className="absolute flex h-[17px] w-[17px] items-center justify-center rounded-full bg-white shadow-lg"
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
          <Sun className="h-[14px] w-[14px] text-yellow-500" />
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
          <Moon className="h-[14px] w-[14px] text-blue-600" />
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
//           ? "bg-zinc-600 focus:ring-zinc-500"
//           : "bg-yellow-400 focus:ring-yellow-500"}
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
//           rounded-full bg-white shadow-lg
//           transform transition-all duration-500 ease-out
//           ${isDark ? "translate-x-[21px]" : "translate-x-[2px]"}
//         `}
//       >
//         {/* Icons */}
//         <Sun
//           className={`
//             absolute h-4 w-4 text-yellow-500
//             transition-all duration-300
//             ${isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"}
//           `}
//         />
//         <Moon
//           className={`
//             absolute h-4 w-4 text-blue-600
//             transition-all duration-300
//             ${isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"}
//           `}
//         />
//       </span>
//     </button>
//   );
// }