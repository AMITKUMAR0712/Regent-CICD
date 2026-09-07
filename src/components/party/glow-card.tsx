"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

type GlowStyle = React.CSSProperties & { "--x"?: MotionValue<string>; "--y"?: MotionValue<string> };

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

/**
 * Glassmorphic card with a mouse-driven 3D tilt and a glow that follows the
 * cursor along its border. Tilt is skipped under prefers-reduced-motion —
 * the card still renders, just flat and static.
 */
export function GlowCard({
  children,
  className,
  glowClassName,
}: {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotionRef = useRef(false);
  if (typeof window !== "undefined") {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), SPRING);
  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotionRef.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: reduceMotionRef.current ? 0 : rotateX,
        rotateY: reduceMotionRef.current ? 0 : rotateY,
        transformPerspective: 1000,
      }}
      className={cn(
        "group/glow-card relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 shadow-[0_0_60px_-15px_rgba(242,180,65,0.25)] backdrop-blur-xl",
        className
      )}
    >
      <CursorGlow x={glowX} y={glowY} className={glowClassName} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function CursorGlow({
  x,
  y,
  className,
}: {
  x: MotionValue<string>;
  y: MotionValue<string>;
  className?: string;
}) {
  const style: GlowStyle = {
    "--x": x,
    "--y": y,
    background:
      "radial-gradient(280px circle at var(--x) var(--y), rgba(242,180,65,0.16), transparent 70%)",
  };

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/glow-card:opacity-100",
        className
      )}
      style={style}
    />
  );
}
