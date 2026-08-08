"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal } from "lucide-react";
import confetti from "canvas-confetti";
import { useExperience } from "@/lib/experience-store";
import { ACHIEVEMENT_META } from "@/lib/content";
import { playChime, playFlourish, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "./FunnyPopups";

const CLICKS_TO_UNLOCK = 5;

/**
 * A tiny pulsing dot in the corner. Click it 5 times to open the Developer Room —
 * a secret behind-the-scenes panel showing the experience's "stats" and credits.
 */
export function DeveloperRoom() {
  const phase = useExperience((s) => s.phase);
  const collectables = useExperience((s) => s.collectables);
  const achievements = useExperience((s) => s.achievements);
  const settings = useExperience((s) => s.settings);
  const [clicks, setClicks] = useState(0);
  const [open, setOpen] = useState(false);
  const lastClickRef = useRef(0);

  // reset clicks after 2s of inactivity
  useEffect(() => {
    if (clicks === 0) return;
    const t = setTimeout(() => setClicks(0), 2000);
    return () => clearTimeout(t);
  }, [clicks]);

  if (phase === "boot" || phase === "setup") return null;

  const click = () => {
    const now = performance.now();
    if (now - lastClickRef.current > 2000) setClicks(0);
    lastClickRef.current = now;
    const n = clicks + 1;
    setClicks(n);
    playChime(500 + n * 80, 0.2);
    vibrate(15);
    if (n >= CLICKS_TO_UNLOCK) {
      setOpen(true);
      setClicks(0);
      playFlourish();
      vibrate([40, 60, 40]);
      confetti({
        particleCount: 100,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        shapes: ["🎮", "✨", "💖"],
        scalar: 1.4,
      });
      triggerFunnyPopup("🎮 You found the developer room.");
    }
  };

  const totalCollectables = Object.values(collectables).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* The hidden trigger — a tiny pulsing dot in the bottom-left corner */}
      <button
        onClick={click}
        aria-label="A mysterious dot"
        className="group fixed bottom-4 left-4 z-[85] flex h-6 w-6 items-center justify-center sm:bottom-6 sm:left-6"
      >
        <motion.span
          className="block h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ filter: "drop-shadow(0 0 6px rgba(255,209,102,0.8))" }}
        />
        {clicks > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-[var(--gold)] px-1 text-[8px] font-bold text-black">
            {clicks}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, rotateX: 15 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl glass-strong p-6"
              style={{ transformPerspective: 1000 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close developer room"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-[var(--gold)]" />
                <h2 className="font-display text-2xl gradient-text-gold">
                  Developer Room
                </h2>
              </div>

              <p className="mb-5 font-script text-sm text-white/60">
                You found the hidden room. Here's a peek behind the curtain.
              </p>

              {/* Stats grid */}
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Phase" value={phase} />
                <Stat label="Collectables" value={String(totalCollectables)} />
                <Stat label="Achievements" value={`${achievements.length}/${Object.keys(ACHIEVEMENT_META).length}`} />
                <Stat label="Sender" value={settings.senderName || "—"} />
                <Stat label="Receiver" value={settings.receiverName || "—"} />
                <Stat label="Theme" value={settings.theme} />
              </div>

              {/* Achievements list */}
              <div className="mb-5">
                <div className="mb-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  Achievements earned
                </div>
                <div className="flex flex-wrap gap-2">
                  {achievements.length === 0 ? (
                    <span className="text-sm text-white/40">None yet — keep exploring.</span>
                  ) : (
                    achievements.map((a) => (
                      <span
                        key={a}
                        className="flex items-center gap-1 rounded-full bg-[var(--gold)]/10 px-2.5 py-1 text-xs text-[var(--gold)]"
                      >
                        {ACHIEVEMENT_META[a]?.emoji} {ACHIEVEMENT_META[a]?.label}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Secret commands hint */}
              <div className="mb-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.25em] text-[var(--rose-glow)]">
                  Secret commands (type anywhere)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["love", "flowers", "cat", "galaxy", "magic", "moon", "dance", "snow"].map((cmd) => (
                    <code
                      key={cmd}
                      className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-white/70"
                    >
                      {cmd}
                    </code>
                  ))}
                </div>
              </div>

              {/* Credits */}
              <div className="border-t border-white/10 pt-4 text-center">
                <p className="font-script text-sm text-white/50">
                  Crafted with care, one frame at a time.
                </p>
                <p className="mt-1 text-[11px] text-white/30">
                  Try the Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </div>
      <div className="mt-0.5 truncate font-display text-sm text-white" title={value}>
        {value}
      </div>
    </div>
  );
}
