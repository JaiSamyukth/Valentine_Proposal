"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, vibrate } from "@/lib/sound";

interface Heart {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  golden: boolean;
}

interface Arrow {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Props {
  onWin: () => void;
}

const WIN_TARGET = 8;

export function CupidArrow({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [score, setScore] = useState(0);
  const [aim, setAim] = useState({ x: 50, y: 50 });
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);

  const idRef = useRef(0);
  const arrowIdRef = useRef(0);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  useEffect(() => { onWinRef.current = onWin; });
  const areaRef = useRef<HTMLDivElement>(null);
  const aimRef = useRef(aim);
  const lastShotRef = useRef(0);
  const canShootRef = useRef(true);
  // Snapshot refs to read inside RAF without re-creating the loop each render
  const heartsRef = useRef<Heart[]>([]);
  const arrowsRef = useRef<Arrow[]>([]);

  useEffect(() => {
    heartsRef.current = hearts;
  }, [hearts]);
  useEffect(() => {
    arrowsRef.current = arrows;
  }, [arrows]);
  useEffect(() => {
    aimRef.current = aim;
  }, [aim]);

  const spawnHeart = useCallback(() => {
    const golden = Math.random() < 0.15;
    const fromLeft = Math.random() < 0.5;
    const heart: Heart = {
      id: idRef.current++,
      x: fromLeft ? -5 : 105,
      y: 10 + Math.random() * 70,
      vx: (fromLeft ? 1 : -1) * (0.3 + Math.random() * 0.4),
      vy: (Math.random() - 0.5) * 0.2,
      emoji: golden ? "💛" : ["❤️", "💖", "💕", "💗"][Math.floor(Math.random() * 4)],
      golden,
    };
    setHearts((h) => [...h, heart]);
  }, []);

  useEffect(() => {
    const spawnInt = setInterval(spawnHeart, 1100);
    return () => clearInterval(spawnInt);
  }, [spawnHeart]);

  // Single RAF loop: move + collide + write back to state once per frame.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const hs = heartsRef.current;
      const ar = arrowsRef.current;
      if (hs.length || ar.length) {
        // Move
        const movedHearts = hs
          .map((h) => ({ ...h, x: h.x + h.vx, y: h.y + h.vy }))
          .filter((h) => h.x > -10 && h.x < 110);
        const movedArrows = ar
          .map((a) => ({ ...a, x: a.x + a.vx, y: a.y + a.vy }))
          .filter((a) => a.y > -10 && a.y < 110 && a.x > -10 && a.x < 110);

        // Collide
        let addScore = 0;
        let addHearts = 0;
        let addGolden = 0;
        const survivingArrows: Arrow[] = [...movedArrows];
        const survivingHearts: Heart[] = [];
        for (const h of movedHearts) {
          let hit = false;
          for (let i = 0; i < survivingArrows.length; i++) {
            const a = survivingArrows[i];
            const dx = h.x - a.x;
            const dy = h.y - a.y;
            if (Math.hypot(dx, dy) < 5) {
              hit = true;
              addScore += h.golden ? 3 : 1;
              if (h.golden) addGolden++;
              else addHearts++;
              playChime(h.golden ? 1300 : 900, 0.3);
              vibrate(20);
              survivingArrows.splice(i, 1);
              i--;
            }
          }
          if (!hit) survivingHearts.push(h);
        }

        setHearts(survivingHearts);
        setArrows(survivingArrows);
        if (addScore > 0) {
          setScore((s) => s + addScore);
          if (addHearts) addCollectable("heart", addHearts);
          if (addGolden) addCollectable("goldenHeart", addGolden);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [addCollectable]);

  useEffect(() => {
    if (score >= WIN_TARGET && !wonRef.current) {
      wonRef.current = true;
      setTimeout(() => onWinRef.current(), 600);
    }
  }, [score, onWin]);

  const aimAt = (clientX: number, clientY: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAim({
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    });
  };

  const shoot = () => {
    if (!canShootRef.current) return;
    const now = performance.now();
    if (now - lastShotRef.current < 200) return;
    lastShotRef.current = now;
    canShootRef.current = false;
    setTimeout(() => (canShootRef.current = true), 200);
    const sx = 50;
    const sy = 95;
    const dx = aimRef.current.x - sx;
    const dy = aimRef.current.y - sy;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 4;
    setArrows((ar) => [
      ...ar,
      {
        id: arrowIdRef.current++,
        x: sx,
        y: sy,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
      },
    ]);
    playPop();
    vibrate(15);
  };

  const aimAngle = Math.atan2(aim.y - 95, aim.x - 50) * (180 / Math.PI);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          🎯 Hit: <strong className="text-white">{score}</strong> / {WIN_TARGET}
        </span>
        <span className="rounded-full glass px-3 py-1">💘 Cupid mode</span>
      </div>

      <div
        ref={areaRef}
        className="relative h-[360px] w-full max-w-2xl cursor-crosshair overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent sm:h-[440px] no-select"
        onMouseMove={(e) => aimAt(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          e.preventDefault();
          aimAt(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchStart={(e) => {
          aimAt(e.touches[0].clientX, e.touches[0].clientY);
          shoot();
        }}
        onClick={shoot}
      >
        {hearts.map((h) => (
          <div
            key={h.id}
            className="absolute text-2xl"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              transform: "translate(-50%,-50%)",
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                filter: h.golden
                  ? "drop-shadow(0 0 8px rgba(255,209,102,0.9))"
                  : "drop-shadow(0 0 6px rgba(255,94,138,0.6))",
              }}
            >
              {h.emoji}
            </motion.span>
          </div>
        ))}

        {arrows.map((a) => {
          const ang = Math.atan2(a.vy, a.vx) * (180 / Math.PI);
          return (
            <div
              key={a.id}
              className="absolute"
              style={{
                left: `${a.x}%`,
                top: `${a.y}%`,
                transform: `translate(-50%,-50%) rotate(${ang}deg)`,
              }}
            >
              <span className="text-xl">🏹</span>
            </div>
          );
        })}

        <div
          className="absolute text-4xl"
          style={{ left: "50%", bottom: "4%", transform: "translateX(-50%)" }}
        >
          <motion.span
            animate={{ rotate: [aimAngle - 2, aimAngle + 2, aimAngle - 2] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ filter: "drop-shadow(0 0 10px rgba(255,94,138,0.7))" }}
          >
            🏹
          </motion.span>
        </div>

        <motion.div
          className="pointer-events-none absolute text-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            left: `${aim.x}%`,
            top: `${aim.y}%`,
            transform: "translate(-50%,-50%)",
          }}
        >
          🎯
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 top-3 text-center text-xs uppercase tracking-[0.25em] text-white/40">
          move to aim · click to shoot
        </div>
      </div>

      <p className="font-script text-sm text-white/50">
        Golden hearts count triple. Channel your inner Cupid. 💘
      </p>
    </div>
  );
}
