"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, vibrate } from "@/lib/sound";

interface Mole {
  id: number;
  hole: number;
  emoji: string;
  golden: boolean;
  born: number;
  ttl: number;
}

const HOLES = 9; // 3x3 grid
const WIN_TARGET = 12;
const EMOJIS = ["❤️", "💖", "💕", "💗", "💝"];

interface Props {
  onWin: () => void;
}

export function WhackAHeart({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const idRef = useRef(0);
  const wonRef = useRef(false);

  const spawn = useCallback(() => {
    setMoles((current) => {
      // don't overcrowd
      if (current.length >= 4) return current;
      const occupied = new Set(current.map((m) => m.hole));
      let hole = Math.floor(Math.random() * HOLES);
      let tries = 0;
      while (occupied.has(hole) && tries < 10) {
        hole = Math.floor(Math.random() * HOLES);
        tries++;
      }
      if (occupied.has(hole)) return current;
      const golden = Math.random() < 0.12;
      const mole: Mole = {
        id: idRef.current++,
        hole,
        emoji: golden ? "💛" : EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        golden,
        born: performance.now(),
        ttl: golden ? 1100 : 1400,
      };
      return [...current, mole];
    });
  }, []);

  useEffect(() => {
    const spawnInt = setInterval(spawn, 700);
    return () => clearInterval(spawnInt);
  }, [spawn]);

  // Expire moles that have lived past their ttl
  useEffect(() => {
    const expire = setInterval(() => {
      const now = performance.now();
      setMoles((current) => {
        const survivors: Mole[] = [];
        let addMissed = 0;
        for (const m of current) {
          if (now - m.born > m.ttl) {
            addMissed++;
          } else {
            survivors.push(m);
          }
        }
        if (addMissed) setMissed((x) => x + addMissed);
        return survivors;
      });
    }, 150);
    return () => clearInterval(expire);
  }, []);

  useEffect(() => {
    if (score >= WIN_TARGET && !wonRef.current) {
      wonRef.current = true;
      setTimeout(() => onWin(), 600);
    }
  }, [score, onWin]);

  const whack = (id: number) => {
    const mole = moles.find((m) => m.id === id);
    if (!mole) return;
    const points = mole.golden ? 3 : 1;
    setScore((s) => s + points);
    if (mole.golden) addCollectable("goldenHeart", 1);
    else addCollectable("heart", 1);
    playChime(mole.golden ? 1300 : 900, 0.3);
    vibrate(mole.golden ? 30 : 15);
    setMoles((current) => current.filter((m) => m.id !== id));
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          🔨 Whacked: <strong className="text-white">{score}</strong> / {WIN_TARGET}
        </span>
        <span className="rounded-full glass px-3 py-1">
          Missed: {missed}
        </span>
      </div>

      <div className="grid w-full max-w-md grid-cols-3 gap-3">
        {Array.from({ length: HOLES }, (_, i) => {
          const mole = moles.find((m) => m.hole === i);
          return (
            <button
              key={i}
              onClick={() => mole && whack(mole.id)}
              className="relative flex aspect-square items-end justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#3a1a2e]/60 to-[#1a0f1a]/80"
              aria-label={mole ? `Whack ${mole.emoji}` : "empty hole"}
            >
              {/* hole shadow */}
              <div className="absolute bottom-2 h-3 w-3/4 rounded-[50%] bg-black/50 blur-sm" />
              <AnimatePresence>
                {mole && (
                  <motion.div
                    key={mole.id}
                    initial={{ y: "100%", scale: 0.6 }}
                    animate={{ y: "10%", scale: 1 }}
                    exit={{ y: "120%", scale: 0.5, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 18,
                    }}
                    className="relative z-10 text-3xl"
                    style={{
                      filter: mole.golden
                        ? "drop-shadow(0 0 10px rgba(255,209,102,0.9))"
                        : "drop-shadow(0 0 6px rgba(255,94,138,0.6))",
                    }}
                  >
                    {mole.emoji}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <p className="font-script text-sm text-white/50">
        Tap the hearts before they hide again. Golden hearts count triple. 💛
      </p>
    </div>
  );
}
