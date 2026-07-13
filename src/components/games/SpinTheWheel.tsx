"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playFlourish, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "@/components/experience/FunnyPopups";

interface Props {
  onWin: () => void;
}

const SEGMENTS = [
  { label: "🌹 Rose", color: "#e11d48", collect: "rose" as const, n: 2 },
  { label: "🍫 Chocolate", color: "#8b5a2b", collect: "chocolate" as const, n: 2 },
  { label: "✨ Sparkle", color: "#ffd166", collect: "sparkle" as const, n: 3 },
  { label: "💌 Letter", color: "#ff5e8a", collect: "letter" as const, n: 1 },
  { label: "🪙 Coin", color: "#f5d77a", collect: "coin" as const, n: 2 },
  { label: "💎 Diamond", color: "#7ae7ff", collect: "diamond" as const, n: 1 },
  { label: "💛 Golden Heart", color: "#ffb800", collect: "goldenHeart" as const, n: 1 },
  { label: "🌟 Lucky Star", color: "#ffe5b4", collect: "star" as const, n: 3 },
];

const SPINS_TO_WIN = 2;

export function SpinTheWheel({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinsDone, setSpinsDone] = useState(0);
  const [lastWin, setLastWin] = useState<string>("");
  const [resultPopup, setResultPopup] = useState<string | null>(null);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);
  useEffect(() => { onWinRef.current = onWin; });

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResultPopup(null);
    // random segment
    const segIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segAngle = 360 / SEGMENTS.length;
    // the pointer is at top (0deg). We want the chosen segment to land at top.
    // wheel rotates clockwise; final rotation lands segment center under pointer.
    const targetRotation = 360 * 5 + (360 - segIndex * segAngle - segAngle / 2);
    const newRotation = rotation + targetRotation - (rotation % 360);
    setRotation(newRotation);
    playChime(600, 0.4);
    vibrate(30);

    setTimeout(() => {
      setSpinning(false);
      const seg = SEGMENTS[segIndex];
      addCollectable(seg.collect, seg.n);
      setLastWin(seg.label);
      setResultPopup(`You won ${seg.label} ×${seg.n}!`);
      playFlourish();
      vibrate([30, 40, 30]);
      triggerFunnyPopup(`Reeling in your ${seg.label}...`);
      const newSpins = spinsDone + 1;
      setSpinsDone(newSpins);
      if (newSpins >= SPINS_TO_WIN && !wonRef.current) {
        wonRef.current = true;
        setTimeout(() => onWinRef.current(), 1400);
      }
    }, 4200);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          🎡 Spins: <strong className="text-white">{spinsDone}</strong> / {SPINS_TO_WIN}
        </span>
        {lastWin && (
          <span className="rounded-full glass px-3 py-1 text-[var(--gold)]">
            Last: {lastWin}
          </span>
        )}
      </div>

      <div className="relative h-[320px] w-[320px] sm:h-[380px] sm:w-[380px]">
        {/* pointer */}
        <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2 text-3xl">
          <span style={{ filter: "drop-shadow(0 0 8px rgba(255,94,138,0.9))" }}>
            🔻
          </span>
        </div>

        {/* wheel */}
        <motion.div
          className="relative h-full w-full rounded-full border-4 border-white/20 shadow-2xl"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
          style={{
            background: `conic-gradient(${SEGMENTS.map((s, i) => {
              const segAngle = 360 / SEGMENTS.length;
              const start = i * segAngle;
              const end = (i + 1) * segAngle;
              return `${s.color} ${start}deg ${end}deg`;
            }).join(", ")})`,
          }}
        >
          {SEGMENTS.map((s, i) => {
            const segAngle = 360 / SEGMENTS.length;
            const angle = i * segAngle + segAngle / 2;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 origin-left"
                style={{ transform: `rotate(${angle}deg) translateX(20px)` }}
              >
                <div
                  className="whitespace-nowrap text-xs font-bold text-black/80 sm:text-sm"
                  style={{ transform: "translateY(-50%)" }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
          {/* center hub */}
          <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[var(--rose-glow)] to-[var(--gold)] text-2xl shadow-lg">
            💝
          </div>
        </motion.div>
      </div>

      <motion.button
        onClick={spin}
        disabled={spinning}
        whileHover={!spinning ? { scale: 1.05 } : {}}
        whileTap={!spinning ? { scale: 0.97 } : {}}
        className={`rounded-full px-8 py-3 font-display text-base transition-all ${
          spinning
            ? "cursor-not-allowed bg-white/10 text-white/40"
            : "bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] text-black glow-rose btn-bouncy"
        }`}
      >
        {spinning ? "Spinning..." : spinsDone >= SPINS_TO_WIN ? "Spin again ✨" : "Spin the wheel 🎡"}
      </motion.button>

      {resultPopup && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="font-script text-lg text-[var(--gold)]"
        >
          {resultPopup}
        </motion.div>
      )}

      <p className="font-script text-sm text-white/50">
        Spin {SPINS_TO_WIN} times to win a treasure from the wheel of love.
      </p>
    </div>
  );
}
