"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playSparkle } from "@/lib/sound";

interface Spark {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  emoji: boolean;
}

const COLORS = ["#ff5e8a", "#ffd166", "#7ae7ff", "#ff9ecd", "#fff3c4"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function CursorTrail() {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [down, setDown] = useState(false);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (typeof window === "undefined") return;
    // Only enable on devices with a fine pointer (mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const now = performance.now();
      if (now - lastSpawnRef.current > 45) {
        lastSpawnRef.current = now;
        const id = idRef.current++;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const size = 4 + Math.random() * 8;
        setSparks((s) => [
          ...s.slice(-24),
          {
            id,
            x: e.clientX + (Math.random() - 0.5) * 12,
            y: e.clientY + (Math.random() - 0.5) * 12,
            color,
            size,
            emoji: Math.random() < 0.15,
          },
        ]);
        if (Math.random() < 0.12) playSparkle();
        setTimeout(() => {
          setSparks((s) => s.filter((sp) => sp.id !== id));
        }, 900);
      }
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-hidden>
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 1, scale: 1, y: 0 }}
          animate={{ opacity: 0, scale: 0.2, y: -30 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          {s.emoji ? (
            <span style={{ fontSize: s.size + 6 }}>✨</span>
          ) : (
            <span
              style={{
                display: "block",
                width: s.size,
                height: s.size,
                borderRadius: "999px",
                background: s.color,
                boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
              }}
            />
          )}
        </motion.div>
      ))}
      {/* Custom cursor */}
      <motion.div
        animate={{ scale: down ? 1.6 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          translateX: "-50%",
          translateY: "-50%",
          fontSize: 22,
          filter: "drop-shadow(0 0 6px rgba(255,94,138,0.8))",
        }}
      >
        ❤️
      </motion.div>
    </div>
  );
}
