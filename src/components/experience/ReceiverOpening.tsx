"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { StoryConfig } from "@/lib/story-config";
import { playHeartbeat, playChime, playFlourish, vibrate, resumeAudio, startAmbient } from "@/lib/sound";

type Stage =
  | "black"
  | "beat"
  | "searching"
  | "scanning"
  | "locating"
  | "found"
  | "portal"
  | "welcome"
  | "butterflies"
  | "enter";

interface Props {
  config: StoryConfig;
  onDone: () => void;
}

export function ReceiverOpening({ config, onDone }: Props) {
  const [stage, setStage] = useState<Stage>("black");
  const [progress, setProgress] = useState(0);
  const receiverName = config.receiverName || "you";

  useEffect(() => {
    resumeAudio();
    startAmbient();

    // heartbeat loop during early stages
    const beat = () => playHeartbeat(1);
    beat();
    const beatInterval = setInterval(beat, 1400);
    vibrate([60, 80, 60]);

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStage("beat"), 600));
    timers.push(setTimeout(() => setStage("searching"), 3000));
    timers.push(setTimeout(() => setStage("scanning"), 5500));
    timers.push(setTimeout(() => setStage("locating"), 8000));
    timers.push(setTimeout(() => setStage("found"), 10500));
    timers.push(setTimeout(() => {
      clearInterval(beatInterval);
      setStage("portal");
      playFlourish();
      vibrate([80, 60, 80, 60, 100]);
    }, 12000));
    timers.push(setTimeout(() => setStage("welcome"), 14500));
    timers.push(setTimeout(() => setStage("butterflies"), 18500));

    // progress bar animation during butterflies
    timers.push(setTimeout(() => {
      setStage("butterflies");
      const progInterval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(progInterval);
            setStage("enter");
            setTimeout(() => onDone(), 1500);
            return 100;
          }
          return p + 4 + Math.random() * 8;
        });
      }, 120);
    }, 18500));

    return () => {
      clearInterval(beatInterval);
      timers.forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      animate={{ opacity: stage === "enter" ? 0 : 1 }}
      transition={{ duration: 1.2 }}
    >
      <AnimatePresence mode="wait">
        {/* Black screen with tiny heart */}
        {(stage === "black" || stage === "beat") && (
          <motion.div
            key="beat"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-5xl"
              animate={{ scale: [1, 1.25, 1, 1.18, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                filter:
                  "drop-shadow(0 0 20px rgba(255,94,138,1)) drop-shadow(0 0 60px rgba(255,94,138,0.5))",
              }}
            >
              ❤️
            </motion.div>
          </motion.div>
        )}

        {/* Searching the universe */}
        {stage === "searching" && (
          <motion.div
            key="searching"
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="font-script text-2xl text-white/70 sm:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="typing-caret">Searching the universe...</span>
            </motion.p>
          </motion.div>
        )}

        {/* Scanning memories */}
        {stage === "scanning" && (
          <motion.div
            key="scanning"
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="font-script text-2xl text-white/60 sm:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="typing-caret">Scanning memories...</span>
            </motion.p>
          </motion.div>
        )}

        {/* Locating one special person */}
        {stage === "locating" && (
          <motion.div
            key="locating"
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="font-script text-2xl text-white/80 sm:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="typing-caret">Locating one special person...</span>
            </motion.p>
          </motion.div>
        )}

        {/* Receiver located */}
        {stage === "found" && (
          <motion.div
            key="found"
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <motion.p
              className="font-display text-3xl gradient-text-rose sm:text-5xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Receiver located.
            </motion.p>
            <motion.p
              className="mt-4 font-script text-xl text-[var(--gold)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {receiverName}
            </motion.p>
          </motion.div>
        )}

        {/* Opening Memory Portal */}
        {stage === "portal" && (
          <motion.div
            key="portal"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              animate={{ rotate: 360, scale: [1, 1.3, 1] }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{
                filter:
                  "drop-shadow(0 0 30px rgba(255,94,138,0.9)) drop-shadow(0 0 80px rgba(255,94,138,0.5))",
              }}
            >
              🌀
            </motion.div>
            <motion.p
              className="font-script text-xl text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Opening Memory Portal...
            </motion.p>
          </motion.div>
        )}

        {/* Welcome message */}
        {stage === "welcome" && (
          <motion.div
            key="welcome"
            className="max-w-xl px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="font-display text-3xl gradient-text-rose sm:text-5xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Welcome, {receiverName}
            </motion.p>
            <motion.p
              className="mt-6 font-script text-lg leading-relaxed text-white/70 sm:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Someone spent an unreasonable amount of time
              <br />
              creating this world just for you.
            </motion.p>
            <motion.p
              className="mt-4 font-script text-base text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
            >
              Take your time. Nothing here is meant to be rushed.
            </motion.p>
          </motion.div>
        )}

        {/* Loading butterflies */}
        {stage === "butterflies" && (
          <motion.div
            key="butterflies"
            className="flex flex-col items-center gap-4 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="font-script text-base text-white/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading butterflies...
            </motion.p>
            <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)]"
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
                style={{ boxShadow: "0 0 12px rgba(255,94,138,0.6)" }}
              />
            </div>
            {progress >= 100 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-display text-sm text-[var(--gold)]"
              >
                Complete.
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Enter world */}
        {stage === "enter" && (
          <motion.div
            key="enter"
            className="text-7xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: 1 }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              filter:
                "drop-shadow(0 0 40px rgba(255,94,138,1)) drop-shadow(0 0 120px rgba(255,94,138,0.7))",
            }}
          >
            💖
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles during opening */}
      {(stage === "welcome" || stage === "butterflies" || stage === "enter") && (
        <div className="pointer-events-none absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-lg"
              style={{
                left: `${15 + i * 10}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              {["🦋", "✨", "💖", "🌸"][i % 4]}
            </motion.span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
