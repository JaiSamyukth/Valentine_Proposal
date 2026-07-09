"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, playFlourish, vibrate } from "@/lib/sound";

interface Props {
  onWin: () => void;
}

const GRID = 25; // 5x5
const TOTAL_DIGS_ALLOWED = 12;

// Rewards hidden in the sand
type Reward =
  | { kind: "chest"; emoji: "🗝️" }
  | { kind: "coin"; emoji: "🪙" }
  | { kind: "rose"; emoji: "🌹" }
  | { kind: "shell"; emoji: "🐚" }
  | { kind: "pearl"; emoji: "🫧" }
  | { kind: "empty"; emoji: "⬜" };

const REWARDS: Reward[] = (() => {
  const arr: Reward[] = [];
  // 1 chest (the goal), 3 coins, 3 roses, 2 shells, 2 pearls, rest empty
  arr.push({ kind: "chest", emoji: "🗝️" });
  for (let i = 0; i < 3; i++) arr.push({ kind: "coin", emoji: "🪙" });
  for (let i = 0; i < 3; i++) arr.push({ kind: "rose", emoji: "🌹" });
  for (let i = 0; i < 2; i++) arr.push({ kind: "shell", emoji: "🐚" });
  for (let i = 0; i < 2; i++) arr.push({ kind: "pearl", emoji: "🫧" });
  while (arr.length < GRID) arr.push({ kind: "empty", emoji: "⬜" });
  // shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
})();

const COLS = 5;
const CHEST_INDEX = REWARDS.findIndex((r) => r.kind === "chest");

function manhattan(a: number, b: number): number {
  return (
    Math.abs(Math.floor(a / COLS) - Math.floor(b / COLS)) +
    Math.abs((a % COLS) - (b % COLS))
  );
}

function hintFor(dist: number): string {
  if (dist === 0) return "You found it! 🗝️";
  if (dist <= 1) return "Burning hot! The chest is right next to this. 🔥";
  if (dist <= 2) return "Very warm. You're close. 🌡️";
  if (dist <= 3) return "Getting warmer... 🌤️";
  if (dist <= 4) return "Cool. A few steps away. ❄️";
  return "Cold. The chest is far from here. 🧊";
}

export function TreasureHunt({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [dug, setDug] = useState<boolean[]>(() => Array(GRID).fill(false));
  const [found, setFound] = useState(false);
  const [digsLeft, setDigsLeft] = useState(TOTAL_DIGS_ALLOWED);
  const [hint, setHint] = useState<string>("");
  const wonRef = useRef(false);

  const rewardAt = useMemo(() => REWARDS, []);

  const dig = (i: number) => {
    if (found || dug[i] || digsLeft <= 0) return;
    playPop();
    vibrate(15);
    setDug((d) => {
      const n = [...d];
      n[i] = true;
      return n;
    });
    const r = rewardAt[i];
    if (r.kind === "chest") {
      setFound(true);
      setHint(hintFor(0));
      addCollectable("key", 2);
      addCollectable("diamond", 1);
      addCollectable("coin", 5);
      playFlourish();
      vibrate([60, 80, 60]);
      setTimeout(() => onWin(), 1300);
    } else {
      // grant reward + consume a dig
      setDigsLeft((d) => d - 1);
      // distance hint
      setHint(hintFor(manhattan(i, CHEST_INDEX)));
      if (r.kind === "coin") {
        addCollectable("coin", 2);
        playChime(900, 0.3);
      } else if (r.kind === "rose") {
        addCollectable("rose", 1);
        playChime(800, 0.3);
      } else if (r.kind === "shell") {
        addCollectable("sparkle", 2);
        playChime(700, 0.3);
      } else if (r.kind === "pearl") {
        addCollectable("star", 2);
        playChime(1000, 0.3);
      } else {
        playChime(400, 0.2);
      }
    }
  };

  const reset = () => {
    setDug(Array(GRID).fill(false));
    setFound(false);
    setDigsLeft(TOTAL_DIGS_ALLOWED);
    setHint("");
    wonRef.current = false;
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          ⛏️ Digs left: <strong className="text-white">{found ? "✓" : digsLeft}</strong>
        </span>
        <span className="rounded-full glass px-3 py-1">
          {found ? "Treasure found! 🗝️" : "Find the key..."}
        </span>
      </div>

      <p className="font-script text-base text-white/70">
        A treasure chest is buried somewhere in the sand. Dig carefully — you only have {TOTAL_DIGS_ALLOWED} tries before the tide comes in.
      </p>

      {/* Hint display */}
      {hint && !found && (
        <motion.div
          key={hint}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            hint.includes("hot") || hint.includes("warm")
              ? "bg-[var(--rose-glow)]/15 text-[var(--rose-glow)]"
              : hint.includes("Cool") || hint.includes("Cold")
              ? "bg-[var(--aurora)]/15 text-[var(--aurora)]"
              : "glass text-white/70"
          }`}
        >
          {hint}
        </motion.div>
      )}

      <div className="grid w-full max-w-md grid-cols-5 gap-2">
        {rewardAt.map((r, i) => {
          const isDug = dug[i];
          const isChest = r.kind === "chest";
          return (
            <motion.button
              key={i}
              onClick={() => dig(i)}
              disabled={isDug || found || digsLeft <= 0}
              whileHover={!isDug && !found ? { scale: 1.06 } : {}}
              whileTap={!isDug && !found ? { scale: 0.92 } : {}}
              className={`relative flex aspect-square items-center justify-center rounded-xl border text-xl transition-all ${
                isDug
                  ? isChest
                    ? "border-[var(--gold)] bg-[var(--gold)]/20 glow-gold"
                    : r.kind === "empty"
                    ? "border-white/5 bg-white/[0.02] opacity-50"
                    : "border-[var(--rose-glow)]/30 bg-[var(--rose-glow)]/10"
                  : "border-white/15 bg-gradient-to-br from-[#c9a06a]/30 to-[#8b6a3a]/30 hover:border-[var(--gold)]/50"
              }`}
              style={{
                filter:
                  isDug && isChest
                    ? "drop-shadow(0 0 14px rgba(255,209,102,0.9))"
                    : undefined,
              }}
              aria-label={isDug ? `revealed ${r.emoji}` : "sand tile"}
            >
              {isDug ? (
                <motion.span
                  initial={{ scale: 0, rotate: -30, y: -8 }}
                  animate={{ scale: 1, rotate: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}
                >
                  {r.emoji}
                </motion.span>
              ) : (
                <span className="text-xs text-white/30">·</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {found && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-script text-lg text-[var(--gold)]"
        >
          You found the treasure — a key to my heart. 🗝️💎
        </motion.div>
      )}

      {!found && digsLeft <= 0 && (
        <div className="text-center">
          <p className="font-script text-base text-[var(--rose-glow)]">
            The tide came in... but the treasure waits for those who persist.
          </p>
          <button
            onClick={reset}
            className="mt-2 rounded-full border border-[var(--rose-glow)]/40 bg-[var(--rose-glow)]/10 px-4 py-1.5 text-sm text-[var(--rose-glow)] hover:bg-[var(--rose-glow)]/20"
          >
            try again ↺
          </button>
        </div>
      )}
    </div>
  );
}
