"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, Sparkles } from "lucide-react";
import { useExperience } from "@/lib/experience-store";
import { HeartCatch } from "@/components/games/HeartCatch";
import { MemoryMatch } from "@/components/games/MemoryMatch";
import { FindHiddenHeart } from "@/components/games/FindHiddenHeart";
import { CupidArrow } from "@/components/games/CupidArrow";
import { SpinTheWheel } from "@/components/games/SpinTheWheel";
import { WhackAHeart } from "@/components/games/WhackAHeart";
import { BubblePop } from "@/components/games/BubblePop";
import { TreasureHunt } from "@/components/games/TreasureHunt";
import { ReactionTest } from "@/components/games/ReactionTest";
import { BuildABouquet } from "@/components/games/BuildABouquet";
import { triggerFunnyPopup } from "./FunnyPopups";
import { playChime, playFlourish, vibrate } from "@/lib/sound";

/**
 * A "scene" is either an intro, a pre-question, an interstitial, or a game.
 * Games are dynamically included based on the sender's mini-games selection.
 */
type Scene =
  | { kind: "intro" }
  | { kind: "prequestion" }
  | { kind: "interstitial"; emoji: string; title: string; body: string }
  | { kind: "game"; gameKey: string; title: string; subtitle: string; onWin: () => void };

/**
 * Registry of all games. The order here defines the default journey order.
 * Each game has an interstitial that precedes it (except the first).
 */
const GAME_REGISTRY: {
  key: string;
  title: string;
  subtitle: string;
  interstitial: { emoji: string; title: string; body: string };
  rewards: { collectables: [string, number][]; achievement?: string; popup: string };
}[] = [
  {
    key: "heartcatch",
    title: "Heart Catch",
    subtitle: "Catch the falling hearts. The golden ones count triple.",
    interstitial: { emoji: "🧺", title: "Let's begin.", body: "A warm-up. Catch the hearts as they fall." },
    rewards: { collectables: [["flower", 3]], achievement: "heartHunter", popup: "Loading butterflies..." },
  },
  {
    key: "memory",
    title: "Memory of Us",
    subtitle: "Flip the cards. Find every matching pair.",
    interstitial: { emoji: "🃏", title: "Butterflies loaded.", body: "That was just the warm-up. Memory next." },
    rewards: { collectables: [["rose", 2]], popup: "Compiling romance..." },
  },
  {
    key: "hidden",
    title: "The Hidden Heart",
    subtitle: "One true heart hides among the ordinary. Find it.",
    interstitial: { emoji: "🔍", title: "Look closer.", body: "Somewhere among these, one true heart is hiding." },
    rewards: { collectables: [["diamond", 1]], achievement: "hiddenFinder", popup: "Installing memories..." },
  },
  {
    key: "whack",
    title: "Whack-a-Heart",
    subtitle: "Hearts pop up fast. Tap them before they hide again.",
    interstitial: { emoji: "🔨", title: "Quick!", body: "Hearts are popping up everywhere. Don't let them hide." },
    rewards: { collectables: [["rose", 3], ["chocolate", 2]], achievement: "heartHunter", popup: "Polishing reflexes..." },
  },
  {
    key: "cupid",
    title: "Cupid's Arrow",
    subtitle: "Aim with your cursor. Click to release. Strike the wandering hearts.",
    interstitial: { emoji: "🏹", title: "Cupid's turn.", body: "You've proven your eyes and your memory. Now prove your aim." },
    rewards: { collectables: [["rose", 3], ["note", 2]], achievement: "cupid", popup: "Charging cupid's arrow..." },
  },
  {
    key: "wheel",
    title: "Wheel of Love",
    subtitle: "Spin twice. Each spin gifts a treasure.",
    interstitial: { emoji: "🎡", title: "One more surprise.", body: "The wheel of love wants to gift you something. Spin it twice." },
    rewards: { collectables: [["key", 1]], popup: "Wrapping your gifts..." },
  },
  {
    key: "bubble",
    title: "Bubble Hearts",
    subtitle: "Tap the floating hearts before they drift into the sky.",
    interstitial: { emoji: "🫧", title: "Almost there.", body: "Two last surprises await. Pop the floating hearts." },
    rewards: { collectables: [["rose", 2], ["sparkle", 3]], popup: "Catching drifting wishes..." },
  },
  {
    key: "treasure",
    title: "Treasure in the Sand",
    subtitle: "A chest is buried here. Dig carefully — only 12 tries before the tide returns.",
    interstitial: { emoji: "🗝️", title: "Dig deep.", body: "A treasure chest is buried in the sand. Find it." },
    rewards: { collectables: [["diamond", 1], ["key", 1]], popup: "Unearthing forever..." },
  },
  {
    key: "reaction",
    title: "Heart Reflex",
    subtitle: "Wait for the heart to light up. Tap as fast as you can.",
    interstitial: { emoji: "⚡", title: "Two final tests.", body: "First, prove your reflexes." },
    rewards: { collectables: [["sparkle", 4], ["goldenHeart", 2]], popup: "Calibrating reflexes..." },
  },
  {
    key: "bouquet",
    title: "Build a Bouquet",
    subtitle: "Pick 6 flowers from the garden. Each one is for them.",
    interstitial: { emoji: "💐", title: "A gift.", body: "Gather a bouquet worthy of them." },
    rewards: { collectables: [["rose", 3], ["flower", 5]], popup: "Arranging petals..." },
  },
];

