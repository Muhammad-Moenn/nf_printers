"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted && Boolean(prefersReducedMotion);
}
