"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "./FunnyPopups";

type Line = { text: string; status?: "ok" | "warn" | "err" | "info" };

const BOOT_SEQUENCE: Line[] = [
  { text: "LoveOS v3.14.15 booting...", status: "info" },
  { text: "Loading kernel modules... [ romance.ko ]", status: "ok" },
  { text: "Mounting /heart", status: "ok" },
  { text: "Compiling butterflies............ done", status: "ok" },
  { text: "Downloading memories............ done", status: "ok" },
  { text: "Scanning courage................ 100%", status: "ok" },
  { text: "Installing happiness............ done", status: "ok" },
  { text: "Checking compatibility.........", status: "info" },
  { text: "WARNING: Too much cuteness detected.", status: "warn" },
  { text: "Attempting to contain feelings...", status: "info" },
  { text: "Feelings overflow buffer. This is fine. 🔥", status: "warn" },
  { text: "ERROR 404: Cold heart not found.", status: "err" },
  { text: "Continuing anyway? [Y/y] yes.", status: "ok" },
  { text: "LoveOS ready. Welcome back, you.", status: "info" },
];

export function LoveOSOverlay() {
  const phase = useExperience((s) => s.phase);
  const [active, setActive] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [done, setDone] = useState(false);
  const triggeredRef = useRef(false);

  // Random trigger: ~8% chance after journey starts, once per session.
  useEffect(() => {
    if (phase !== "journey" && phase !== "question") return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    const roll = Math.random();
    if (roll > 0.12) return; // 12% chance
    const delay = 8000 + Math.random() * 15000;
    const t = setTimeout(() => {
      setActive(true);
      vibrate([40, 30, 40]);
    }, delay);
    return () => clearTimeout(t);
  }, [phase]);

  // Reveal boot lines one by one
  useEffect(() => {
    if (!active) return;
    setLines([]);
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= BOOT_SEQUENCE.length) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 600);
        return;
      }
      setLines((l) => [...l, BOOT_SEQUENCE[i]]);
      playChime(300 + i * 20, 0.08);
      i++;
    }, 280);
    return () => clearInterval(interval);
  }, [active]);

  const dismiss = () => {
    setActive(false);
    setLines([]);
    setDone(false);
    triggerFunnyPopup("LoveOS resumed. You're still adored. 💖");
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 p-4 font-mono"
        >
          {/* CRT scanlines */}
          <div className="retro-scanlines absolute inset-0" />

          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="relative w-full max-w-lg overflow-hidden rounded-lg border border-[var(--rose-glow)]/40 bg-[#0a0408] shadow-2xl glow-rose"
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-[var(--rose-glow)]/10 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--rose-glow)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--gold)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--aurora)]" />
              <span className="ml-2 text-xs uppercase tracking-[0.2em] text-white/60">
                LoveOS — boot sequence
              </span>
            </div>

            {/* Terminal body */}
            <div className="h-[320px] overflow-y-auto p-4 text-xs leading-relaxed text-green-300/90 sm:text-sm">
              {lines.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <span
                    className={
                      l.status === "ok"
                        ? "text-[var(--aurora)]"
                        : l.status === "warn"
                        ? "text-[var(--gold)]"
                        : l.status === "err"
                        ? "text-[var(--rose-glow)]"
                        : "text-white/60"
                    }
                  >
                    {l.status === "ok"
                      ? "[ OK ]"
                      : l.status === "warn"
                      ? "[WARN]"
                      : l.status === "err"
                      ? "[ERR ]"
                      : "[....]"}
                  </span>
                  <span className="text-white/80">{l.text}</span>
                </motion.div>
              ))}
              <span className="inline-block h-3.5 w-2 animate-pulse bg-green-400 align-middle" />
            </div>

            {/* Continue button (appears when done) */}
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-white/10 bg-[var(--rose-glow)]/5 p-4"
              >
                <p className="mb-3 text-center font-script text-sm text-[var(--gold)]">
                  Too much cuteness detected.
                  <br />
                  Continue anyway?
                </p>
                <motion.button
                  onClick={dismiss}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="mx-auto block rounded-full bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] px-8 py-2 font-display text-sm text-black glow-rose"
                >
                  YES 💖
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
