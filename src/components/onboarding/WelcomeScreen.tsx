import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useProfile } from "@/lib/profile";

export function WelcomeScreen() {
  const { setProfile } = useProfile();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && age) {
      setProfile({ name: name.trim(), age: Number(age) });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-bg text-foreground">
      {/* Background gradients */}
      <div className="pointer-events-none fixed left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-rose/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-accent-gold-soft/10 blur-[100px]" />

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-rose to-accent-gold shadow-[0_0_40px_rgba(240,201,137,0.3)]">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              Welcome to your safe space.
            </h1>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed md:text-base">
              Hey yaar! I'm Nari. I'm here for all your cycle rants and health questions, with absolutely zero judgment. Tell me a bit about yourself so we can vibe better!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground/80">
                What should Nari call you?
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neha (nicknames are fine!)"
                className="w-full rounded-2xl border border-hairline/50 bg-white/5 px-5 py-4 text-base md:text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent-gold-soft/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-gold-soft/20 transition-all"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <label htmlFor="age" className="mb-2 block text-sm font-medium text-foreground/80">
                How old are you?
              </label>
              <input
                id="age"
                type="number"
                min={10}
                max={99}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 24"
                className="w-full rounded-2xl border border-hairline/50 bg-white/5 px-5 py-4 text-base md:text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent-gold-soft/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-gold-soft/20 transition-all"
                required
              />
              <p className="mt-2 text-xs text-muted-foreground/70">
                This helps Nari give you age-appropriate advice (e.g. teen years vs adulthood).
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="pt-4"
            >
              <button
                type="submit"
                disabled={!name.trim() || !age}
                className="btn-primary-glow flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-base font-semibold disabled:opacity-50 transition-all"
              >
                Let's begin <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 flex justify-center gap-6 text-xs text-muted-foreground/60"
          >
            <span className="flex items-center gap-1.5">🔒 Private</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">💾 Stays in your browser</span>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
