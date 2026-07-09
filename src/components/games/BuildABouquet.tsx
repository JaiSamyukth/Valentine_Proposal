"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, playFlourish, vibrate } from "@/lib/sound";

interface Flower {
  id: number;
  emoji: string;
  color: string;
  collected: boolean;
}

const FLOWER_POOL = [
  { emoji: "🌹", color: "#e11d48", collect: "rose" as const },
  { emoji: "🌷", color: "#ff5e8a", collect: "flower" as const },
  { emoji: "🌸", color: "#ffb3c6", collect: "flower" as const },
  { emoji: "🌺", color: "#ff8e72", collect: "flower" as const },
  { emoji: "🌻", color: "#ffd166", collect: "flower" as const },
  { emoji: "💐", color: "#ff5e8a", collect: "flower" as const },
  { emoji: "🪻", color: "#c4a8ff", collect: "flower" as const },
  { emoji: "🏵️", color: "#ffd166", collect: "flower" as const },
];

const TARGET = 6;

interface Props {
  onWin: () => void;
}

export function BuildABouquet({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [bouquet, setBouquet] = useState<Flower[]>([]);
  const idRef = useRef(0);
  const wonRef = useRef(false);

  // spawn a fresh garden
  useEffect(() => {
    const initial: Flower[] = Array.from({ length: 12 }, () => {
      const pick = FLOWER_POOL[Math.floor(Math.random() * FLOWER_POOL.length)];
      return {
        id: idRef.current++,
        emoji: pick.emoji,
        color: pick.color,
        collected: false,
      };
    });
    setFlowers(initial);
  }, []);

  useEffect(() => {
    if (bouquet.length >= TARGET && !wonRef.current) {
      wonRef.current = true;
      addCollectable("rose", 3);
      addCollectable("flower", 5);
      playFlourish();
      vibrate([40, 60, 40]);
      setTimeout(() => onWin(), 1400);
    }
  }, [bouquet.length, addCollectable, onWin]);

  const pick = (flower: Flower) => {
    if (flower.collected) return;
    if (bouquet.length >= TARGET) return;
    playPop();
    vibrate(15);
    setFlowers((fs) =>
      fs.map((f) => (f.id === flower.id ? { ...f, collected: true } : f))
    );
    setBouquet((b) => [...b, flower]);
    const collectType = FLOWER_POOL.find((p) => p.emoji === flower.emoji);
    if (collectType) {
      addCollectable(collectType.collect, 1);
    }
    playChime(700 + bouquet.length * 60, 0.3);
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          💐 Bouquet: <strong className="text-white">{bouquet.length}</strong> / {TARGET}
        </span>
      </div>

      <p className="font-script text-base text-white/70">
        Pick {TARGET} flowers from the garden to build a bouquet for them.
      </p>

      {/* Garden */}
      <div className="grid w-full max-w-md grid-cols-6 gap-2 rounded-3xl border border-white/10 bg-gradient-to-b from-[#2a4a2a]/30 to-[#1a2a1a]/40 p-4">
        {flowers.map((f) => (
          <motion.button
            key={f.id}
            onClick={() => pick(f)}
            disabled={f.collected}
            whileHover={!f.collected ? { scale: 1.15, y: -4 } : {}}
            whileTap={!f.collected ? { scale: 0.9 } : {}}
            className="flex aspect-square items-center justify-center rounded-xl text-2xl transition-all"
            style={{
              opacity: f.collected ? 0.2 : 1,
              filter: f.collected
                ? "grayscale(1)"
                : `drop-shadow(0 0 6px ${f.color}80)`,
            }}
            aria-label={`Pick ${f.emoji}`}
          >
            <motion.span
              animate={
                f.collected
                  ? { y: -30, opacity: 0, rotate: 20 }
                  : { y: [0, -2, 0] }
              }
              transition={
                f.collected
                  ? { duration: 0.4 }
                  : { duration: 2 + Math.random(), repeat: Infinity }
              }
            >
              {f.emoji}
            </motion.span>
          </motion.button>
        ))}
      </div>

      {/* Bouquet preview */}
      <div className="flex w-full max-w-md flex-col items-center gap-2 rounded-2xl border border-[var(--rose-glow)]/20 bg-[var(--rose-glow)]/5 p-4">
        <div className="text-xs uppercase tracking-[0.25em] text-white/50">
          your bouquet
        </div>
        <div className="flex min-h-[44px] flex-wrap items-center justify-center gap-1">
          <AnimatePresence>
            {bouquet.length === 0 ? (
              <span className="font-script text-sm text-white/30">
                empty — pick some flowers
              </span>
            ) : (
              bouquet.map((f, i) => (
                <motion.span
                  key={f.id}
                  initial={{ scale: 0, y: -20, rotate: (Math.random() - 0.5) * 30 }}
                  animate={{ scale: 1, y: 0, rotate: (Math.random() - 0.5) * 15 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}
                  className="text-2xl"
                  style={{ filter: `drop-shadow(0 0 4px ${f.color}80)` }}
                >
                  {f.emoji}
                </motion.span>
              ))
            )}
          </AnimatePresence>
        </div>
        {bouquet.length >= TARGET && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-script text-sm text-[var(--gold)]"
          >
            A beautiful bouquet. 💐
          </motion.p>
        )}
      </div>
    </div>
  );
}
