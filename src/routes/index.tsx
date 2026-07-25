import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { CycleWheel } from "@/components/visuals/CycleWheel";
import {
  ArrowRight,
  Sparkles,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 15, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] h-[400px] w-[400px] rounded-full bg-accent-gold-soft/10 blur-[80px]"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] right-[5%] h-[500px] w-[500px] rounded-full bg-accent-rose/10 blur-[100px]"
      />
    </div>
  );
}

function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const { profile } = useProfile();

  return (
    <div className="relative">
      <FloatingOrbs />

      {/* HERO */}
      <section className="relative z-10 overflow-hidden min-h-[90vh] flex items-center">
        <motion.div
          style={{ y: heroY }}
          className="mx-auto w-full grid max-w-7xl gap-14 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center"
        >
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <motion.div variants={itemFade} className="eyebrow mb-6">
              <Sparkles className="h-3 w-3" /> A safe space for every Indian woman
            </motion.div>

            <motion.h1
              variants={itemFade}
              className="font-serif text-5xl leading-[1.05] md:text-7xl tracking-tight"
            >
              Your body has a story, {profile?.name || "Nari"}. <br className="hidden md:block" />
              Let <em className="italic text-transparent bg-clip-text bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2 pr-2">
                Nari
              </em>{" "}
              help you listen.
            </motion.h1>

            <motion.p
              variants={itemFade}
              className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              Welcome to your safe haven. A quiet, private space free from judgment where you can
              understand your body, track your cycle, and ask the questions you've always wanted to ask.
              Think of Nari as your wise older sister — she understands the unique
              nuances of being an Indian woman, and is always here to listen and answer with warmth,
              love, and absolute privacy.
            </motion.p>

            <motion.div variants={itemFade} className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/assessment"
                className="btn-primary-glow group inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-semibold"
              >
                Begin my check-in{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/ask"
                className="group relative inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-gold-soft/50 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-gold-soft/0 to-accent-gold-soft/0 group-hover:from-accent-gold-soft/10 group-hover:to-accent-rose/10 transition-all duration-500" />
                <MessageCircle className="h-4 w-4 text-accent-gold-soft" />
                <span className="relative z-10">Talk to Nari</span>
              </Link>
            </motion.div>

            <motion.p
              variants={itemFade}
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80"
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent-gold-soft" />
              <span>No sign-up</span>
              <span className="text-accent-gold-soft/30">·</span>
              <span>Stays in your browser</span>
              <span className="text-accent-gold-soft/30">·</span>
              <span>Private</span>
            </motion.p>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-rose/20 to-accent-gold-soft/20 blur-[100px] rounded-full z-0" />
            <div className="relative z-10 drop-shadow-[0_0_40px_rgba(240,201,137,0.15)]">
              <CycleWheel />
            </div>
          </motion.div>
        </motion.div>
      </section>


    </div>
  );
}
