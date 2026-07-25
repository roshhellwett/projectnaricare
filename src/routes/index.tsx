import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CycleWheel } from "@/components/visuals/CycleWheel";
import { Sparkles, MessageCircle, CalendarHeart } from "lucide-react";
import { useProfile } from "@/lib/profile";

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
          "Understand your cycle, track your health, and talk to Nari — your own Saheli for women's health. 100% private, personal, and always by your side, just like a true saheli.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, staggerChildren: 0.1 },
  },
} as const;

const itemFade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
} as const;

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        style={{ willChange: "transform, opacity" }}
        animate={{
          y: [0, -20, 0],
          x: [0, 15, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[5%] h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] rounded-full bg-[radial-gradient(circle_at_center,var(--accent-gold-soft)_0%,transparent_70%)] opacity-30"
      />
      <motion.div
        style={{ willChange: "transform, opacity" }}
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] right-[0%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-[radial-gradient(circle_at_center,var(--accent-rose)_0%,transparent_70%)] opacity-20"
      />
    </div>
  );
}

function Home() {
  const { profile } = useProfile();

  return (
    <div className="relative min-h-screen pb-10">
      <FloatingOrbs />

      <section className="relative z-10 px-4 pt-6 sm:pt-10 md:pt-14 mx-auto max-w-4xl flex flex-col items-center">
        {/* HEADER / GREETING */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-center w-full mb-6 sm:mb-10"
        >
          <motion.h1
            variants={itemFade}
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-1"
          >
            Hi, {profile?.name || "Nari"}
          </motion.h1>
          <motion.p
            variants={itemFade}
            className="text-muted-foreground mt-1 text-sm sm:text-base font-medium"
          >
            Welcome to your safe haven.
          </motion.p>
        </motion.div>

        {/* DASHBOARD VISUAL (WHEEL) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          className="relative flex justify-center w-full mb-8 sm:mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-rose/10 to-accent-gold-soft/10 blur-[60px] rounded-full z-0 pointer-events-none" />
          <div className="relative z-10 scale-[0.85] sm:scale-100 transform origin-top -mt-8 sm:mt-0">
            <CycleWheel />
          </div>
        </motion.div>

        {/* QUICK ACTIONS GRID */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="w-full grid grid-cols-2 gap-3 sm:gap-4 max-w-lg"
        >
          <motion.div variants={itemFade}>
            <Link
              to="/tracker"
              className="glass-card flex flex-col items-center justify-center gap-3 p-4 rounded-3xl active:scale-95 transition-transform h-full hover:bg-white/[0.04]"
            >
              <div className="p-3.5 bg-accent-rose/20 rounded-full text-accent-rose shadow-inner shadow-accent-rose/30">
                <CalendarHeart className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="font-medium text-sm sm:text-base tracking-wide text-foreground">Log Symptoms</span>
            </Link>
          </motion.div>

          <motion.div variants={itemFade}>
            <Link
              to="/ask"
              className="glass-card flex flex-col items-center justify-center gap-3 p-4 rounded-3xl active:scale-95 transition-transform h-full hover:bg-white/[0.04]"
            >
              <div className="p-3.5 bg-accent-gold-soft/20 rounded-full text-accent-gold-soft shadow-inner shadow-accent-gold-soft/30">
                <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="font-medium text-sm sm:text-base tracking-wide text-foreground">Talk to Nari</span>
            </Link>
          </motion.div>

          <motion.div variants={itemFade} className="col-span-2 mt-1 sm:mt-2">
            <Link
              to="/assessment"
              className="btn-primary-glow flex items-center justify-center gap-2.5 py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-accent-rose/20 w-full"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold text-sm sm:text-base tracking-wide">Take Check-in Assessment</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
