"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, Sparkles } from "lucide-react";
import { useExperience } from "@/lib/experience-store";
import { HeartCatch } from "@/components/games/HeartCatch";
import { MemoryMatch } from "@/components/games/MemoryMatch";
import { FindHiddenHeart } from "@/components/games/FindHiddenHeart";
import { triggerFunnyPopup } from "./FunnyPopups";
import { playChime, playFlourish, vibrate } from "@/lib/sound";

type SceneKind =
  | "intro"
  | "heartcatch"
  | "interstitial1"
  | "memory"
  | "surprise"
  | "hidden"
  | "prequestion";

const SCENES: SceneKind[] = [
  "intro",
  "heartcatch",
  "interstitial1",
  "memory",
  "surprise",
  "hidden",
  "prequestion",
];

export function Journey() {
  const scene = useExperience((s) => s.currentScene);
  const advance = useExperience((s) => s.advanceScene);
  const setPhase = useExperience((s) => s.setPhase);
  const unlock = useExperience((s) => s.unlockAchievement);
  const addCollectable = useExperience((s) => s.addCollectable);
  const settings = useExperience((s) => s.settings);
  const current = SCENES[scene] ?? "prequestion";
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (scene === 0) {
      startTimeRef.current = Date.now();
      unlock("firstStep");
    }
  }, [scene, unlock]);

  const next = () => {
    if (scene >= SCENES.length - 1) {
      setPhase("question");
    } else {
      advance();
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {current === "intro" && <IntroScene onContinue={next} />}
          {current === "heartcatch" && (
            <GameScene
              title="Heart Catch"
              subtitle="Catch the falling hearts. The golden ones count triple."
              onWin={() => {
                unlock("heartHunter");
                addCollectable("flower", 3);
                playFlourish();
                vibrate([40, 60, 40]);
                triggerFunnyPopup("Loading butterflies...");
                setTimeout(next, 400);
              }}
            >
              {(handleWin) => <HeartCatch onWin={handleWin} />}
            </GameScene>
          )}
          {current === "interstitial1" && (
            <InterstitialScene
              emoji="🦋"
              title="Butterflies loaded."
              body="That was just the warm-up. Memory next — let's see if your heart remembers what your eyes saw."
              onContinue={next}
            />
          )}
          {current === "memory" && (
            <GameScene
              title="Memory of Us"
              subtitle="Flip the cards. Find every matching pair."
              onWin={() => {
                addCollectable("rose", 2);
                triggerFunnyPopup("Compiling romance...");
                setTimeout(next, 400);
              }}
            >
              {(handleWin) => <MemoryMatch onWin={handleWin} />}
            </GameScene>
          )}
          {current === "surprise" && (
            <SurpriseScene
              onDone={() => {
                unlock("constellation");
                next();
              }}
            />
          )}
          {current === "hidden" && (
            <GameScene
              title="The Hidden Heart"
              subtitle="One true heart hides among the ordinary. Find it."
              onWin={() => {
                addCollectable("diamond", 1);
                triggerFunnyPopup("Installing memories...");
                setTimeout(next, 400);
              }}
            >
              {(handleWin) => <FindHiddenHeart onWin={handleWin} />}
            </GameScene>
          )}
          {current === "prequestion" && (
            <IntroScene
              prequestion
              onContinue={() => setPhase("question")}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SCENES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === scene
                ? "w-8 bg-[var(--rose-glow)] glow-rose"
                : i < scene
                ? "w-3 bg-[var(--gold)]/60"
                : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function IntroScene({
  onContinue,
  prequestion,
}: {
  onContinue: () => void;
  prequestion?: boolean;
}) {
  const settings = useExperience((s) => s.settings);
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="mx-auto mb-6 text-7xl"
        style={{
          filter:
            "drop-shadow(0 0 24px rgba(255,94,138,0.7)) drop-shadow(0 0 60px rgba(255,94,138,0.4))",
        }}
      >
        {prequestion ? "💌" : "✨"}
      </motion.div>
      <h2 className="font-display text-3xl leading-tight gradient-text-rose sm:text-4xl">
        {prequestion
          ? `${settings.receiverName || "You"}, there's something I've been wanting to ask...`
          : `Welcome, ${settings.receiverName || "friend"}.`}
      </h2>
      <p className="mx-auto mt-4 max-w-md font-script text-xl text-white/70">
        {prequestion
          ? "But first — a little adventure. You've come this far. One more step."
          : "Before I ask you something important, let's have a little fun together. Three tiny games. Each one unlocks a surprise."}
      </p>
      <ContinueButton onClick={onContinue} label={prequestion ? "I'm ready" : "Let's begin"} />
    </div>
  );
}

function GameScene({
  title,
  subtitle,
  onWin,
  children,
}: {
  title: string;
  subtitle: string;
  onWin: () => void;
  children: (handleWin: () => void) => React.ReactNode;
}) {
  const [done, setDone] = useState(false);

  const handleWin = () => {
    setDone(true);
    onWin();
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-3xl gradient-text-rose sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mb-6 mt-2 max-w-md font-script text-lg text-white/60">
        {subtitle}
      </p>
      <div className="flex justify-center">{children(handleWin)}</div>
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <span className="font-script text-lg text-[var(--gold)]">
            Beautifully done. ✨
          </span>
        </motion.div>
      )}
    </div>
  );
}

function InterstitialScene({
  emoji,
  title,
  body,
  onContinue,
}: {
  emoji: string;
  title: string;
  body: string;
  onContinue: () => void;
}) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0, rotate: 30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="mx-auto mb-6 text-7xl animate-float-soft"
      >
        {emoji}
      </motion.div>
      <h2 className="font-display text-3xl gradient-text-gold sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-md font-script text-xl text-white/70">
        {body}
      </p>
      <ContinueButton onClick={onContinue} label="Onwards" />
    </div>
  );
}

function SurpriseScene({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    // constellation: draw lines via confetti bursts
    const points = [
      { x: 0.2, y: 0.3 },
      { x: 0.35, y: 0.25 },
      { x: 0.5, y: 0.35 },
      { x: 0.65, y: 0.28 },
      { x: 0.8, y: 0.4 },
      { x: 0.5, y: 0.6 },
    ];
    points.forEach((p, i) => {
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 360,
          startVelocity: 0,
          origin: p,
          shapes: ["⭐"],
          scalar: 1.5,
          gravity: 0,
          ticks: 200,
        });
        playChime(600 + i * 80, 0.5);
      }, i * 350);
    });
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        shapes: ["✨", "💫"],
      });
      onDone();
    }, 2800);
  }, [onDone]);

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto mb-6 text-7xl animate-twinkle"
      >
        🌟
      </motion.div>
      <h2 className="font-display text-3xl gradient-text-gold sm:text-4xl">
        Look up.
      </h2>
      <p className="mx-auto mt-4 max-w-md font-script text-xl text-white/70">
        The stars are aligning into something... familiar.
      </p>
    </div>
  );
}

function ContinueButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] px-7 py-3 font-display text-base text-black glow-rose btn-bouncy"
    >
      <Sparkles className="h-4 w-4" />
      {label}
      <ArrowRight className="h-4 w-4" />
    </motion.button>
  );
}
