"use client";

import { motion } from "motion/react";

/**
 * Standard entrance animation — fade + rise. Respects
 * prefers-reduced-motion automatically via the app-wide `MotionConfig` in
 * the root layout.
 */
export function FadeIn({
  children,
  delay = 0,
  className,
  y = 16,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
