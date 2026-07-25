import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import flowerUrl from "@/assets/flower.png";

import { useHydrated } from "@/hooks/useHydrated";
import { useIsMobile } from "@/hooks/use-mobile";

type Ghost = {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  blur: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
};

type Pollen = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  drift: number;
};

export function AnimatedBackground() {
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();

  // Lower density on mobile for perf.
  const ghostCount = isMobile ? 2 : 6;
  const pollenCount = isMobile ? 0 : 22;

  const ghosts = useMemo<Ghost[]>(() => {
    // Only compute on the client — Math.random() would otherwise mismatch SSR.
    if (!hydrated) return [];
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    return Array.from({ length: ghostCount }, (_, i) => ({
      id: i,
      left: `${rand(-8, 90)}%`,
      top: `${rand(-6, 88)}%`,
      size: Math.round(rand(220, 460)),
      opacity: rand(0.05, 0.11),
      blur: Math.round(rand(2, 8)),
      delay: rand(0, 8),
      duration: rand(28, 46),
      drift: rand(18, 40),
      rotate: rand(-75, 75),
    }));
  }, [hydrated, ghostCount]);

  const pollen = useMemo<Pollen[]>(() => {
    if (!hydrated) return [];
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    return Array.from({ length: pollenCount }, (_, i) => ({
      id: 100 + i,
      left: `${rand(0, 100)}%`,
      top: `${rand(0, 100)}%`,
      size: Math.round(rand(2, 5)),
      delay: rand(0, 10),
      duration: rand(14, 26),
      drift: rand(30, 80),
    }));
  }, [hydrated, pollenCount]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Warm golden radial washes — SSR-safe, no randomness */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 82% -10%, rgba(240,201,137,0.22), transparent 60%), radial-gradient(900px 600px at -10% 110%, rgba(227,168,87,0.18), transparent 60%), radial-gradient(700px 500px at 50% 120%, rgba(198,91,124,0.18), transparent 65%)",
        }}
      />

      {/* Slow-drifting golden orbs — same on server + client */}
      <motion.div
        className="absolute -top-32 right-[-8%] h-[520px] w-[520px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(240,201,137,0.28) 0%, transparent 65%)",
          filter: "blur(6px)",
          willChange: "transform",
        }}
        animate={reduce ? undefined : { x: [0, 30, -10, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-24 h-[560px] w-[560px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(198,91,124,0.22) 0%, transparent 65%)",
          filter: "blur(8px)",
          willChange: "transform",
        }}
        animate={reduce ? undefined : { x: [0, -20, 15, 0], y: [0, -15, 20, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ghost gerberas — client-only to avoid hydration mismatch.
          Static blur (no per-frame filter animation) for GPU-friendly motion. */}
      {ghosts.map((g) => (
        <motion.img
          key={g.id}
          src={flowerUrl}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute select-none object-contain"
          style={{
            left: g.left,
            top: g.top,
            width: g.size,
            height: g.size,
            opacity: g.opacity,
            filter: isMobile ? "saturate(0.7)" : `blur(${g.blur}px) saturate(0.7) hue-rotate(-8deg)`,
            mixBlendMode: isMobile ? "normal" : "screen",
            willChange: "transform",
          }}
          initial={{ rotate: g.rotate, x: 0, y: 0 }}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -g.drift, g.drift * 0.6, 0],
                  x: [0, g.drift * 0.4, -g.drift * 0.3, 0],
                  rotate: [g.rotate, g.rotate + 12, g.rotate - 6, g.rotate],
                  scale: [1, 1.04, 0.98, 1],
                }
          }
          transition={{
            duration: g.duration,
            delay: g.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Golden pollen dots — client-only */}
      {pollen.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: "rgba(240,201,137,0.85)",
            boxShadow: "0 0 8px rgba(240,201,137,0.7)",
            mixBlendMode: "screen",
            willChange: "transform, opacity",
          }}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -p.drift, -p.drift * 0.4, -p.drift * 1.2, 0],
                  x: [0, p.drift * 0.3, -p.drift * 0.2, p.drift * 0.4, 0],
                  opacity: [0.15, 0.9, 0.4, 0.7, 0.15],
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(28,18,32,0.55) 100%)",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
