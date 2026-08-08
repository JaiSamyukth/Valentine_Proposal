"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useExperience } from "@/lib/experience-store";
import { playChime, playFlourish, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "./FunnyPopups";

interface StarSpec {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const MOON_MESSAGES = [
  "The moon is listening.",
  "The moon winks back.",
  "The moon remembers your wish.",
  "The moon blushes.",
  "The moon whispers: yes.",
  "The moon is on your side.",
  "The moon has seen this coming.",
  "The moon bows.",
  "The moon smiles knowingly.",
  "The moon grants its blessing. 🌙",
];

/**
 * Interactive cosmic easter eggs:
 *  - A clickable moon in the top area (click 10 times for a blessing)
 *  - Scattered clickable twinkling stars (click for sparkles + collectable)
 *  - Hidden by default; appears during journey/question/finale.
 */
export function CosmicEasterEggs() {
  const phase = useExperience((s) => s.phase);
  const addCollectable = useExperience((s) => s.addCollectable);
  const unlock = useExperience((s) => s.unlockAchievement);
  const [moonClicks, setMoonClicks] = useState(0);
  const [moonMsg, setMoonMsg] = useState<string | null>(null);
  const [stars, setStars] = useState<StarSpec[]>([]);
  const [clickedStars, setClickedStars] = useState<Set<number>>(new Set());
  const moonMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // generate stars once per mount
  useEffect(() => {
    const specs: StarSpec[] = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 45,
      size: 10 + Math.random() * 10,
      delay: Math.random() * 3,
    }));
    setStars(specs);
  }, []);

  // hide during boot/setup
  if (phase === "boot" || phase === "setup") return null;

  const clickMoon = () => {
    const n = moonClicks + 1;
    setMoonClicks(n);
    playChime(400 + n * 40, 0.5);
    vibrate(20);
    setMoonMsg(MOON_MESSAGES[Math.min(n - 1, MOON_MESSAGES.length - 1)]);
    if (moonMsgTimer.current) clearTimeout(moonMsgTimer.current);
    moonMsgTimer.current = setTimeout(() => setMoonMsg(null), 2500);
    if (n === 10) {
      unlock("explorer");
      addCollectable("goldenHeart", 3);
      playFlourish();
      vibrate([60, 80, 60]);
      confetti({
        particleCount: 100,
        spread: 360,
        origin: { x: 0.5, y: 0.2 },
        shapes: ["🌙", "⭐", "✨"],
        scalar: 1.6,
      });
      triggerFunnyPopup("🌙 The moon has blessed you.");
    } else {
      triggerFunnyPopup(`Moon clicks: ${n}/10`);
    }
  };

  const clickStar = (id: number) => {
    if (clickedStars.has(id)) return;
    setClickedStars((s) => new Set([...s, id]));
    addCollectable("star", 1);
    addCollectable("sparkle", 2);
    playChime(1200 + Math.random() * 400, 0.3);
    vibrate(15);
    const spec = stars.find((s) => s.id === id);
    if (spec) {
      confetti({
        particleCount: 18,
        spread: 360,
        startVelocity: 12,
        origin: { x: spec.x / 100, y: spec.y / 100 },
        shapes: ["⭐", "✨"],
        scalar: 1.2,
        gravity: 0.3,
      });
    }
  };

  return (
    <>
      {/* Clickable moon — top center */}
      <motion.button
        onClick={clickMoon}
        aria-label="Click the moon"
        className="fixed left-1/2 top-16 z-[15] -translate-x-1/2 text-3xl sm:top-20 sm:text-4xl"
        whileHover={{ scale: 1.15, rotate: 8 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 16px rgba(255,229,180,0.7))" }}
      >
        🌙
      </motion.button>

      {/* Moon message bubble */}
      <AnimatePresence>
        {moonMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed left-1/2 top-28 z-[16] -translate-x-1/2 rounded-full glass-strong px-4 py-2 font-script text-sm text-[var(--gold)] sm:top-32"
          >
            {moonMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clickable twinkling stars */}
      {stars.map((spec) => (
        <motion.button
          key={spec.id}
          onClick={() => clickStar(spec.id)}
          aria-label="A twinkling star"
          className="fixed z-[15] cursor-pointer"
          style={{
            left: `${spec.x}%`,
            top: `${spec.y}%`,
            fontSize: spec.size,
            opacity: clickedStars.has(spec.id) ? 0.3 : 1,
          }}
          animate={{
            scale: clickedStars.has(spec.id) ? [1, 1.6, 0.2] : [0.8, 1.2, 0.8],
            opacity: clickedStars.has(spec.id)
              ? [1, 1, 0.2]
              : [0.3, 1, 0.3],
            rotate: clickedStars.has(spec.id) ? [0, 180, 360] : 0,
          }}
          transition={{
            duration: clickedStars.has(spec.id) ? 0.6 : 2 + spec.delay,
            repeat: clickedStars.has(spec.id) ? 0 : Infinity,
          }}
          whileHover={{ scale: 1.4 }}
          whileTap={{ scale: 0.7 }}
        >
          <span style={{ filter: "drop-shadow(0 0 6px rgba(255,255,200,0.8))" }}>
            ⭐
          </span>
        </motion.button>
      ))}

      {/* Moon click counter (subtle) */}
      {moonClicks > 0 && moonClicks < 10 && (
        <div className="fixed left-1/2 top-12 z-[14] -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-white/30 sm:top-16">
          🌙 ×{moonClicks}
        </div>
      )}
    </>
  );
}
