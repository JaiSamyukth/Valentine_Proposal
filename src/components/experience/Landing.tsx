"use client";

import { motion } from "framer-motion";
import { Sparkles, Wand2, Heart, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { playPop, vibrate } from "@/lib/sound";
import { navigate } from "@/lib/router";

export function Landing() {
  const goToBuilder = () => {
    playPop();
    vibrate(20);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      shapes: ["❤️", "✨"],
      scalar: 1.4,
    });
    navigate("builder");
  };

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="mb-6 text-7xl animate-heartbeat sm:text-8xl"
        style={{
          filter:
            "drop-shadow(0 0 30px rgba(255,94,138,0.9)) drop-shadow(0 0 80px rgba(255,94,138,0.5))",
        }}
      >
        💖
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-3 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70"
      >
        <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
        a universe, per link
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-4xl leading-tight gradient-text-rose sm:text-6xl"
      >
        Build a world
        <br />
        they&apos;ll never forget
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 max-w-md font-script text-xl text-white/70"
      >
        Configure every detail — names, story, games, music, secrets. Generate a
        unique link. They open it, and a cinematic experience begins instantly.
        Zero inputs. Everything already knows them.
      </motion.p>

      <motion.button
        onClick={goToBuilder}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] px-8 py-4 font-display text-lg text-black glow-rose btn-bouncy"
      >
        <Wand2 className="h-5 w-5" />
        Open the Builder
        <ArrowRight className="h-5 w-5" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-12 grid grid-cols-3 gap-4 text-xs text-white/40"
      >
        <Feature emoji="🎬" label="Cinematic opening" />
        <Feature emoji="🎮" label="11 mini-games" />
        <Feature emoji="🌀" label="Procedural seeds" />
        <Feature emoji="✨" label="AI poems" />
        <Feature emoji="📸" label="Photos & voice" />
        <Feature emoji="🌌" label="7 themes" />
      </motion.div>

      <p className="mt-8 flex items-center gap-1 text-xs text-white/30">
        Made with <Heart className="h-3 w-3 fill-[var(--rose-glow)] text-[var(--rose-glow)]" /> for someone brave enough to ask
      </p>
    </div>
  );
}

function Feature({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl">{emoji}</span>
      <span>{label}</span>
    </div>
  );
}
