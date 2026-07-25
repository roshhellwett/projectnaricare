import { motion } from "framer-motion";

/**
 * Animated shimmer skeleton block.
 * Accepts className for sizing/layout and optional `rounded` for shape.
 */
function Bone({
  className = "",
  rounded = "rounded-lg",
}: {
  className?: string;
  rounded?: string;
}) {
  return <div className={`skeleton-shimmer bg-white/[0.06] ${rounded} ${className}`} aria-hidden />;
}

/** Skeleton for a page header: eyebrow + title + subtitle */
export function PageHeaderSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <Bone className="h-3 w-32" rounded="rounded-full" />
      <Bone className="h-10 w-72 md:w-96" rounded="rounded-xl" />
      <Bone className="h-4 w-48" rounded="rounded-full" />
    </motion.div>
  );
}

/** Skeleton for a glass card with a few content lines */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-4"
    >
      <Bone className="h-5 w-2/5" rounded="rounded-md" />
      {Array.from({ length: lines }).map((_, i) => (
        <Bone
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-3/5" : "w-full"}`}
          rounded="rounded-md"
        />
      ))}
    </motion.div>
  );
}

/** Skeleton for a list of entries */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-4 rounded-2xl border border-hairline/30 bg-white/[0.03] px-5 py-4"
        >
          <Bone className="h-4 w-20" rounded="rounded-md" />
          <div className="flex-1 space-y-2">
            <Bone className="h-3.5 w-3/4" rounded="rounded-md" />
            <Bone className="h-2.5 w-1/2" rounded="rounded-md" />
          </div>
          <Bone className="h-8 w-8" rounded="rounded-full" />
        </motion.div>
      ))}
    </div>
  );
}

/** Skeleton for the "Today For You" panel with 3 cards */
export function TodayForYouSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mx-auto max-w-7xl px-6"
    >
      <div className="glass-card p-6 md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <Bone className="h-1.5 w-1.5" rounded="rounded-full" />
          <Bone className="h-3 w-24" rounded="rounded-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-hairline/30 bg-bg-alt/50 p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Bone className="h-8 w-8" rounded="rounded-full" />
                <Bone className="h-4 w-24" rounded="rounded-md" />
              </div>
              <Bone className="h-3 w-full" rounded="rounded-md" />
              <Bone className="h-3 w-4/5" rounded="rounded-md" />
              <Bone className="h-3 w-16" rounded="rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** Skeleton for the chat loading state */
export function ChatSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-rose/20 to-accent-gold/20 border border-hairline/30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-6 w-6 rounded-full border-2 border-accent-gold-soft/30 border-t-accent-gold-soft"
        />
      </div>
      <div className="space-y-2 text-center">
        <Bone className="mx-auto h-4 w-40" rounded="rounded-md" />
        <Bone className="mx-auto h-3 w-28" rounded="rounded-md" />
      </div>
    </motion.div>
  );
}

/** Skeleton for the doctor page checklist panels */
export function DoctorSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-panel p-7 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 h-1 w-full skeleton-shimmer bg-white/[0.06]" />
          <div className="mb-6 flex items-center gap-3">
            <Bone className="h-10 w-10" rounded="rounded-xl" />
            <Bone className="h-6 w-36" rounded="rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-start gap-3 p-3">
                <Bone className="h-5 w-5 flex-none" rounded="rounded-full" />
                <Bone className="h-4 flex-1" rounded="rounded-md" />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
