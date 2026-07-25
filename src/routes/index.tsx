import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { CycleWheel } from "@/components/visuals/CycleWheel";
import { TodayForYou } from "@/components/home/TodayForYou";
import {
  ArrowRight,
  Heart,
  Sparkles,
  Flower2,
  MessageCircle,
  ShieldCheck,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NariCare — A gentle AI health companion for every Nari" },
      {
        name: "description",
        content:
          "Understand your cycle, track your body, and talk to Nari — a warm AI companion trained on women's health. Private, personal, and always by your side.",
      },
      { property: "og:title", content: "NariCare — A gentle AI health companion for every Nari" },
      {
        property: "og:description",
        content:
          "Understand your cycle, track your body, and talk to Nari — private, personal, and always by your side.",
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
              <Sparkles className="h-3 w-3" /> For every Nari, with love
            </motion.div>

            <motion.h1
              variants={itemFade}
              className="font-serif text-5xl leading-[1.05] md:text-7xl tracking-tight"
            >
              Your body has a story. <br className="hidden md:block" />
              <em className="italic text-transparent bg-clip-text bg-gradient-to-r from-accent-gold-soft to-accent-rose pb-2 pr-2">
                Nari
              </em>{" "}
              helps you listen.
            </motion.h1>

            <motion.p
              variants={itemFade}
              className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              A gentle, private space to understand your cycle, log your days, and ask the questions
              you'd whisper to a wise older sister. Nari is your AI companion — she knows your
              context and answers with warmth, not jargon.
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

      {/* TODAY FOR YOU */}
      <section className="relative z-10 pb-16 md:pb-24">
        <TodayForYou />
      </section>

      {/* FEATURES */}
      <section className="relative z-10 border-y border-hairline/50 bg-black/20 backdrop-blur-3xl py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-gold-soft/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="eyebrow justify-center"
            >
              Everything Nari holds for you
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 font-serif text-4xl md:text-5xl leading-tight"
            >
              A quiet toolkit for the questions{" "}
              <em className="italic text-accent-gold-soft">no one told us</em> to ask.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground"
            >
              Every corner is designed to be gentle, personal, and honest — never clinical, never
              scary.
            </motion.p>
          </div>

          {/* Masonry-style Grid */}
          <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ClipboardCheck className="h-6 w-6" />,
                title: "The Check-in",
                desc: "18 kind questions. Five clear signals — irregularity, PCOS, pain, anaemia, stress. No black boxes.",
                to: "/assessment",
                cta: "Take my check-in",
                span: "md:col-span-2 lg:col-span-2",
              },
              {
                icon: <Heart className="h-6 w-6" />,
                title: "Cycle Tracker",
                desc: "Log flow, pain and mood. Watch your rhythm appear and see when your next bloom is due.",
                to: "/tracker",
                cta: "Log today",
                span: "md:col-span-1 lg:col-span-1",
              },
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: "Ask Nari",
                desc: "A warm AI companion who reads your context. Ask about symptoms, remedies, or next steps.",
                to: "/ask",
                cta: "Open chat",
                span: "md:col-span-1 lg:col-span-1",
              },
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "Your Story",
                desc: "See every check-in you've taken and how your signals shift over time.",
                to: "/history",
                cta: "View history",
                span: "md:col-span-2 lg:col-span-2",
              },
              {
                icon: <ClipboardCheck className="h-6 w-6" />,
                title: "Doctor Companion",
                desc: "A personalized list of tests and questions to carry into your gynaecologist visit.",
                to: "/doctor",
                cta: "Prepare my visit",
                span: "md:col-span-2 lg:col-span-3",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                className={`glass-panel group relative flex flex-col p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 overflow-hidden ${f.span}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-gold-soft/0 to-transparent transition-all duration-500 group-hover:via-accent-gold-soft/50" />

                <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-rose/10 to-accent-gold/10 text-accent-gold-soft border border-white/5 shadow-[0_0_20px_rgba(240,201,137,0.1)] group-hover:scale-110 transition-transform duration-500 ease-out">
                  {f.icon}
                </div>
                <h3 className="relative z-10 font-serif text-2xl text-foreground/90">{f.title}</h3>
                <p className="relative z-10 mt-3 flex-1 text-base text-muted-foreground/80 leading-relaxed">
                  {f.desc}
                </p>
                <Link
                  to={f.to}
                  className="relative z-10 mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 text-sm font-semibold text-accent-gold-soft border border-white/5 transition-all group-hover:bg-accent-gold-soft group-hover:text-primary group-hover:shadow-[0_0_15px_rgba(240,201,137,0.3)]"
                >
                  {f.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl text-center mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="eyebrow justify-center"
            >
              The gentle process
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 font-serif text-4xl md:text-5xl"
            >
              Three soft steps, one clearer picture.
            </motion.h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-hairline to-transparent -translate-y-1/2 z-0" />

            {[
              {
                n: "01",
                h: "Share honestly",
                p: "18 short questions, grouped into 5 kind steps. Skip anything that feels too much.",
              },
              {
                n: "02",
                h: "Nari listens",
                p: "A clinically-informed engine reads your answers and shapes them into 5 clear signals.",
              },
              {
                n: "03",
                h: "Understand & act",
                p: "See your bloom, chat with Nari, and carry a personalized checklist to your doctor.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="relative z-10 glass-panel p-8 md:p-10 flex flex-col items-center text-center overflow-hidden group"
              >
                <div className="absolute -right-8 -top-12 text-[120px] font-serif italic font-light text-white/[0.02] pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:text-accent-gold-soft/[0.03]">
                  {s.n}
                </div>

                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background border border-hairline shadow-xl mb-6">
                  <span className="font-serif italic text-2xl text-accent-gold-soft">{s.n}</span>
                </div>
                <h3 className="relative text-xl font-serif">{s.h}</h3>
                <p className="relative mt-3 text-sm text-muted-foreground leading-relaxed">{s.p}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 pb-24 md:pb-32 px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2.5rem] border border-hairline/50 p-12 md:p-24 text-center shadow-2xl"
          >
            {/* Animated immersive background */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface to-background z-0" />
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 z-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(198,91,124,0.15) 0%, rgba(240,201,137,0.05) 50%, transparent 100%)",
                backgroundSize: "200% 200%",
              }}
            />

            <div className="relative z-10">
              <Flower2 className="mx-auto mb-6 h-10 w-10 text-accent-gold-soft opacity-80" />
              <h2 className="font-serif text-4xl md:text-6xl text-foreground">
                Ready when you are, Nari.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground/90 leading-relaxed">
                Take three quiet minutes. Nari will remember what you share and use it to answer
                every question that follows.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  to="/assessment"
                  className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
                >
                  Begin my check-in
                </Link>
                <Link
                  to="/ask"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-8 py-4 text-base font-semibold hover:bg-white/10 hover:border-accent-gold-soft/50 transition-all duration-300"
                >
                  <MessageCircle className="h-4 w-4 text-accent-gold-soft" /> Talk to Nari
                </Link>
              </div>
            </div>

            {/* Privacy footer inside CTA */}
            <div className="relative z-10 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-3 text-sm text-muted-foreground/60">
              <ShieldCheck className="h-4 w-4 text-accent-gold-soft/60" />
              <p>
                <span className="text-foreground/80 font-medium">Only yours.</span> Every entry
                stays inside your browser.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
