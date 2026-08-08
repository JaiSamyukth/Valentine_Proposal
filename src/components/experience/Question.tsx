"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useExperience } from "@/lib/experience-store";
import { playChime, playFlourish, playPop, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "./FunnyPopups";

const NO_STATES = [
  { label: "No", emoji: null },
  { label: "Maybe?", emoji: null },
  { label: "Think again", emoji: null },
  { label: "Are you sure?", emoji: null },
  { label: "Retry", emoji: null },
  { label: "That wasn't the right one", emoji: null },
  { label: "I dare you to press YES", emoji: null },
  { label: null, emoji: "🥔" },
  { label: null, emoji: "🍕" },
  { label: null, emoji: "🐱" },
  { label: null, emoji: "😴" },
  { label: null, emoji: "🦋" },
  { label: "loading...", emoji: null },
  { label: null, emoji: "🎈" },
  { label: null, emoji: "☁️" },
];

const NO_MESSAGES = [
  "Error 404: Cold heart not found.",
  "Love.exe still running...",
  "Checking heart status: overflowing.",
  "The 'No' button is on vacation.",
  "This button refuses to cooperate.",
  "Nice try. The universe says yes.",
  "Did you mean: YES?",
  "This button has feelings. It said maybe.",
];

export function Question() {
  const settings = useExperience((s) => s.settings);
  const setYes = useExperience((s) => s.setYes);
  const setPhase = useExperience((s) => s.setPhase);
  const unlock = useExperience((s) => s.unlockAchievement);
  const registerNo = useExperience((s) => s.registerNo);
  const noAttempts = useExperience((s) => s.noAttempts);

  const [noState, setNoState] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0, rot: 0, scale: 1, opacity: 1 });
  const [yesScale, setYesScale] = useState(1);
  const [showYes, setShowYes] = useState(false);
  const yesRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setShowYes(true), 800);
    return () => clearTimeout(t);
  }, []);

  // YES button grows slowly over time
  useEffect(() => {
    const interval = setInterval(() => {
      setYesScale((s) => Math.min(s + 0.015, 1.35));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleNo = () => {
    registerNo();
    playPop();
    vibrate(30);
    const i = Math.min(noState + 1, NO_STATES.length - 1);
    setNoState(i);
    triggerFunnyPopup(NO_MESSAGES[noAttempts % NO_MESSAGES.length]);

    // chaos: random position, rotation, scale, opacity
    const maxX = window.innerWidth * 0.35;
    const maxY = window.innerHeight * 0.3;
    setNoPos({
      x: (Math.random() - 0.5) * maxX * 2,
      y: (Math.random() - 0.5) * maxY * 2,
      rot: (Math.random() - 0.5) * 60,
      scale: 0.5 + Math.random() * 0.6,
      opacity: 0.3 + Math.random() * 0.6,
    });

    if (noAttempts >= 5 && !yesRef.current) {
      unlock("chaosSurvivor");
    }
    // after enough attempts, the no button dissolves into confetti
    if (noAttempts >= 8) {
      setNoPos((p) => ({ ...p, opacity: 0, scale: 0 }));
      confetti({
        particleCount: 60,
        spread: 360,
        origin: { y: 0.5 },
        startVelocity: 25,
        shapes: ["❤️"],
        scalar: 1.4,
      });
    }
  };

  const handleYes = () => {
    if (yesRef.current) return;
    yesRef.current = true;
    setYes();
    unlock("cupid");
    playFlourish();
    vibrate([60, 80, 60, 80, 120]);
    // big celebration
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      shapes: ["❤️", "💖", "✨", "🌹"],
      scalar: 1.6,
    });
    setTimeout(() => {
      confetti({
        particleCount: 150,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.7 },
      });
      confetti({
        particleCount: 150,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.7 },
      });
    }, 300);
    setTimeout(() => setPhase("finale"), 1400);
  };

  const state = NO_STATES[noState];
  const r = settings.receiverName || "you";
  const question = `${r}, will you be my Valentine?`;

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-20 text-center">
      {/* Floating decorative hearts */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute text-2xl opacity-30"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          {["💖", "💕", "💗", "💝", "❤️", "🌹"][i]}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        onDoubleClick={() => {
          // Hidden easter egg: double-click the heart for a surprise burst
          confetti({
            particleCount: 80,
            spread: 360,
            origin: { x: 0.5, y: 0.4 },
            shapes: ["💞", "💖", "✨"],
            scalar: 1.5,
          });
          playFlourish();
          vibrate([40, 60, 40]);
          triggerFunnyPopup("You found a secret. 💞");
        }}
        className="mb-6 cursor-pointer text-7xl animate-heartbeat sm:text-8xl"
        style={{
          filter:
            "drop-shadow(0 0 30px rgba(255,94,138,0.9)) drop-shadow(0 0 80px rgba(255,94,138,0.5))",
        }}
      >
        💞
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-4xl leading-tight gradient-text-rose sm:text-6xl"
      >
        {question}
      </motion.h1>

      {settings.quote && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 max-w-md font-script text-xl italic text-white/60"
        >
          “{settings.quote}”
        </motion.p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-2 font-script text-base text-white/40"
      >
        — from {settings.senderName || "someone who adores you"}
      </motion.p>

      {/* Buttons */}
      <div className="relative mt-12 flex min-h-[140px] items-center justify-center gap-6">
        <AnimatePresence>
          {showYes && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: yesScale, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              whileHover={{ scale: yesScale * 1.08 }}
              whileTap={{ scale: yesScale * 0.95 }}
              onClick={handleYes}
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-[var(--rose-glow)] via-[#ff8e72] to-[var(--gold)] px-12 py-5 font-display text-2xl text-black glow-rose"
            >
              <span className="relative z-10 flex items-center gap-2">
                YES 💖
              </span>
              <span className="absolute inset-0 shimmer opacity-50" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* NO button */}
        <AnimatePresence>
          {noAttempts < 9 && (
            <motion.button
              key="no"
              onClick={handleNo}
              animate={{
                x: noPos.x,
                y: noPos.y,
                rotate: noPos.rot,
                scale: noPos.scale,
                opacity: noPos.opacity,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="relative rounded-full border border-white/20 bg-white/5 px-6 py-3 font-display text-base text-white/70 backdrop-blur-md"
              style={{ pointerEvents: "auto" }}
            >
              {state.emoji ? (
                <span className="text-2xl">{state.emoji}</span>
              ) : (
                state.label || "No"
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {noAttempts > 0 && noAttempts < 8 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 font-script text-sm text-white/40"
        >
          (psst — the YES button keeps growing...)
        </motion.p>
      )}
    </div>
  );
}
