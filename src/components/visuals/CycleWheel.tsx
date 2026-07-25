import { motion, useReducedMotion } from "framer-motion";
import flowerUrl from "@/assets/flower.png";

import { useMouseTilt } from "@/hooks/useMouseTilt";

/**
 * A fluid hero visual. Percentage-based orbits keep the artwork inside its
 * column at every viewport width, avoiding the old tablet overflow.
 */
export function CycleWheel() {
  const reduce = useReducedMotion();
  const { rx, ry } = useMouseTilt(4);
  const orbits = [
    { radius: 46, dur: 26, delay: 0, dot: 6 },
    { radius: 52, dur: 34, delay: 2, dot: 4 },
    { radius: 40, dur: 22, delay: 4, dot: 5 },
    { radius: 50, dur: 30, delay: 6, dot: 3 },
  ];

  return (
    <div
      className="relative flex aspect-square w-[clamp(17.5rem,72vw,35rem)] max-w-full items-center justify-center"
      style={{ perspective: 1200 }}
    >
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

      {!reduce &&
        orbits.map((orbit, index) => (
          <motion.div
            key={index}
            className="absolute left-1/2 top-1/2 hidden md:block"
            style={{
              width: `${orbit.radius * 2}%`,
              height: `${orbit.radius * 2}%`,
              marginLeft: `-${orbit.radius}%`,
              marginTop: `-${orbit.radius}%`,
            }}
            animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: orbit.dur,
              delay: orbit.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span
              className="absolute rounded-full"
              style={{
                width: orbit.dot,
                height: orbit.dot,
                top: -orbit.dot / 2,
                left: `calc(50% - ${orbit.dot / 2}px)`,
                background: "rgba(240,201,137,0.9)",
                boxShadow: "0 0 12px rgba(240,201,137,0.9)",
              }}
            />
          </motion.div>
        ))}

      <motion.img
        src={flowerUrl}
        alt="Gerbera daisy"
        width={560}
        height={560}
        style={{
          width: "100%",
          height: "100%",
          rotateX: reduce ? 0 : rx,
          rotateY: reduce ? 0 : ry,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 select-none object-contain drop-shadow-[0_28px_72px_rgba(168,68,106,0.42)]"
        draggable={false}
        animate={reduce ? {} : { rotate: [-2, 2, -2], scale: [1, 1.015, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
