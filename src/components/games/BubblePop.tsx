"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, vibrate } from "@/lib/sound";

interface Bubble {
  id: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  emoji: string;
  golden: boolean;
  popped: boolean;
  phase: number;
}

const EMOJIS = ["❤️", "💖", "💕", "💗", "💝", "🌹", "🌸", "✨"];
const WIN_TARGET = 15;

interface Props {
  onWin: () => void;
}

export function BubblePop({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const idRef = useRef(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  useEffect(() => { onWinRef.current = onWin; });

  useEffect(() => {
    bubblesRef.current = bubbles;
  }, [bubbles]);

  const spawn = useCallback(() => {
    const golden = Math.random() < 0.1;
    const bubble: Bubble = {
      id: idRef.current++,
      x: 8 + Math.random() * 84,
      y: 105,
      vy: -(0.2 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * 0.15,
      size: 28 + Math.random() * 20,
      emoji: golden ? "💛" : EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      golden,
      popped: false,
      phase: Math.random() * Math.PI * 2,
    };
    setBubbles((b) => [...b, bubble]);
  }, []);

  useEffect(() => {
    const spawnInt = setInterval(spawn, 600);
    return () => clearInterval(spawnInt);
  }, [spawn]);

  // Movement + escape detection — use refs, not setState updaters
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const arr = bubblesRef.current;
      const next: Bubble[] = [];
      let addEscaped = 0;
      for (const b of arr) {
        if (b.popped) continue;
        const ny = b.y + b.vy;
        const nx = b.x + b.vx + Math.sin(b.phase + ny * 0.05) * 0.1;
        if (ny < -8) {
          addEscaped++;
          continue;
        }
        next.push({ ...b, y: ny, x: nx, phase: b.phase + 0.02 });
      }
      bubblesRef.current = next;
      setBubbles(next);
      if (addEscaped) setEscaped((e) => e + addEscaped);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (score >= WIN_TARGET && !wonRef.current) {
      wonRef.current = true;
      setTimeout(() => onWinRef.current(), 600);
    }
  }, [score, onWin]);

  const pop = (id: number) => {
    const bubble = bubblesRef.current.find((b) => b.id === id);
    if (!bubble || bubble.popped) return;
    const points = bubble.golden ? 3 : 1;
    setScore((s) => s + points);
    if (bubble.golden) addCollectable("goldenHeart", 1);
    else addCollectable("heart", 1);
    if (bubble.emoji === "🌹") addCollectable("rose", 1);
    if (bubble.emoji === "🌸") addCollectable("flower", 1);
    playPop();
    vibrate(bubble.golden ? 30 : 15);
    // Update ref + state directly
    const marked = bubblesRef.current.map((b) =>
      b.id === id ? { ...b, popped: true } : b
    );
    bubblesRef.current = marked;
    setBubbles(marked);
    setTimeout(() => {
      const filtered = bubblesRef.current.filter((b) => b.id !== id);
      bubblesRef.current = filtered;
      setBubbles(filtered);
    }, 200);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          🫧 Popped: <strong className="text-white">{score}</strong> / {WIN_TARGET}
        </span>
        <span className="rounded-full glass px-3 py-1">
          Escaped: {escaped}
        </span>
      </div>

      <div className="relative h-[360px] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[var(--aurora)]/5 to-transparent sm:h-[440px]">
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.button
              key={b.id}
              onClick={() => pop(b.id)}
              className="absolute flex items-center justify-center rounded-full"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                transform: "translate(-50%, -50%)",
                background: b.golden
                  ? "radial-gradient(circle at 30% 30%, rgba(255,209,102,0.4), rgba(255,209,102,0.1))"
                  : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), rgba(255,94,138,0.1))",
                border: b.golden
                  ? "1px solid rgba(255,209,102,0.6)"
                  : "1px solid rgba(255,255,255,0.4)",
                boxShadow: b.golden
                  ? "0 0 16px rgba(255,209,102,0.6), inset 0 0 8px rgba(255,255,255,0.3)"
                  : "0 0 12px rgba(255,94,138,0.4), inset 0 0 8px rgba(255,255,255,0.4)",
              }}
              animate={
                b.popped
                  ? { scale: [1, 1.5, 0], opacity: [1, 0.6, 0] }
                  : { scale: [1, 1.04, 1] }
              }
              transition={
                b.popped
                  ? { duration: 0.2 }
                  : { duration: 1.5, repeat: Infinity }
              }
              aria-label={`Pop ${b.emoji}`}
            >
              <span className="text-lg" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.5))" }}>
                {b.emoji}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs uppercase tracking-[0.25em] text-white/40">
          tap the bubbles before they float away
        </div>
      </div>

      <p className="font-script text-sm text-white/50">
        Golden bubbles count triple. Roses and flowers give bonus collectables. 🫧
      </p>
    </div>
  );
}
