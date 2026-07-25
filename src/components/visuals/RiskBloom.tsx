import { motion } from "framer-motion";
import { CATEGORIES, levelOf } from "@/lib/health/scoring";
import type { AssessmentScores } from "@/lib/storage";

export function RiskBloom({ scores, size = 340 }: { scores: AssessmentScores; size?: number }) {
  const cx = 160;
  const cy = 160;
  const maxR = 118;
  const minR = 30;
  const n = CATEGORIES.length;

  const petals = CATEGORIES.map((c, i) => {
    const score = scores[c.key];
    const r = minR + (score / 100) * (maxR - minR);
    const angle = ((Math.PI * 2) / n) * i - Math.PI / 2;
    const nextAngle = ((Math.PI * 2) / n) * (i + 1) - Math.PI / 2;
    const midAngle = (angle + nextAngle) / 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(nextAngle);
    const y2 = cy + r * Math.sin(nextAngle);
    const cxr = cx + r * 1.12 * Math.cos(midAngle);
    const cyr = cy + r * 1.12 * Math.sin(midAngle);
    const color = levelOf(score).hex;
    const lx = cx + (maxR + 30) * Math.cos(midAngle);
    const ly = cy + (maxR + 30) * Math.sin(midAngle);
    const anchor: "start" | "end" | "middle" =
      Math.cos(midAngle) > 0.3 ? "start" : Math.cos(midAngle) < -0.3 ? "end" : "middle";
    return {
      c,
      color,
      d: `M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} Q${cxr.toFixed(1)} ${cyr.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} Z`,
      lx,
      ly,
      anchor,
    };
  });

  return (
    <svg width={size} height={size} viewBox="0 0 320 320">
      {[minR, (minR + maxR) / 2, maxR].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(246,237,232,0.08)" />
      ))}
      {petals.map((p, i) => (
        <motion.path
          key={p.c.key}
          d={p.d}
          fill={p.color}
          stroke={p.color}
          strokeWidth={1.5}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.12, duration: 0.7, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <circle cx={cx} cy={cy} r={minR - 6} fill="#251729" stroke="rgba(246,237,232,0.12)" />
      {petals.map((p) => (
        <text
          key={`${p.c.key}-label`}
          x={p.lx.toFixed(1)}
          y={p.ly.toFixed(1)}
          textAnchor={p.anchor}
          fontFamily="IBM Plex Mono, monospace"
          fontSize="8.5"
          fill="#c9afc0"
          letterSpacing="1"
        >
          {p.c.name.split(" ")[0].toUpperCase()}
        </text>
      ))}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="Fraunces, serif"
        fontSize="16"
        fill="#f6ede8"
      >
        Risk
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontFamily="Fraunces, serif"
        fontSize="16"
        fill="#f6ede8"
      >
        Bloom
      </text>
    </svg>
  );
}
