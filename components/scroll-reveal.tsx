"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";

const VARIANTS: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Fades + slides its children into place the first time they scroll into
 * view. A thin client-component wrapper so server-rendered sections can
 * opt individual blocks into a scroll animation without becoming client
 * components themselves.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={VARIANTS}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
