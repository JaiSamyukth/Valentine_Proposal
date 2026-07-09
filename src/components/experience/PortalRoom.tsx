"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useExperience } from "@/lib/experience-store";
import {
  COLLECTABLE_META,
  COLLECTABLE_ORDER,
  ACHIEVEMENT_META,
} from "@/lib/content";
import type { AchievementKey } from "@/lib/experience-store";
import { playChime, playFlourish, vibrate } from "@/lib/sound";

let externalTrigger: (() => void) | null = null;

/** Allow other components (e.g. SecretListener) to open the Portal Room. */
export function openPortalRoom() {
  externalTrigger?.();
}

export function PortalRoom() {
  const phase = useExperience((s) => s.phase);
  const collectables = useExperience((s) => s.collectables);
  const achievements = useExperience((s) => s.achievements);
  const [open, setOpen] = useState(false);
  const seenRef = useRef(false);

  useEffect(() => {
    externalTrigger = () => {
      setOpen(true);
      playFlourish();
      vibrate([40, 60, 40]);
      confetti({
        particleCount: 120,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        shapes: ["🌀", "✨", "💫"],
        scalar: 1.5,
      });
    };
    return () => {
      externalTrigger = null;
    };
  }, []);

  if (phase === "boot" || phase === "setup") return null;

  const totalCollected = Object.entries(collectables).filter(
    ([, v]) => v > 0
  ).length;
  const totalCollectableTypes = COLLECTABLE_ORDER.length;
  const totalItems = Object.values(collectables).reduce((a, b) => a + b, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[145] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          {/* Swirling portal backdrop */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-30"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "conic-gradient(from 0deg, var(--rose-glow), var(--gold), var(--aurora), var(--rose-glow))",
              borderRadius: "9999px",
              filter: "blur(80px)",
            }}
          />

          <motion.div
            initial={{ scale: 0.8, y: 30, rotateY: 15 }}
            animate={{ scale: 1, y: 0, rotateY: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl glass-strong p-6"
            style={{ transformPerspective: 1000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Close portal room"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[var(--aurora)]" />
              <h2 className="font-display text-3xl gradient-text-gold">
                The Portal Room
              </h2>
            </div>
            <p className="mb-6 font-script text-base text-white/60">
              A swirling gallery of everything you've collected on this journey.
            </p>

            {/* Summary stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              <SummaryStat
                label="Types found"
                value={`${totalCollected}/${totalCollectableTypes}`}
                color="var(--rose-glow)"
              />
              <SummaryStat
                label="Total items"
                value={String(totalItems)}
                color="var(--gold)"
              />
              <SummaryStat
                label="Achievements"
                value={`${achievements.length}/${Object.keys(ACHIEVEMENT_META).length}`}
                color="var(--aurora)"
              />
            </div>

            {/* Collectable showcase */}
            <div className="mb-6">
              <div className="mb-2 text-xs uppercase tracking-[0.25em] text-white/50">
                Collectable showcase
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {COLLECTABLE_ORDER.map((k) => {
                  const meta = COLLECTABLE_META[k];
                  const count = collectables[k];
                  const found = count > 0;
                  return (
                    <motion.div
                      key={k}
                      whileHover={found ? { scale: 1.05, rotate: 2 } : {}}
                      className={`flex flex-col items-center rounded-2xl border p-3 text-center transition-all ${
                        found
                          ? "border-white/20 bg-white/5"
                          : "border-white/5 bg-white/[0.02] opacity-40 grayscale"
                      }`}
                      style={
                        found
                          ? { boxShadow: `0 0 12px ${meta.color}30` }
                          : undefined
                      }
                    >
                      <span className="text-3xl">
                        {found ? meta.emoji : "🔒"}
                      </span>
                      <span className="mt-1 text-[10px] text-white/70">
                        {meta.label}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: found ? meta.color : undefined }}
                      >
                        {count}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Achievement wall */}
            <div className="mb-2">
              <div className="mb-2 text-xs uppercase tracking-[0.25em] text-white/50">
                Achievement wall
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(ACHIEVEMENT_META) as AchievementKey[]).map(
                  (key) => {
                    const meta = ACHIEVEMENT_META[key];
                    const unlocked = achievements.includes(key);
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 rounded-2xl border p-2.5 transition-all ${
                          unlocked
                            ? "border-[var(--gold)]/40 bg-[var(--gold)]/5"
                            : "border-white/5 bg-white/[0.02] opacity-40"
                        }`}
                      >
                        <span className="text-2xl">
                          {unlocked ? meta.emoji : "🔒"}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {meta.label}
                          </div>
                          <div className="text-xs text-white/50">
                            {meta.desc}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <p className="mt-6 text-center font-script text-sm text-white/40">
              The portal closes when you click away. 🌀
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SummaryStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
      <div className="text-[10px] uppercase tracking-[0.15em] text-white/40">
        {label}
      </div>
      <div className="mt-1 font-display text-xl" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
