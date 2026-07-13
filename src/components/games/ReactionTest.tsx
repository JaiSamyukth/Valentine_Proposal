"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { playChime, playPop, playFlourish, vibrate } from "@/lib/sound";

type GameState = "waiting" | "ready" | "result" | "tooSoon" | "done";

interface Props {
  onWin: () => void;
}

const ROUNDS_TO_WIN = 3;
const FAST_THRESHOLD = 500; // ms — beat this for a "perfect"

export function ReactionTest({ onWin }: Props) {
  const addCollectable = useExperience((s) => s.addCollectable);
  const [state, setState] = useState<GameState>("waiting");
  const [round, setRound] = useState(0);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [times, setTimes] = useState<number[]>([]);
  const litAtRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wonRef = useRef(false);
  const onWinRef = useRef(onWin);

  useEffect(() => {
    onWinRef.current = onWin;
  });

  const startRound = () => {
    setState("waiting");
    const delay = 1200 + Math.random() * 2800;
    timeoutRef.current = setTimeout(() => {
      litAtRef.current = performance.now();
      setState("ready");
      playChime(880, 0.15);
    }, delay);
  };

  useEffect(() => {
    // Start the first round without calling setState synchronously.
    const delay = 1200 + Math.random() * 2800;
    timeoutRef.current = setTimeout(() => {
      litAtRef.current = performance.now();
      setState("ready");
      playChime(880, 0.15);
    }, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTap = () => {
    if (state === "waiting") {
      // tapped too soon
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState("tooSoon");
      playPop();
      vibrate(40);
      return;
    }
    if (state === "ready") {
      const rt = performance.now() - litAtRef.current;
      setLastTime(rt);
      setTimes((t) => [...t, rt]);
      const isFast = rt < FAST_THRESHOLD;
      if (isFast) {
        addCollectable("sparkle", 2);
        addCollectable("goldenHeart", 1);
      } else {
        addCollectable("sparkle", 1);
      }
      playChime(isFast ? 1200 : 800, 0.4);
      vibrate(isFast ? 30 : 15);
      setState("result");
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= ROUNDS_TO_WIN && !wonRef.current) {
        wonRef.current = true;
        setTimeout(() => {
          playFlourish();
          onWinRef.current();
        }, 1200);
      } else {
        setTimeout(startRound, 1400);
      }
    }
  };

  const avg =
    times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : null;

  const bg =
    state === "ready"
      ? "from-[var(--rose-glow)]/40 to-[var(--gold)]/30 border-[var(--rose-glow)]"
      : state === "waiting"
      ? "from-white/5 to-white/[0.02] border-white/15"
      : state === "tooSoon"
      ? "from-[var(--rose-glow)]/20 to-transparent border-[var(--rose-glow)]/50"
      : "from-[var(--aurora)]/20 to-transparent border-[var(--aurora)]/40";

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full glass px-3 py-1">
          Round: <strong className="text-white">{Math.min(round + 1, ROUNDS_TO_WIN)}</strong> / {ROUNDS_TO_WIN}
        </span>
        {avg && (
          <span className="rounded-full glass px-3 py-1">
            Avg: <strong className="text-white">{avg}ms</strong>
          </span>
        )}
      </div>

      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.97 }}
        className={`relative flex h-[280px] w-full max-w-md flex-col items-center justify-center gap-4 rounded-3xl border-2 bg-gradient-to-br transition-colors ${bg}`}
        animate={
          state === "ready"
            ? { scale: [1, 1.02, 1] }
            : state === "tooSoon"
            ? { x: [-8, 8, -6, 6, 0] }
            : {}
        }
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {state === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-6xl opacity-40">💔</div>
              <p className="mt-4 font-script text-xl text-white/70">
                Wait for the heart to light up...
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
                don't tap yet
              </p>
            </motion.div>
          )}
          {state === "ready" && (
            <motion.div
              key="ready"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div
                className="text-7xl animate-heartbeat"
                style={{
                  filter:
                    "drop-shadow(0 0 24px rgba(255,94,138,0.9)) drop-shadow(0 0 60px rgba(255,94,138,0.5))",
                }}
              >
                💖
              </div>
              <p className="mt-4 font-display text-2xl text-white">TAP!</p>
            </motion.div>
          )}
          {state === "result" && lastTime !== null && (
            <motion.div
              key="result"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-5xl">
                {lastTime < FAST_THRESHOLD ? "⚡" : "💕"}
              </div>
              <p className="mt-3 font-display text-3xl gradient-text-rose">
                {Math.round(lastTime)}ms
              </p>
              <p className="mt-1 font-script text-sm text-white/60">
                {lastTime < FAST_THRESHOLD
                  ? "Lightning fast! Perfect."
                  : "Lovely reflexes."}
              </p>
            </motion.div>
          )}
          {state === "tooSoon" && (
            <motion.div
              key="toosoon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="text-5xl">😅</div>
              <p className="mt-3 font-script text-xl text-[var(--rose-glow)]">
                Too soon!
              </p>
              <p className="mt-1 text-xs text-white/50">try again</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Past times */}
      {times.length > 0 && (
        <div className="flex gap-2">
          {times.map((t, i) => (
            <span
              key={i}
              className={`rounded-full px-2.5 py-1 text-xs ${
                t < FAST_THRESHOLD
                  ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                  : "glass text-white/70"
              }`}
            >
              {Math.round(t)}ms
            </span>
          ))}
        </div>
      )}

      <p className="font-script text-sm text-white/50">
        Wait for the heart to glow, then tap. Fast taps earn golden hearts. ⚡
      </p>
    </div>
  );
}