export function Journey() {
  const scene = useExperience((s) => s.currentScene);
  const advance = useExperience((s) => s.advanceScene);
  const setPhase = useExperience((s) => s.setPhase);
  const unlock = useExperience((s) => s.unlockAchievement);
  const addCollectable = useExperience((s) => s.addCollectable);
  const settings = useExperience((s) => s.settings);
  const startTimeRef = useRef(Date.now());

  // Build the dynamic scene list from the sender's mini-games selection.
  // Always starts with intro and ends with prequestion.
  // Each selected game is preceded by an interstitial (except after intro).
  const scenes = useMemo<Scene[]>(() => {
    const selected = settings.miniGames.length > 0
      ? settings.miniGames
      : GAME_REGISTRY.map((g) => g.key);
    // Preserve registry order, filtered by selection
    const orderedGames = GAME_REGISTRY.filter((g) => selected.includes(g.key));
    const list: Scene[] = [{ kind: "intro" }];
    orderedGames.forEach((g, i) => {
      // Add interstitial before each game (skip for the first game right after intro)
      if (i > 0 || list.length > 1) {
        list.push({ kind: "interstitial", ...g.interstitial });
      }
      list.push({
        kind: "game",
        gameKey: g.key,
        title: g.title,
        subtitle: g.subtitle,
        onWin: () => {
          g.rewards.collectables.forEach(([k, n]) =>
            addCollectable(k as never, n)
          );
          if (g.rewards.achievement) unlock(g.rewards.achievement as never);
          playFlourish();
          vibrate([40, 60, 40]);
          triggerFunnyPopup(g.rewards.popup);
          setTimeout(next, 400);
        },
      });
    });
    list.push({ kind: "prequestion" });
    return list;
    // miniGamesKey is a stable string representation of the selection
  }, [settings.miniGames]);

  const current = scenes[Math.min(scene, scenes.length - 1)] ?? { kind: "prequestion" as const };

  useEffect(() => {
    if (scene === 0) {
      startTimeRef.current = Date.now();
      unlock("firstStep");
    }
  }, [scene, unlock]);

  const next = () => {
    if (scene >= scenes.length - 1) {
      setPhase("question");
    } else {
      advance();
    }
  };

  // Surprise constellation scene — injected between certain games
  // (keep the original "surprise" behavior by inserting it after the 3rd game)
  const surpriseScene = useMemo(() => {
    // find the index after the 3rd game
    let gameCount = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].kind === "game") {
        gameCount++;
        if (gameCount === 3) return i + 1;
      }
    }
    return -1;
  }, [scenes]);

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {current.kind === "intro" && <IntroScene onContinue={next} />}
          {current.kind === "prequestion" && (
            <IntroScene prequestion onContinue={() => setPhase("question")} />
          )}
          {current.kind === "interstitial" && (
            <InterstitialScene
              emoji={current.emoji}
              title={current.title}
              body={current.body}
              onContinue={next}
            />
          )}
          {current.kind === "game" && (
            <GameScene
              key={current.gameKey + scene}
              title={current.title}
              subtitle={current.subtitle}
              onWin={current.onWin}
            >
              {(handleWin) => renderGame(current.gameKey, handleWin)}
            </GameScene>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Top progress bar */}
      <div className="fixed inset-x-0 top-0 z-20 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--rose-glow)] via-[#ff8e72] to-[var(--gold)]"
          initial={{ width: 0 }}
          animate={{
            width: `${((scene + 1) / scenes.length) * 100}%`,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ boxShadow: "0 0 12px rgba(255,94,138,0.6)" }}
        />
      </div>

      {/* Scene counter pill */}
      <div className="fixed right-4 top-10 z-20 hidden rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/50 sm:right-6 sm:top-12 sm:block">
        {scene + 1} / {scenes.length}
      </div>

      {/* Love meter */}
      <div className="fixed left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-1 sm:flex">
        <div className="relative h-24 w-6 overflow-hidden rounded-full border border-white/15 bg-white/5">
          <motion.div
            className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-[var(--rose-glow)] to-[var(--gold)]"
            initial={{ height: 0 }}
            animate={{
              height: `${((scene + 1) / scenes.length) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ boxShadow: "0 0 12px rgba(255,94,138,0.5)" }}
          />
        </div>
        <span className="text-xs">💗</span>
      </div>

      {/* Progress dots */}
      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {scenes.map((_, i) => (
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

function renderGame(gameKey: string, onWin: () => void) {
  switch (gameKey) {
    case "heartcatch":
      return <HeartCatch onWin={onWin} />;
    case "memory":
      return <MemoryMatch onWin={onWin} />;
    case "hidden":
      return <FindHiddenHeart onWin={onWin} />;
    case "whack":
      return <WhackAHeart onWin={onWin} />;
    case "cupid":
      return <CupidArrow onWin={onWin} />;
    case "wheel":
      return <SpinTheWheel onWin={onWin} />;
    case "bubble":
      return <BubblePop onWin={onWin} />;
    case "treasure":
      return <TreasureHunt onWin={onWin} />;
    case "reaction":
      return <ReactionTest onWin={onWin} />;
    case "bouquet":
      return <BuildABouquet onWin={onWin} />;
    default:
      return <HeartCatch onWin={onWin} />;
  }
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
          : "Before I ask you something important, let's have a little fun together. Each game unlocks a surprise."}
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
  const [retryKey, setRetryKey] = useState(0);

  const handleWin = () => {
    setDone(true);
    onWin();
  };

  const skip = () => {
    setDone(true);
    onWin();
  };

  const retry = () => {
    setDone(false);
    setRetryKey((k) => k + 1);
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-3xl gradient-text-rose sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mb-6 mt-2 max-w-md font-script text-lg text-white/60">
        {subtitle}
      </p>
      <div key={retryKey} className="flex justify-center">
        {children(handleWin)}
      </div>
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

      {/* Skip + Retry controls — always visible, mobile-friendly */}
      {!done && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={retry}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white/90 active:scale-95 sm:text-sm"
          >
            <span className="text-base">↺</span>
            <span className="hidden sm:inline">Retry</span>
          </button>
          <button
            onClick={skip}
            className="flex items-center gap-1.5 rounded-full border border-[var(--rose-glow)]/30 bg-[var(--rose-glow)]/10 px-4 py-2 text-xs text-[var(--rose-glow)] transition-colors hover:bg-[var(--rose-glow)]/20 active:scale-95 sm:text-sm"
          >
            <span className="text-base">⏭</span>
            <span className="hidden sm:inline">Skip</span>
          </button>
        </div>
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
