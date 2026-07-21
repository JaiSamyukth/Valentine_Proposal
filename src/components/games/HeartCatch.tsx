"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
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
  const [, forceRender] = useReducer((x) => x + 1, 0);

  const idRef = useRef(0);
  const itemsRef = useRef<Falling[]>([]);
  const paddleXRef = useRef(50);
  const scoreRef = useRef(0);
  const wonRef = useRef(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const onWinRef = useRef(onWin);
  const addCollectableRef = useRef(addCollectable);
  const winTarget = 8;

  useEffect(() => {
    onWinRef.current = onWin;
    addCollectableRef.current = addCollectable;
  });

  const spawn = useCallback(() => {
    const golden = Math.random() < 0.12;
    const item: Falling = {
      id: idRef.current++,
      x: 8 + Math.random() * 84,
      y: -5,
      vy: 0.2 + Math.random() * 0.25,
      emoji: golden ? "💛" : EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      golden,
    };
    itemsRef.current = [...itemsRef.current, item];
  }, []);

  useEffect(() => {
    const spawnInt = setInterval(spawn, 700);
    return () => clearInterval(spawnInt);
  }, [spawn]);

  // Single game loop on refs — NO setState inside the loop logic.
  // The loop reads/writes refs, then syncs to state once per frame for rendering.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const arr = itemsRef.current;
      const px = paddleXRef.current;
      const next: Falling[] = [];
      let addScore = 0;
      let addHearts = 0;
      let addGolden = 0;
      let addMissed = 0;

      for (const it of arr) {
        const ny = it.y + it.vy;
        // Catch zone: heart is near the paddle (bottom of play area)
        if (ny > 82 && ny < 106 && Math.abs(it.x - px) < 20) {
          addScore += it.golden ? 3 : 1;
          if (it.golden) addGolden++;
          else addHearts++;
          playChime(it.golden ? 1200 : 800, 0.3);
          if (it.golden) vibrate(30);
          continue; // caught — don't keep it
        }
        if (ny > 112) {
          addMissed += 1;
          continue; // missed — remove
        }
        next.push({ ...it, y: ny });
      }

      // Write the survivors back to the ref
      itemsRef.current = next;

      // Apply score + collectables using refs, OUTSIDE any setState updater
      if (addScore > 0) {
        scoreRef.current += addScore;
        setScore(scoreRef.current);
        if (addHearts) addCollectableRef.current("heart", addHearts);
        if (addGolden) addCollectableRef.current("goldenHeart", addGolden);

        // Check win
        if (scoreRef.current >= winTarget && !wonRef.current) {
          wonRef.current = true;
          setTimeout(() => onWinRef.current(), 600);
        }
      }
      if (addMissed > 0) {
        setMissed((m) => m + addMissed);
      }

      // Sync items to state for rendering (only if there are items to render)
      setItems(next);
      forceRender();

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      itemsRef.current = [];
    };
  }, []);

  const onMove = (clientX: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(5, Math.min(95, x));
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
        className="relative h-[340px] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent sm:h-[420px] no-select"
        onMouseMove={(e) => onMove(e.clientX)}
        onTouchMove={(e) => {
          e.preventDefault();
          onMove(e.touches[0].clientX);
        }}
        onTouchStart={(e) => onMove(e.touches[0].clientX)}
      >
        {items.map((it) => (
          <div
            key={it.id}
            className="absolute text-2xl"
            style={{ left: `${it.x}%`, top: `${it.y}%`, transform: "translate(-50%,-50%)" }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{
                display: "inline-block",
                filter: it.golden
                  ? "drop-shadow(0 0 8px rgba(255,209,102,0.9))"
                  : "drop-shadow(0 0 6px rgba(255,94,138,0.6))",
              }}
            >
              {it.emoji}
            </motion.span>
          </div>
        ))}

        <motion.div
          className="absolute bottom-2 text-5xl"
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
