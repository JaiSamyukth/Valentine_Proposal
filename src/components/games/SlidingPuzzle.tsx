"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, playFlourish, vibrate } from "@/lib/sound";

interface Props {
  onWin: () => void;
}

const SIZE = 3;
const TOTAL = SIZE * SIZE; // 9 tiles, 8 + 1 empty

// The target image is a heart composed of unique emoji tiles.
// Each tile must be unique so the puzzle is unambiguously solvable.
const TARGET: string[] = [
  "💖", "💕", "💗",
  "💝", "❤️", "💞",
  "🌹", "✨", "💌",
];

function isSolvable(arr: number[]): boolean {
  let inversions = 0;
  const flat = arr.filter((n) => n !== TOTAL - 1);
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

function shuffle(): number[] {
  let arr: number[];
  do {
    arr = Array.from({ length: TOTAL }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr) || isSolved(arr));
  return arr;
}

function isSolved(arr: number[]): boolean {
  return arr.every((n, i) => n === i);
}

export function SlidingPuzzle({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [tiles, setTiles] = useState<number[]>(() => shuffle());
  const [moves, setMoves] = useState(0);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  useEffect(() => { onWinRef.current = onWin; });

  const solved = useMemo(() => isSolved(tiles), [tiles]);

  const emptyIndex = tiles.indexOf(TOTAL - 1);

  const canMove = (index: number) => {
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const eRow = Math.floor(emptyIndex / SIZE);
    const eCol = emptyIndex % SIZE;
    return Math.abs(row - eRow) + Math.abs(col - eCol) === 1;
  };

  const move = (index: number) => {
    if (solved || !canMove(index)) return;
    playPop();
    vibrate(12);
    setTiles((current) => {
      const next = [...current];
      [next[index], next[emptyIndex]] = [next[emptyIndex], next[index]];
      return next;
    });
    setMoves((m) => m + 1);
  };

  useEffect(() => {
    if (solved && !wonRef.current) {
      wonRef.current = true;
      addCollectable("diamond", 1);
      addCollectable("key", 1);
      playFlourish();
      vibrate([40, 60, 40]);
      setTimeout(() => onWinRef.current(), 1100);
    }
  }, [solved, addCollectable, onWin]);

  // Show a brief preview of the solved image at start, then shuffle
  const [previewing, setPreviewing] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setPreviewing(false);
      setTiles(shuffle());
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          Moves: <strong className="text-white">{moves}</strong>
        </span>
        <span className="rounded-full glass px-3 py-1">
          {solved ? "Solved! ❤️" : previewing ? "Memorize..." : "Slide tiles"}
        </span>
      </div>

      <div
        className="relative grid w-full max-w-xs touch-none select-none gap-1 rounded-2xl border border-white/10 bg-black/30 p-1"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
      >
        {(previewing ? Array.from({ length: TOTAL }, (_, i) => i) : tiles).map(
          (tile, index) => {
            const isEmpty = tile === TOTAL - 1 && !previewing;
            const movable = !previewing && !solved && canMove(index);
            return (
              <motion.button
                key={index}
                onClick={() => !previewing && move(index)}
                disabled={previewing || isEmpty}
                whileHover={movable ? { scale: 1.04 } : {}}
                whileTap={movable ? { scale: 0.96 } : {}}
                className={`relative flex aspect-square items-center justify-center rounded-xl text-2xl transition-all sm:text-3xl ${
                  isEmpty
                    ? "bg-transparent"
                    : movable
                    ? "bg-gradient-to-br from-[var(--rose-glow)]/30 to-[var(--gold)]/20 border border-[var(--rose-glow)]/40 cursor-pointer"
                    : "bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
                }`}
                style={{
                  filter:
                    solved && !isEmpty
                      ? "drop-shadow(0 0 8px rgba(255,94,138,0.7))"
                      : undefined,
                }}
                aria-label={isEmpty ? "empty tile" : `tile ${TARGET[tile]}`}
              >
                {!isEmpty && (
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="relative z-10"
                    style={{
                      filter: solved
                        ? "drop-shadow(0 0 6px rgba(255,209,102,0.6))"
                        : undefined,
                    }}
                  >
                    {TARGET[tile]}
                  </motion.span>
                )}
              </motion.button>
            );
          }
        )}

        {solved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,94,138,0.2), transparent 70%)",
            }}
          />
        )}
      </div>

      <p className="font-script text-sm text-white/50">
        Slide the tiles to reassemble the heart. Tap a tile next to the empty space.
      </p>
    </div>
  );
}
