"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "./FunnyPopups";

const RETRO_MESSAGES = [
  "Entering 8-bit mode...",
  "Loading pixel hearts...",
  "Press start to continue.",
  "Now playing: Love (NES edition)",
];

/**
 * A rare chaos event (~6% chance, once per session) that briefly transforms
 * the entire site into a pixelated retro game mode with scanlines, a pixel
 * font, and a "PRESS START" overlay.
 */
export function RetroChaosMode() {
  const phase = useExperience((s) => s.phase);
  const [active, setActive] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (phase !== "journey" && phase !== "question") return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    if (Math.random() > 0.06) return; // 6% chance
    const delay = 12000 + Math.random() * 18000;
    const t = setTimeout(() => {
      setActive(true);
      vibrate([30, 20, 30, 20, 30]);
      playChime(200, 0.8);
    }, delay);
    return () => clearTimeout(t);
  }, [phase]);

  // cycle through retro messages
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % RETRO_MESSAGES.length);
      playPop();
    }, 900);
    // auto-dismiss after ~5s
    const dismiss = setTimeout(() => {
      setActive(false);
      triggerFunnyPopup("Returning to high-def romance. 🎮");
    }, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(dismiss);
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="retro-scanlines pointer-events-none fixed inset-0 z-[135]"
          style={{
            imageRendering: "pixelated",
          }}
        >
          {/* pixelation overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-conic-gradient(rgba(0,0,0,0.18) 0% 25%, transparent 0% 50%) 0 / 6px 6px",
              mixBlendMode: "multiply",
            }}
          />
          {/* color shift */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,94,138,0.08), rgba(122,231,255,0.06))",
              mixBlendMode: "screen",
            }}
          />

          {/* retro HUD banner */}
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="absolute left-1/2 top-20 -translate-x-1/2"
          >
            <div
              className="border-2 border-[var(--gold)] bg-black px-6 py-3 text-center"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                boxShadow: "0 0 0 4px black, 0 0 20px rgba(255,209,102,0.6)",
              }}
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">
                ★ 8-BIT MODE ★
              </div>
              <motion.div
                key={msgIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-sm text-[var(--rose-glow)]"
                style={{ textShadow: "2px 2px 0 black" }}
              >
                {RETRO_MESSAGES[msgIndex]}
              </motion.div>
            </div>
          </motion.div>

          {/* blinking PRESS START */}
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <span
              className="text-lg font-bold text-white"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                textShadow: "3px 3px 0 black, -1px -1px 0 var(--rose-glow)",
                letterSpacing: "0.15em",
              }}
            >
              ▶ PRESS START
            </span>
          </motion.div>

          {/* corner score display */}
          <div
            className="absolute left-4 top-4 text-xs text-[var(--gold)]"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              textShadow: "2px 2px 0 black",
            }}
          >
            <div>1UP</div>
            <div className="text-white">♥ × ∞</div>
          </div>
          <div
            className="absolute right-4 top-4 text-right text-xs text-[var(--gold)]"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              textShadow: "2px 2px 0 black",
            }}
          >
            <div>HI-SCORE</div>
            <div className="text-white">999999</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
