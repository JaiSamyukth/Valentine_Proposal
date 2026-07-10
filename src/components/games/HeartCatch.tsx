"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trophy } from "lucide-react";
import { useExperience } from "@/lib/experience-store";
import { playChime, vibrate } from "@/lib/sound";

interface Falling {
  id: number;
  x: number;
  y: number;
  vy: number;
  emoji: string;
  golden: boolean;
}

const EMOJIS = ["❤️", "💖", "💕", "💗", "💝", "🌹", "🌸", "✨"];

export function HeartCatch({ onWin }: { onWin: () => void }) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [items, setItems] = useState<Falling[]>([]);
  const [paddleX, setPaddleX] = useState(50);

  const idRef = useRef(0);
  const paddleXRef = useRef(50);
  const wonRef = useRef(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const winTarget = 12;

  const spawn = useCallback(() => {
    const golden = Math.random() < 0.12;
    const item: Falling = {
      id: idRef.current++,
      x: 8 + Math.random() * 84,
      y: -5,
      vy: 0.25 + Math.random() * 0.35,
      emoji: golden ? "💛" : EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      golden,
    };
    setItems((arr) => [...arr, item]);
  }, []);

  useEffect(() => {
    const spawnInt = setInterval(spawn, 850);
    return () => clearInterval(spawnInt);
  }, [spawn]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      let deferredScore = 0;
      let deferredHearts = 0;
      let deferredGolden = 0;
      let deferredMissed = 0;
      setItems((arr) => {
        const next: Falling[] = [];
        let addScore = 0;
        let addHearts = 0;
        let addGolden = 0;
        let addMissed = 0;
        for (const it of arr) {
          const ny = it.y + it.vy;
          if (ny > 84 && ny < 100 && Math.abs(it.x - paddleXRef.current) < 12) {
            addScore += it.golden ? 3 : 1;
            if (it.golden) addGolden++;
            else addHearts++;
            playChime(it.golden ? 1200 : 800, 0.3);
            if (it.golden) vibrate(30);
            continue;
          }
          if (ny > 105) {
            addMissed += 1;
            continue;
          }
          next.push({ ...it, y: ny });
        }
        deferredScore = addScore;
        deferredHearts = addHearts;
        deferredGolden = addGolden;
        deferredMissed = addMissed;
        return next;
      });
      // Apply store updates OUTSIDE the setItems updater to avoid
      // triggering re-renders of other components during this render.
      if (deferredScore) {
        setScore((s) => s + deferredScore);
        if (deferredHearts) addCollectable("heart", deferredHearts);
        if (deferredGolden) addCollectable("goldenHeart", deferredGolden);
      }
      if (deferredMissed) setMissed((m) => m + deferredMissed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [addCollectable]);

  useEffect(() => {
    if (score >= winTarget && !wonRef.current) {
      wonRef.current = true;
      setTimeout(() => onWin(), 600);
    }
  }, [score, onWin]);

  const onMove = (clientX: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(5, Math.min(95, x));
    // Update the ref DIRECTLY so the RAF loop sees it immediately,
    // not one render later.
    paddleXRef.current = clamped;
    setPaddleX(clamped);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 rounded-full glass px-3 py-1">
          <Heart className="h-3.5 w-3.5 fill-[var(--rose-glow)] text-[var(--rose-glow)]" />
          Caught: <strong className="text-white">{score}</strong> / {winTarget}
        </span>
        <span className="flex items-center gap-1.5 rounded-full glass px-3 py-1">
          <Trophy className="h-3.5 w-3.5 text-[var(--gold)]" />
          Missed: {missed}
        </span>
      </div>

      <div
        ref={areaRef}
        className="relative h-[420px] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent"
        onMouseMove={(e) => onMove(e.clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
      >
        {items.map((it) => (
          <motion.div
            key={it.id}
            className="absolute text-2xl"
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <span
              style={{
                filter: it.golden
                  ? "drop-shadow(0 0 8px rgba(255,209,102,0.9))"
                  : "drop-shadow(0 0 6px rgba(255,94,138,0.6))",
              }}
            >
              {it.emoji}
            </span>
          </motion.div>
        ))}

        <motion.div
          className="absolute bottom-2 text-4xl"
          style={{ left: `${paddleX}%`, translateX: "-50%" }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <span style={{ filter: "drop-shadow(0 0 10px rgba(255,94,138,0.7))" }}>
            🧺
          </span>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs uppercase tracking-[0.25em] text-white/40">
          move to catch the hearts
        </div>
      </div>

      <p className="font-script text-sm text-white/50">
        Golden hearts are worth three. ✨
      </p>
    </div>
  );
}
