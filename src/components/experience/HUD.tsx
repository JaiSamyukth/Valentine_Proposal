"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useExperience } from "@/lib/experience-store";
import type { AchievementKey } from "@/lib/experience-store";
import {
  COLLECTABLE_META,
  COLLECTABLE_ORDER,
  ACHIEVEMENT_META,
} from "@/lib/content";
import { cn } from "@/lib/utils";

export function HUD() {
  const collectables = useExperience((s) => s.collectables);
  const achievements = useExperience((s) => s.achievements);
  const [open, setOpen] = useState(false);

  const total = Object.values(collectables).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-[88] flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-white/80 transition-all hover:glass-strong sm:left-6 sm:top-6 btn-bouncy"
        aria-label="Open collection"
      >
        <span className="text-base">🎒</span>
        <span className="hidden sm:inline">Collection</span>
        <span className="rounded-full bg-[var(--rose-glow)]/30 px-1.5 text-[10px] font-bold text-[var(--rose-glow)]">
          {total}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="glass-strong max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl gradient-text-rose">
                  Your Collection
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-2 text-xs uppercase tracking-[0.25em] text-white/50">
                Collectables
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {COLLECTABLE_ORDER.map((k) => {
                  const meta = COLLECTABLE_META[k];
                  const count = collectables[k];
                  return (
                    <div
                      key={k}
                      className={cn(
                        "flex flex-col items-center rounded-2xl border p-2.5 text-center transition-all",
                        count > 0
                          ? "border-white/20 bg-white/5"
                          : "border-white/5 bg-white/[0.02] opacity-40 grayscale"
                      )}
                    >
                      <span className="text-2xl">{meta.emoji}</span>
                      <span className="mt-1 text-[10px] text-white/70">
                        {meta.label}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: count > 0 ? meta.color : undefined }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mb-2 mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                <Trophy className="h-3.5 w-3.5 text-[var(--gold)]" />
                Achievements ({achievements.length}/
                {Object.keys(ACHIEVEMENT_META).length})
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(ACHIEVEMENT_META) as AchievementKey[]).map(
                  (key) => {
                    const meta = ACHIEVEMENT_META[key];
                    const unlocked = achievements.includes(key);
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-2.5 transition-all",
                          unlocked
                            ? "border-[var(--gold)]/40 bg-[var(--gold)]/5"
                            : "border-white/5 bg-white/[0.02] opacity-40"
                        )}
                      >
                        <span className="text-2xl">
                          {unlocked ? meta.emoji : "🔒"}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {meta.label}
                          </div>
                          <div className="text-xs text-white/50">{meta.desc}</div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <p className="mt-6 text-center font-script text-sm text-white/40">
                Tip: type a secret word anywhere... ✨
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
