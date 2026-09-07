"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  hue: "glow" | "plum-lit";
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
};

const COLORS: Record<Particle["hue"], string> = {
  glow: "242, 180, 65", // --glow
  "plum-lit": "169, 79, 146", // --plum-lit
};

const DENSITY_PRESETS = {
  /** Marketing/entry surfaces — the full party feeling. */
  vivid: { count: 46, opacity: 1, radius: 1 },
  /** Dashboards — brand present, but calm enough to work against. */
  calm: { count: 20, opacity: 0.55, radius: 0.7 },
} as const;

export type PartyLightsDensity = keyof typeof DENSITY_PRESETS;

function createParticles(width: number, height: number, density: PartyLightsDensity): Particle[] {
  const preset = DENSITY_PRESETS[density];
  return Array.from({ length: preset.count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: (8 + Math.random() * 22) * preset.radius,
    speedX: (Math.random() - 0.5) * 0.12,
    speedY: -0.05 - Math.random() * 0.15,
    hue: Math.random() < 0.72 ? "glow" : "plum-lit",
    baseOpacity: (0.12 + Math.random() * 0.22) * preset.opacity,
    twinkleSpeed: 0.0008 + Math.random() * 0.0015,
    twinklePhase: Math.random() * Math.PI * 2,
  }));
}

/**
 * Decorative ambient background for night surfaces — soft drifting amber
 * and plum lights, evoking string lights over a party rather than a
 * literal video. Freezes on `prefers-reduced-motion: reduce` and pauses
 * when the tab isn't visible.
 */
export function PartyLights({ density = "vivid" }: { density?: PartyLightsDensity }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frameId = 0;
    let visible = true;

    function resize() {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvasEl.clientWidth;
      height = canvasEl.clientHeight;
      canvasEl.width = width * dpr;
      canvasEl.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(width, height, density);
    }

    function drawFrame(time: number) {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.y < -p.radius) {
            p.y = height + p.radius;
            p.x = Math.random() * width;
          }
          if (p.x < -p.radius) p.x = width + p.radius;
          if (p.x > width + p.radius) p.x = -p.radius;
        }

        const twinkle = reduceMotion
          ? 1
          : 0.6 + 0.4 * Math.sin(time * p.twinkleSpeed + p.twinklePhase);
        const opacity = p.baseOpacity * twinkle;

        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(${COLORS[p.hue]}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${COLORS[p.hue]}, 0)`);
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop(time: number) {
      if (visible) drawFrame(time);
      frameId = requestAnimationFrame(loop);
    }

    function handleVisibility() {
      visible = document.visibilityState === "visible";
    }

    resize();
    drawFrame(0);

    if (!reduceMotion) {
      frameId = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
