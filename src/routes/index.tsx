import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CycleWheel } from "@/components/visuals/CycleWheel";
import { Sparkles, MessageCircle, CalendarHeart, ClipboardCheck } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { TodayForYou } from "@/components/home/TodayForYou";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NariCare — Har Nari Ki Saheli" },
      {
        name: "description",
        content:
          "Understand your cycle, track your health, and talk to Nari — your own Saheli for women's health. 100% private, personal, and always by your side, just like a true saheli.",
      },
      { property: "og:title", content: "NariCare — Har Nari Ki Saheli" },
      {
        property: "og:description",
        content:
          "Understand your cycle, track your health, and talk to Nari — your own Saheli for women's health. 100% private, personal, and always by your side.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, staggerChildren: 0.08 },
  },
} as const;

const itemFade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
} as const;

function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        style={{ willChange: "transform, opacity" }}
        animate={{ y: [0, -20, 0], x: [0, 15, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[5%] top-[8%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle_at_center,var(--accent-gold-soft)_0%,transparent_70%)] sm:h-[420px] sm:w-[420px]"
      />
      <motion.div
        style={{ willChange: "transform, opacity" }}
        animate={{ y: [0, 30, 0], x: [0, -20, 0], opacity: [0.18, 0.35, 0.18] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[15%] right-0 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle_at_center,var(--accent-rose)_0%,transparent_70%)] sm:h-[520px] sm:w-[520px]"
      />
    </div>
  );
}

function Home() {
  const { profile } = useProfile();
  const name = profile?.name || "Nari";

  return (
    <div className="relative min-h-screen pb-10">
      <FloatingOrbs />

      {/* Greeting + hero */}
      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-6 sm:pt-10 md:pt-14">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mb-6 w-full text-center sm:mb-8"
        >
          <motion.p
            variants={itemFade}
            className="eyebrow justify-center mb-3"
          >
            <Sparkles className="h-3 w-3" /> Your private saheli
          </motion.p>
          <motion.h1
            variants={itemFade}
            className="bg-gradient-to-r from-accent-gold-soft to-accent-rose bg-clip-text pb-1 font-serif text-3xl text-transparent sm:text-4xl md:text-5xl"
          >
            Hi, {name}
          </motion.h1>
          <motion.p
            variants={itemFade}
            className="mx-auto mt-2 max-w-md text-sm font-medium text-muted-foreground sm:text-base"
          >
            Welcome to your safe haven — a quiet space to listen to your body.
          </motion.p>
        </motion.div>

        {/* Cycle wheel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
          className="relative mb-8 flex w-full justify-center sm:mb-12"
        >
          <div className="pointer-events-none absolute inset-0 z-0 rounded-full bg-gradient-to-tr from-accent-rose/10 to-accent-gold-soft/10 blur-[60px]" />
          <div className="relative z-10 origin-top -mt-6 scale-[0.85] transform sm:mt-0 sm:scale-100">
            <CycleWheel />
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4"
        >
          <motion.div variants={itemFade}>
            <Link
              to="/tracker"
              className="glass-card flex h-full flex-col items-center justify-center gap-3 rounded-3xl p-4 tap-target transition-transform active:scale-95 hover:bg-white/[0.04]"
            >
              <div className="rounded-full bg-accent-rose/20 p-3.5 text-accent-rose shadow-inner shadow-accent-rose/30">
                <CalendarHeart className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="text-sm font-medium tracking-wide text-foreground sm:text-base">
                Log symptoms
              </span>
            </Link>
          </motion.div>

          <motion.div variants={itemFade}>
            <Link
              to="/ask"
              className="glass-card flex h-full flex-col items-center justify-center gap-3 rounded-3xl p-4 tap-target transition-transform active:scale-95 hover:bg-white/[0.04]"
            >
              <div className="rounded-full bg-accent-gold-soft/20 p-3.5 text-accent-gold-soft shadow-inner shadow-accent-gold-soft/30">
                <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="text-sm font-medium tracking-wide text-foreground sm:text-base">
                Talk to Nari
              </span>
            </Link>
          </motion.div>

          <motion.div variants={itemFade} className="col-span-2 mt-1 sm:mt-2">
            <Link
              to="/assessment"
              className="btn-primary-glow flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 shadow-lg shadow-accent-rose/20 transition-transform active:scale-95"
            >
              <ClipboardCheck className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide sm:text-base">
                Take check-in assessment
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Personalized dashboard */}
      <section className="relative z-10 mt-10 sm:mt-14">
        <TodayForYou />
      </section>
    </div>
  );
}
