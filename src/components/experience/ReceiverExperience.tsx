"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { StoryConfig } from "@/lib/story-config";
import { ReceiverOpening } from "./ReceiverOpening";
import { ExperienceRoot } from "./ExperienceRoot";
import { useExperience } from "@/lib/experience-store";
import { usePhotos } from "@/lib/photo-store";
import { useVoiceNote } from "@/lib/voice-store";
import { useProgressReporter } from "@/hooks/use-progress-reporter";

interface Props {
  storyId: string;
}

type LoadState = "loading" | "loaded" | "error";

export function ReceiverExperience({ storyId }: Props) {
  const [state, setState] = useState<LoadState>("loading");
  const [config, setConfig] = useState<StoryConfig | null>(null);
  const [seed, setSeed] = useState<number>(0);
  const [opened, setOpened] = useState(false);
  const updateSettings = useExperience((s) => s.updateSettings);
  const addPhoto = usePhotos((s) => s.addPhoto);
  const setVoiceNote = useVoiceNote((s) => s.setNote);

  // Track progress for the sender
  const phase = useExperience((s) => s.phase);
  const scene = useExperience((s) => s.currentScene);
  const yesPressed = useExperience((s) => s.yesPressed);
  const completed = phase === "finale" && yesPressed;

  // Report "opened" immediately when the config loads
  useEffect(() => {
    if (state === "loaded" && config) {
      fetch(`/api/story/${storyId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "opening" }),
      }).catch(() => {});
    }
  }, [state, config, storyId]);

  // Report ongoing progress
  useProgressReporter(
    storyId,
    opened ? phase : "opening",
    scene,
    yesPressed,
    completed
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/story/${storyId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setConfig(data.config);
        setSeed(data.seed);
        updateSettings({
          senderName: data.config.senderName,
          receiverName: data.config.receiverName,
          quote: data.config.quote,
          message: data.config.message,
          theme: data.config.theme,
          favoriteColor: data.config.favoriteColor,
          dateSuggestion: data.config.dateSuggestion,
          petName: data.config.petName,
          secretCode: data.config.secretCode,
          secretMessage: data.config.secretMessage || "",
          spotifyUrl: data.config.spotifyUrl,
          youtubeUrl: data.config.youtubeUrl,
          reasons: data.config.reasons || [],
          timeline: data.config.timeline || [],
          miniGames: data.config.miniGames || [],
          aiPoem: data.config.aiPoem || "",
          aiCompliment: data.config.aiCompliment || "",
        });
        // Hydrate photos from the config (base64 data URLs stored in DB)
        if (data.config.photos && Array.isArray(data.config.photos)) {
          data.config.photos.forEach((url: string, i: number) => {
            addPhoto(url, `photo-${i}`);
          });
        }
        // Hydrate voice note if present (URL stored in config)
        if (data.config.voiceNoteUrl) {
          setVoiceNote(data.config.voiceNoteUrl, 0);
        }
        setState("loaded");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [storyId, updateSettings]);

  if (state === "loading") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--rose-glow)]" />
      </div>
    );
  }

  if (state === "error" || !config) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <div className="text-5xl">💔</div>
        <h2 className="font-display text-2xl text-white/80">
          This story couldn&apos;t be found
        </h2>
        <p className="font-script text-sm text-white/50">
          The link may have expired or been mistyped.
        </p>
        <a
          href="#"
          className="mt-4 rounded-full bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] px-6 py-2 text-sm text-black"
        >
          create your own →
        </a>
      </div>
    );
  }

  if (!opened) {
    return (
      <ReceiverOpening
        config={config}
        onDone={() => setOpened(true)}
      />
    );
  }

  return <ExperienceRoot receiverMode seed={seed} />;
}
