"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, playFlourish, vibrate } from "@/lib/sound";
import { cn } from "@/lib/utils";

const SYMBOLS = ["❤️", "🌹", "💌", "🌙", "🦋", "✨"];

interface Card {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryMatch({ onWin }: { onWin: () => void }) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const unlock = useExperience((s) => s.unlockAchievement);
  const [cards, setCards] = useState<Card[]>(() =>
    shuffle([...SYMBOLS, ...SYMBOLS]).map((symbol, id) => ({
      id,
      symbol,
      flipped: false,
      matched: false,
    }))
  );
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  useEffect(() => { onWinRef.current = onWin; });

  const matchedCount = useMemo(
    () => cards.filter((c) => c.matched).length,
    [cards]
  );

  const flip = (id: number) => {
    if (locked) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    playPop();
    const next = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const newPicked = [...picked, id];
    setCards(next);
    setPicked(newPicked);

    if (newPicked.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newPicked;
      if (next[a].symbol === next[b].symbol) {
        setTimeout(() => {
          setCards((cs) =>
            cs.map((c) =>
              c.id === a || c.id === b ? { ...c, matched: true } : c
            )
          );
          addCollectable("note", 1);
          playChime(900, 0.4);
          vibrate(20);
          setPicked([]);
          setLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((cs) =>
            cs.map((c) =>
              c.id === a || c.id === b ? { ...c, flipped: false } : c
            )
          );
          setPicked([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  useEffect(() => {
    if (matchedCount === cards.length && !wonRef.current) {
      wonRef.current = true;
      unlock("memoryMaster");
      playFlourish();
      vibrate([40, 50, 40]);
      setTimeout(() => onWinRef.current(), 900);
    }
  }, [matchedCount, cards.length, onWin, unlock]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          Moves: <strong className="text-white">{moves}</strong>
        </span>
        <span className="rounded-full glass px-3 py-1">
          Pairs: <strong className="text-white">{matchedCount / 2}</strong> /{" "}
          {SYMBOLS.length}
        </span>
      </div>

      <div className="grid w-full max-w-md grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flip(card.id)}
            className="aspect-square"
            aria-label={card.flipped || card.matched ? card.symbol : "hidden card"}
          >
            <motion.div
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-white/40">?</span>
              </div>
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-2xl border text-3xl",
                  card.matched
                    ? "border-[var(--gold)] bg-[var(--gold)]/15 glow-gold"
                    : "border-[var(--rose-glow)]/40 bg-[var(--rose-glow)]/10"
                )}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {card.symbol}
              </div>
            </motion.div>
          </button>
        ))}
      </div>

      <p className="font-script text-sm text-white/50">
        Match every pair of hearts and roses.
      </p>
    </div>
  );
}

