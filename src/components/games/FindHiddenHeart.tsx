"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, vibrate } from "@/lib/sound";

interface Props {
  onWin: () => void;
}

const POOL = ["🌸", "✨", "🌙", "⭐", "💫", "🦋", "🌷", "🍀", "☁️"];

export function FindHiddenHeart({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const unlock = useExperience((s) => s.unlockAchievement);
  const wonRef = useRef(false);

  // Generate a stable grid: 24 tiles, one hidden heart at a random spot
  const { tiles, heartIndex } = useMemo(() => {
    const total = 24;
    const heart = Math.floor(Math.random() * total);
    const tiles = Array.from({ length: total }, (_, i) =>
      i === heart ? "❤️" : POOL[Math.floor(Math.random() * POOL.length)]
    );
    return { tiles, heartIndex: heart };
  }, []);

  const [revealed, setRevealed] = useState<boolean[]>(
    Array(tiles.length).fill(false)
  );
  const [found, setFound] = useState(false);
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState<string>("");

  const click = (i: number) => {
    if (found) return;
    if (revealed[i]) return;
    playPop();
    setTries((t) => t + 1);
    setRevealed((r) => {
      const n = [...r];
      n[i] = true;
      return n;
    });
    if (i === heartIndex) {
      setFound(true);
      addCollectable("heart", 3);
      addCollectable("key", 1);
      unlock("hiddenFinder");
      playChime(1200, 0.6);
      vibrate([40, 60, 40]);
      setTimeout(onWin, 1200);
    } else {
      // distance hint
      const dx = Math.abs((i % 6) - (heartIndex % 6));
      const dy = Math.abs(Math.floor(i / 6) - Math.floor(heartIndex / 6));
      const dist = dx + dy;
      if (dist <= 1) setHint("Burning hot! 🔥");
      else if (dist <= 3) setHint("Getting warmer... 🌡️");
      else setHint("Cold. ❄️");
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          Tries: <strong className="text-white">{tries}</strong>
        </span>
        <span className="rounded-full glass px-3 py-1">
          {found ? "Found it! ❤️" : "Searching..."}
        </span>
      </div>

      <p className="font-script text-base text-white/70">
        Somewhere among these, one true heart is hiding. Find it.
      </p>

      <motion.div
        animate={
          hint.includes("hot")
            ? { scale: [1, 1.05, 1] }
            : hint.includes("warmer")
            ? { x: [0, 2, -2, 0] }
            : {}
        }
        transition={{ duration: 0.4 }}
        className="h-6 text-sm font-medium text-[var(--gold)]"
      >
        {hint}
      </motion.div>

      <div className="grid w-full max-w-md grid-cols-6 gap-2">
        {tiles.map((tile, i) => (
          <motion.button
            key={i}
            onClick={() => click(i)}
            whileHover={{ scale: revealed[i] ? 1 : 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`flex aspect-square items-center justify-center rounded-xl border text-2xl transition-all ${
              revealed[i]
                ? i === heartIndex
                  ? "border-[var(--rose-glow)] bg-[var(--rose-glow)]/20 glow-rose"
                  : "border-white/10 bg-white/5 opacity-50"
                : "border-white/15 bg-gradient-to-br from-white/10 to-white/5 hover:border-[var(--rose-glow)]/50"
            }`}
            style={{
              filter:
                revealed[i] && i === heartIndex
                  ? "drop-shadow(0 0 12px rgba(255,94,138,0.9))"
                  : undefined,
            }}
          >
            {revealed[i] ? (
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {tile}
              </motion.span>
            ) : (
              <span className="text-white/30">?</span>
            )}
          </motion.button>
        ))}
      </div>

      {found && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-script text-lg text-[var(--gold)]"
        >
          You found the heart — and a magic key. 🗝️
        </motion.p>
      )}
    </div>
  );
}
