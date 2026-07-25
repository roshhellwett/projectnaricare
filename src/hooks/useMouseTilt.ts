import { useEffect } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Subtle mouse-driven tilt for hero visuals.
 * Returns spring-smoothed rotateX/rotateY motion values.
 * Disabled on reduced-motion and touch devices.
 */
export function useMouseTilt(strength = 6) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rxs = useSpring(rx, { stiffness: 80, damping: 20, mass: 0.6 });
  const rys = useSpring(ry, { stiffness: 80, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      ry.set(x * strength);
      rx.set(-y * strength);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, rx, ry, strength]);

  return { rx: rxs, ry: rys };
}
