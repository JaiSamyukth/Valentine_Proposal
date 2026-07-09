"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted, resumeAudio, startAmbient } from "@/lib/sound";

export function MuteButton() {
  const [muted, setMutedState] = useState(false);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) {
      resumeAudio();
      startAmbient();
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Unmute" : "Mute"}
      className="fixed right-4 top-4 z-[88] flex h-9 w-9 items-center justify-center rounded-full glass text-white/80 transition-all hover:glass-strong sm:right-6 sm:top-6 btn-bouncy"
    >
      {muted ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4 text-[var(--rose-glow)]" />
      )}
    </button>
  );
}
