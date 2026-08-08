"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, vibrate } from "@/lib/sound";

/**
 * Dynamic personalization: the receiver's name appears as a constellation
 * of glowing stars that briefly fades in and out at random moments during
 * the journey. This creates the magical "the website knows who I am" feeling.
 */
export function NameInStars() {
  const phase = useExperience((s) => s.phase);
  const receiverName = useExperience((s) => s.settings.receiverName);
  const [active, setActive] = useState(false);
  const triggeredRef = useRef(false);

  // Trigger once per mount, after a delay, during the journey or question
  useEffect(() => {
    if (phase !== "journey" && phase !== "question") return;
    if (triggeredRef.current) return;
    if (!receiverName || receiverName.length < 2) return;
    triggeredRef.current = true;

    // Random delay between 15-40s into the journey
    const delay = 15000 + Math.random() * 25000;
    const t = setTimeout(() => {
      setActive(true);
      playChime(900, 0.8);
      vibrate(20);
      // Auto-hide after 5s
      setTimeout(() => setActive(false), 5000);
    }, delay);
    return () => clearTimeout(t);
  }, [phase, receiverName]);

  if (!receiverName || receiverName.length < 2) return null;

  // Render the name as individual glowing letter-stars
  const letters = receiverName.toUpperCase().slice(0, 12).split("");

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="pointer-events-none fixed inset-0 z-[18] flex items-center justify-center"
        >
          <div className="flex gap-2 sm:gap-4">
            {letters.map((letter, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, y: -20 }}
                animate={{
                  opacity: [0, 1, 1, 0.8],
                  scale: [0, 1.2, 1, 1],
                  y: 0,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.15,
                  times: [0, 0.3, 0.7, 1],
                }}
                className="relative font-display text-5xl sm:text-7xl"
                style={{
                  color: "transparent",
                  textShadow:
                    "0 0 20px rgba(255,209,102,0.9), 0 0 40px rgba(255,209,102,0.5), 0 0 80px rgba(255,94,138,0.3)",
                  WebkitTextStroke: "1px rgba(255,229,180,0.9)",
                }}
              >
                {letter}
                {/* Twinkling star sparkle on each letter */}
                <motion.span
                  className="absolute -right-1 -top-1 text-xs"
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  ✨
                </motion.span>
              </motion.div>
            ))}
          </div>
          {/* Subtle glow underneath */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,209,102,0.08), transparent 70%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
