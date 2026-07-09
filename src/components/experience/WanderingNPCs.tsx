"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type { ThemeKey } from "@/lib/experience-store";
import { playChime, vibrate } from "@/lib/sound";
import { useExperience } from "@/lib/experience-store";

interface NPC {
  id: number;
  emoji: string;
  startX: number;
  endX: number;
  duration: number;
  delay: number;
  y: number;
  size: number;
  flip: boolean;
  reaction: string;
}

const POOL = [
  { emoji: "🐱", reaction: "meow" },
  { emoji: "🦊", reaction: "yip" },
  { emoji: "🦉", reaction: "hoot" },
  { emoji: "🦋", reaction: "flutter" },
  { emoji: "🐧", reaction: "waddle" },
  { emoji: "🐉", reaction: "roar" },
  { emoji: "👻", reaction: "boo" },
  { emoji: "👽", reaction: "beep" },
  { emoji: "🤖", reaction: "beep boop" },
  { emoji: "🐳", reaction: "song" },
  { emoji: "🦌", reaction: "..." },
  { emoji: "🐰", reaction: "hop" },
];

export function WanderingNPCs({ theme }: { theme: ThemeKey }) {
  const unlock = useExperience((s) => s.unlockAchievement);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [clicked, setClicked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let id = 0;
    const spawn = () => {
      const pick = POOL[Math.floor(Math.random() * POOL.length)];
      const fromLeft = Math.random() < 0.5;
      const npc: NPC = {
        id: id++,
        emoji: pick.emoji,
        reaction: pick.reaction,
        startX: fromLeft ? -10 : 110,
        endX: fromLeft ? 110 : -10,
        duration: 12 + Math.random() * 10,
        delay: 0,
        y: 60 + Math.random() * 35,
        size: 28 + Math.random() * 20,
        flip: !fromLeft,
      };
      setNpcs((arr) => [...arr.slice(-3), npc]);
      setTimeout(() => {
        setNpcs((arr) => arr.filter((n) => n.id !== npc.id));
      }, (npc.duration + 1) * 1000);
    };

    // initial spawn staggered
    const initial = setTimeout(spawn, 3000);
    const interval = setInterval(spawn, 9000 + Math.random() * 4000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  const onClick = (npc: NPC) => {
    setClicked((c) => ({ ...c, [npc.id]: true }));
    playChime(800 + Math.random() * 400, 0.4);
    vibrate(20);
    confetti({
      particleCount: 14,
      spread: 60,
      origin: { x: 0.5, y: 0.7 },
      shapes: [npc.emoji],
      scalar: 1.8,
    });
    unlock("butterflyWhisperer");
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {npcs.map((npc) => (
          <motion.button
            key={npc.id}
            className="pointer-events-auto absolute"
            style={{
              top: `${npc.y}%`,
              fontSize: npc.size,
              scaleX: npc.flip ? -1 : 1,
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))",
            }}
            initial={{ x: `${npc.startX}vw`, opacity: 0, y: 0 }}
            animate={{
              x: `${npc.endX}vw`,
              opacity: clicked[npc.id] ? 0 : 1,
              y: [0, -8, 0, -6, 0],
              scale: clicked[npc.id] ? 1.6 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              x: { duration: npc.duration, ease: "linear" },
              y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            onClick={() => onClick(npc)}
            aria-label={`A wandering ${npc.emoji}`}
          >
            <span className="inline-block">{npc.emoji}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
