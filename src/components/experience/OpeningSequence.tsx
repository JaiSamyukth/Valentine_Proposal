"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTypewriter } from "@/hooks/use-typewriter";
import { playHeartbeat, vibrate, resumeAudio, startAmbient } from "@/lib/sound";
import { useExperience } from "@/lib/experience-store";

type Stage = "black" | "beat" | "line1" | "line2" | "entrance";

export function OpeningSequence({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("black");
  const [skipReady, setSkipReady] = useState(false);
  const bootSeen = useExperience((s) => s.bootSeen);
  const updateSettings = useExperience((s) => s.updateSettings);

  const line1 = useTypewriter("You've just received something...", 55, 0, true);
  const line2 = useTypewriter("...that someone spent courage on.", 55, 0, true);

  // Skip if user has seen the boot before — go straight in but still show the beat
  useEffect(() => {
    const t = setTimeout(() => setSkipReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  const begin = () => {
    resumeAudio();
    startAmbient();
    // heartbeat loop
    const beat = () => playHeartbeat(1);
    beat();
    const interval = setInterval(beat, 1400);
    vibrate([60, 80, 60]);
    setStage("beat");
    // after a few beats, show line 1
    const t1 = setTimeout(() => setStage("line1"), 2600);
    const t2 = setTimeout(() => setStage("line2"), 6000);
    const t3 = setTimeout(() => setStage("entrance"), 9200);
    const t4 = setTimeout(() => {
      clearInterval(interval);
      onDone();
    }, 11500);
    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  // Start automatically on first user gesture (click anywhere)
  useEffect(() => {
    if (stage !== "black") return;
    const onFirst = () => {
      begin();
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
    if (skipReady) {
      window.addEventListener("pointerdown", onFirst, { once: true });
      window.addEventListener("keydown", onFirst, { once: true });
    }
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
  }, [skipReady, stage]);

  const skip = () => {
    resumeAudio();
    startAmbient();
    onDone();
  };

  // mark boot seen
  useEffect(() => {
    if (bootSeen) {
      // still show a brief version
    }
  }, [bootSeen]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{
        opacity: stage === "entrance" ? 0 : 1,
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Glowing heart */}
      <AnimatePresence mode="wait">
        {stage === "black" && (
          <motion.div
            key="black"
            className="flex flex-col items-center gap-8 px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-5xl"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span
                className="inline-block animate-heartbeat"
                style={{
                  filter:
                    "drop-shadow(0 0 12px rgba(255,94,138,0.9)) drop-shadow(0 0 40px rgba(255,94,138,0.5))",
                }}
              >
                ❤️
              </span>
            </motion.div>
            {skipReady && (
              <motion.button
                onClick={skip}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs uppercase tracking-[0.3em] text-white/40 hover:text-white/80 transition-colors"
              >
                tap to begin · or click to skip
              </motion.button>
            )}
          </motion.div>
        )}

        {stage === "beat" && (
          <motion.div
            key="beat"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1, 1.18, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                filter:
                  "drop-shadow(0 0 20px rgba(255,94,138,1)) drop-shadow(0 0 60px rgba(255,94,138,0.6))",
              }}
              className="text-7xl sm:text-8xl"
            >
              ❤️
            </motion.div>
          </motion.div>
        )}

        {(stage === "line1" || stage === "line2") && (
          <motion.div
            key="lines"
            className="flex max-w-2xl flex-col items-center gap-6 px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-4xl sm:text-5xl"
              animate={{ scale: [1, 1.25, 1, 1.18, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                filter:
                  "drop-shadow(0 0 20px rgba(255,94,138,0.9)) drop-shadow(0 0 60px rgba(255,94,138,0.5))",
              }}
            >
              ❤️
            </motion.div>
            <p className="font-script text-2xl leading-relaxed text-white/90 sm:text-3xl">
              <span className="typing-caret">{line1.display}</span>
            </p>
            {stage === "line2" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-script text-2xl leading-relaxed text-white/70 sm:text-3xl"
              >
                <span className="typing-caret">{line2.display}</span>
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "entrance" && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.4, 1], rotate: 0 }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-9xl"
            style={{
              filter:
                "drop-shadow(0 0 40px rgba(255,94,138,1)) drop-shadow(0 0 120px rgba(255,94,138,0.7))",
            }}
          >
            💖
          </motion.div>
        </motion.div>
      )}

      {/* Skip button */}
      {skipReady && stage !== "entrance" && (
        <button
          onClick={skip}
          className="absolute bottom-6 right-6 z-[110] text-[10px] uppercase tracking-[0.25em] text-white/30 transition-colors hover:text-white/70"
        >
          skip intro →
        </button>
      )}
    </motion.div>
  );
}
