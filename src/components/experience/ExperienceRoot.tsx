"use client";

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

export function ExperienceRoot() {
  const phase = useExperience((s) => s.phase);
  const setPhase = useExperience((s) => s.setPhase);
  const settings = useExperience((s) => s.settings);

  const intensity =
    phase === "finale" ? "party" : phase === "boot" ? "calm" : "normal";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Living world layers (hidden during boot black screen) */}
      {phase !== "boot" && (
        <>
          <AuroraLayer theme={settings.theme} />
          <LivingBackground theme={settings.theme} intensity={intensity} />
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
        {phase === "boot" && (
          <motion.div
            key="boot"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <OpeningSequence onDone={() => setPhase("setup")} />
          </motion.div>
        )}

        {phase === "setup" && (
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
      <FunnyPopups />
      <AchievementToasts />
      <SecretListener />

      {/* Reset link (subtle, bottom) */}
      {phase !== "boot" && phase !== "setup" && (
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

