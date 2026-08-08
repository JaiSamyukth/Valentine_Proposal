"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FUNNY_POPUPS } from "@/lib/content";

let externalTrigger: ((text?: string) => void) | null = null;

export function triggerFunnyPopup(text?: string) {
  externalTrigger?.(text);
}

export function FunnyPopups() {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    externalTrigger = (text?: string) => {
      const msg =
        text || FUNNY_POPUPS[Math.floor(Math.random() * FUNNY_POPUPS.length)];
      setCurrent(msg);
      setTimeout(() => setCurrent(null), 2200);
    };
    return () => {
      externalTrigger = null;
    };
  }, []);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="pointer-events-none fixed bottom-24 left-1/2 z-[90] -translate-x-1/2"
        >
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-5 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--rose-glow)] glow-rose" />
            <span className="font-mono text-sm text-white/90">{current}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
