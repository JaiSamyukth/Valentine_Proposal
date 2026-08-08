"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "./FunnyPopups";

/**
 * A rare chaos event (~5% chance, once per session) that briefly reverses
 * gravity — all the floating particles and hearts on screen flip upward,
 * the whole page rotates 180°, and a "GRAVITY REVERSED" banner appears.
 * Lasts ~4 seconds.
 */
export function GravityFlipChaos() {
  const phase = useExperience((s) => s.phase);
  const [active, setActive] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (phase !== "journey" && phase !== "question") return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    if (Math.random() > 0.05) return; // 5% chance
    const delay = 15000 + Math.random() * 20000;
    const t = setTimeout(() => {
      setActive(true);
      vibrate([40, 30, 40, 30, 60]);
      playChime(150, 1.2);
    }, delay);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (!active) return;
    const dismiss = setTimeout(() => {
      setActive(false);
      triggerFunnyPopup("Gravity restored. 💫");
    }, 4000);
    return () => clearTimeout(dismiss);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[138]"
        >
          {/* The gravity-flip effect: rotate the whole page via a class on body */}
          <style>{`
            body { transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform: rotate(180deg); }
          `}</style>

          {/* Banner */}
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="absolute left-1/2 top-20 -translate-x-1/2"
          >
            <div
              className="border-2 border-[var(--aurora)] bg-black px-6 py-3 text-center"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                boxShadow: "0 0 0 4px black, 0 0 24px rgba(122,231,255,0.7)",
              }}
            >
              <motion.div
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="text-[10px] uppercase tracking-[0.3em] text-[var(--aurora)]"
              >
                ⚠ GRAVITY REVERSED ⚠
              </motion.div>
              <div
                className="mt-1 text-sm text-white"
                style={{ textShadow: "2px 2px 0 black" }}
              >
                everything is falling up...
              </div>
            </div>
          </motion.div>

          {/* Floating "up" arrows */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl text-[var(--aurora)]"
              style={{ left: `${10 + i * 12}%`, bottom: "10%" }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -window.innerHeight * 0.7, opacity: [0, 1, 0] }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            >
              ↑
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
