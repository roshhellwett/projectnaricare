import { motion, useReducedMotion } from "framer-motion";
import flowerUrl from "@/assets/flower.png";

import { useMouseTilt } from "@/hooks/useMouseTilt";

/**
 * Static gerbera daisy hero visual with gentle idle sway,
 * mouse-driven parallax tilt, and orbiting golden pollen.
 */
export function CycleWheel({ size = 780 }: { size?: number }) {
  const reduce = useReducedMotion();
  const { rx, ry } = useMouseTilt(4);

  const orbits = [
    { r: size * 0.46, dur: 26, delay: 0, dot: 6 },
    { r: size * 0.52, dur: 34, delay: 2, dot: 4 },
    { r: size * 0.4, dur: 22, delay: 4, dot: 5 },
    { r: size * 0.5, dur: 30, delay: 6, dot: 3 },
  ];

  return (
    <div
      className="relative hidden items-center justify-center md:flex"
      style={{ width: size, height: size, perspective: 1200 }}
    >
      {/* Soft aurora halo */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(240,201,137,0.18), rgba(198,91,124,0.15), rgba(240,201,137,0.05), rgba(198,91,124,0.18), rgba(240,201,137,0.18))",
          filter: "blur(60px)",
        }}
        animate={reduce ? {} : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Orbiting pollen dots */}
      {!reduce &&
        orbits.map((o, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ width: o.r * 2, height: o.r * 2, marginLeft: -o.r, marginTop: -o.r }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: "linear" }}
          >
            <span
              className="absolute rounded-full"
              style={{
                width: o.dot,
                height: o.dot,
                top: -o.dot / 2,
                left: `calc(50% - ${o.dot / 2}px)`,
                background: "rgba(240,201,137,0.9)",
                boxShadow: "0 0 12px rgba(240,201,137,0.9)",
              }}
            />
          </motion.div>
        ))}

      {/* The flower — idle sway + breathe + mouse tilt */}
      <motion.img
        src={flowerUrl}
        alt="Gerbera daisy"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          rotateX: reduce ? 0 : rx,
          rotateY: reduce ? 0 : ry,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 select-none object-contain drop-shadow-[0_36px_100px_rgba(168,68,106,0.5)]"
        draggable={false}
        animate={
          reduce
            ? {}
            : {
                rotate: [-2, 2, -2],
                scale: [1, 1.015, 1],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
