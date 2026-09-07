"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import type { HeroMedia } from "@prisma/client";

const DWELL_MS = 6000;
const SWIPE_OFFSET_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 400;

/**
 * Admin-managed hero background (src/app/admin/hero). One item loops
 * (video: native loop; image: a slow breathing zoom). Two or more become a
 * crossfading, swipeable, auto-advancing slideshow with a per-slide
 * Ken Burns zoom. Falls back to nothing — the caller renders PartyLights
 * instead when `items` is empty.
 */
export function HeroBackgroundMedia({ items }: { items: HeroMedia[] }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const visibleRef = useRef(true);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    function handleVisibility() {
      visibleRef.current = document.visibilityState === "visible";
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (items.length < 2 || reduceMotion) return;
    const timer = setInterval(() => {
      if (!visibleRef.current) return;
      setIndex((i) => (i + 1) % items.length);
    }, DWELL_MS);
    return () => clearInterval(timer);
  }, [items.length, reduceMotion]);

  if (items.length === 0) return null;

  function goNext() {
    setIndex((i) => (i + 1) % items.length);
  }
  function goPrev() {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      goNext();
    } else if (
      info.offset.x > SWIPE_OFFSET_THRESHOLD ||
      info.velocity.x > SWIPE_VELOCITY_THRESHOLD
    ) {
      goPrev();
    }
  }

  const current = items[index]!;
  const isSingle = items.length === 1;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={current.id}
          drag={isSingle ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 touch-pan-y"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={reduceMotion ? { scale: 1 } : { scale: 1.12 }}
            transition={
              reduceMotion
                ? undefined
                : isSingle
                  ? { duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                  : { duration: DWELL_MS / 1000 + 1, ease: "linear" }
            }
            className="relative h-full w-full"
          >
            {current.type === "IMAGE" ? (
              // next/image can't optimize this — it's served through a route
              // handler (src/app/api/hero-media/[filename]), not a literal
              // public/ path, which is what next/image's local optimizer
              // requires. See that route handler's comment for why.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.url}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            ) : (
              <video
                src={current.url}
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-glow" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
