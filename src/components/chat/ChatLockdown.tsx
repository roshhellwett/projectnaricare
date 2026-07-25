import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export function ChatLockdown() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel max-w-md text-center p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent-gold-soft to-accent-rose" />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-hairline/50 mb-6">
          <Lock className="h-7 w-7 text-accent-gold-soft" />
        </div>

        <h2 className="font-serif text-3xl mb-3">Unlock Nari</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          To provide you with safe, personalized, and highly accurate guidance, Nari needs a
          baseline understanding of your cycle. Please take the 3-minute health assessment to unlock
          your private AI companion.
        </p>

        <Link
          to="/assessment"
          className="btn-primary-glow inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold"
        >
          Take the assessment
        </Link>
      </motion.div>
    </div>
  );
}
