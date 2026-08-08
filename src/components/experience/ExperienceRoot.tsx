"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { AuroraLayer } from "@/components/world/AuroraLayer";
import { LivingBackground } from "@/components/world/LivingBackground";
import { CursorTrail } from "@/components/world/CursorTrail";
import { OpeningSequence } from "./OpeningSequence";
import { SetupForm } from "./SetupForm";
import { Journey } from "./Journey";
import { Question } from "./Question";
import { Finale } from "./Finale";
import { HUD } from "./HUD";
import { FunnyPopups } from "./FunnyPopups";
import { AchievementToasts } from "./AchievementToasts";
import { SecretListener } from "./SecretListener";
import { WanderingNPCs } from "./WanderingNPCs";
import { MuteButton } from "./MuteButton";
import { CosmicEasterEggs } from "./CosmicEasterEggs";
import { LoveOSOverlay } from "./LoveOSOverlay";
import { MusicPlayer } from "./MusicPlayer";
import { DeveloperRoom } from "./DeveloperRoom";
import { RetroChaosMode } from "./RetroChaosMode";
import { GravityFlipChaos } from "./GravityFlipChaos";
import { FakeBlueScreen } from "./FakeBlueScreen";
import { PortalRoom } from "./PortalRoom";
import { NameInStars } from "./NameInStars";

interface Props {
  /** When true, skips boot+setup and starts directly at the journey (receiver mode). */
  receiverMode?: boolean;
  /** Procedural seed for variation. */
  seed?: number;
}

export function ExperienceRoot({ receiverMode = false, seed }: Props) {
  const phase = useExperience((s) => s.phase);
  const setPhase = useExperience((s) => s.setPhase);
  const settings = useExperience((s) => s.settings);

  // In receiver mode, jump straight to journey
  useEffect(() => {
    if (receiverMode && phase === "boot") {
      setPhase("journey");
    }
  }, [receiverMode, phase, setPhase]);

  const intensity =
    phase === "finale" ? "party" : phase === "boot" ? "calm" : "normal";

  return (
    <div className="relative min-h-screen w-full">
      {/* Living world layers (hidden during boot black screen) */}
      {phase !== "boot" && (
        <>
          <AuroraLayer theme={settings.theme} />
          <LivingBackground theme={settings.theme} intensity={intensity} seed={seed} />
          <CursorTrail />
        </>
      )}

      {/* Film grain + vignette for cinematic feel */}
      {phase !== "boot" && <div className="film-grain" />}
      {phase !== "boot" && <div className="vignette" />}

      {/* Wandering NPCs once journey begins */}
      {(phase === "journey" || phase === "question" || phase === "finale") && (
        <WanderingNPCs theme={settings.theme} />
      )}

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {!receiverMode && phase === "boot" && (
          <motion.div
            key="boot"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <OpeningSequence onDone={() => setPhase("setup")} />
          </motion.div>
        )}

        {!receiverMode && phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SetupForm onBegin={() => setPhase("journey")} />
          </motion.div>
        )}

        {phase === "journey" && (
          <motion.div
            key="journey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Journey />
          </motion.div>
        )}

        {phase === "question" && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Question />
          </motion.div>
        )}

        {phase === "finale" && (
          <motion.div
            key="finale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Finale />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-on UI layers */}
      {phase !== "boot" && <HUD />}
      {phase !== "boot" && <MuteButton />}
      <CosmicEasterEggs />
      <NameInStars />
      <LoveOSOverlay />
      <RetroChaosMode />
      <GravityFlipChaos />
      <FakeBlueScreen />
      <MusicPlayer />
      <DeveloperRoom />
      <PortalRoom />
      <FunnyPopups />
      <AchievementToasts />
      <SecretListener />

      {/* Reset link (subtle, bottom) — hidden in receiver mode */}
      {!receiverMode && phase !== "boot" && phase !== "setup" && (
        <button
          onClick={() => {
            if (confirm("Start over? This resets the experience.")) {
              useExperience.getState().reset();
              setPhase("boot");
            }
          }}
          className="fixed bottom-4 right-4 z-[85] text-[10px] uppercase tracking-[0.25em] text-white/25 transition-colors hover:text-white/60"
        >
          ↺ restart
        </button>
      )}
    </div>
  );
}
