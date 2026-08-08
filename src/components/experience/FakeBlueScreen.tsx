"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "./FunnyPopups";

const BSOD_LINES = [
  "A problem has been detected and Love has shut down.",
  "",
  "LOVE_STOP: 0x0000CUP1D (0xHEART, 0xAFFECTION, 0xFOREVER)",
  "",
  "The system encountered an unexpected surge of feelings and needs to",
  "pause for a moment of gratitude.",
  "",
  "Collecting information:",
  "  ❤️ 100% complete",
  "",
  "If this is the first time you've felt this, don't worry —",
  "it's supposed to happen.",
  "",
  "Press any key (or wait) to restart Love.",
];

/**
 * A rare chaos event (~4% chance, once per session) that briefly fakes a
 * Windows-style Blue Screen of Death, but themed around love crashing.
 * Auto-dismisses after ~5s.
 */
export function FakeBlueScreen() {
  const phase = useExperience((s) => s.phase);
  const [active, setActive] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (phase !== "journey" && phase !== "question") return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    if (Math.random() > 0.04) return; // 4% chance
    const delay = 18000 + Math.random() * 20000;
    const t = setTimeout(() => {
      setActive(true);
      vibrate([80, 40, 80]);
      playChime(120, 1.5);
    }, delay);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (!active) return;
    const dismiss = setTimeout(() => {
      setActive(false);
      triggerFunnyPopup("Love restarted successfully. 💖");
    }, 5000);
    const onKey = () => {
      setActive(false);
      triggerFunnyPopup("Love restarted successfully. 💖");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(dismiss);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[142] flex flex-col items-center justify-center p-6"
          style={{ background: "#0078d4", fontFamily: "var(--font-geist-mono), monospace" }}
        >
          <div className="max-w-xl text-white">
            <div className="mb-6 text-7xl">:(</div>
            <div className="space-y-1 text-sm leading-relaxed">
              {BSOD_LINES.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className={line === "" ? "h-3" : ""}
                >
                  {line}
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: BSOD_LINES.length * 0.12 + 0.3 }}
              className="mt-8 flex items-center gap-3"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="text-sm">0% restarting Love...</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
