"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENT_META } from "@/lib/content";
import type { AchievementKey } from "@/lib/experience-store";
import { playFlourish } from "@/lib/sound";

export function AchievementToasts() {
  const [shown, setShown] = useState<AchievementKey | null>(null);
  const shownRef = useRef<AchievementKey | null>(null);
  const queueRef = useRef<AchievementKey[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNext = () => {
    const next = queueRef.current.shift();
    if (next) {
      shownRef.current = next;
      setShown(next);
      playFlourish();
      timerRef.current = setTimeout(() => {
        shownRef.current = null;
        setShown(null);
        // try next after a brief pause
        timerRef.current = setTimeout(showNext, 250);
      }, 3200);
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const key = (e as CustomEvent<AchievementKey>).detail;
      queueRef.current.push(key);
      if (!shownRef.current) {
        showNext();
      }
    };
    window.addEventListener("achievement-unlocked", handler);
    return () => {
      window.removeEventListener("achievement-unlocked", handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key={shown}
          initial={{ opacity: 0, x: 60, scale: 0.85 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="pointer-events-none fixed right-4 top-16 z-[95] sm:right-6 sm:top-20"
        >
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3 glow-gold">
            <motion.span
              className="text-3xl"
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 12,
                delay: 0.1,
              }}
            >
              {ACHIEVEMENT_META[shown].emoji}
            </motion.span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">
                Achievement unlocked
              </div>
              <div className="font-display text-sm text-white">
                {ACHIEVEMENT_META[shown].label}
              </div>
              <div className="text-xs text-white/60">
                {ACHIEVEMENT_META[shown].desc}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
