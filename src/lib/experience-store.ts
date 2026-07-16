"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Phase = "boot" | "setup" | "journey" | "question" | "finale";

export type ThemeKey =
  | "aurora"
  | "galaxy"
  | "blossom"
  | "sunset"
  | "forest"
  | "ocean"
  | "luxury";

export interface ExperienceSettings {
  senderName: string;
  receiverName: string;
  quote: string;
  message: string;
  theme: ThemeKey;
  favoriteColor: string;
  dateSuggestion: string;
  petName: string;
  secretCode: string;
  spotifyUrl: string;
  youtubeUrl: string;
  reasons: string[];
  timeline: { date: string; title: string; emoji: string }[];
  miniGames: string[];
  aiPoem: string;
  aiCompliment: string;
}

export type CollectableKey =
  | "flower"
  | "star"
  | "chocolate"
  | "letter"
  | "heart"
  | "rose"
  | "note"
  | "goldenHeart"
  | "sparkle"
  | "coin"
  | "diamond"
  | "key";

export type AchievementKey =
  | "firstStep"
  | "heartHunter"
  | "memoryMaster"
  | "hiddenFinder"
  | "cupid"
  | "butterflyWhisperer"
  | "flowerCollector"
  | "chaosSurvivor"
  | "loveSpeedrunner"
  | "konami"
  | "explorer"
  | "constellation";

interface ExperienceState {
  phase: Phase;
  settings: ExperienceSettings;
  collectables: Record<CollectableKey, number>;
  achievements: AchievementKey[];
  unlockedScenes: number;
  currentScene: number;
  yesPressed: boolean;
  noAttempts: number;
  bootSeen: boolean;
  // actions
  setPhase: (p: Phase) => void;
  updateSettings: (s: Partial<ExperienceSettings>) => void;
  addCollectable: (k: CollectableKey, n?: number) => void;
  unlockAchievement: (a: AchievementKey) => void;
  advanceScene: () => void;
  setScene: (i: number) => void;
  registerNo: () => void;
  setYes: () => void;
  addReason: (r: string) => void;
  removeReason: (i: number) => void;
  addTimelineEntry: (e: { date: string; title: string; emoji: string }) => void;
  removeTimelineEntry: (i: number) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: ExperienceSettings = {
  senderName: "",
  receiverName: "",
  quote: "",
  message: "",
  theme: "aurora",
  favoriteColor: "#ff5e8a",
  dateSuggestion: "",
  petName: "",
  secretCode: "",
  spotifyUrl: "",
  youtubeUrl: "",
  reasons: [],
  timeline: [],
  miniGames: ["heartcatch", "memory", "hidden", "whack", "cupid", "wheel", "bubble", "treasure", "reaction", "bouquet"],
  aiPoem: "",
  aiCompliment: "",
};

const DEFAULT_COLLECTABLES: Record<CollectableKey, number> = {
  flower: 0,
  star: 0,
  chocolate: 0,
  letter: 0,
  heart: 0,
  rose: 0,
  note: 0,
  goldenHeart: 0,
  sparkle: 0,
  coin: 0,
  diamond: 0,
  key: 0,
};

export const useExperience = create<ExperienceState>()(
  persist(
    (set, get) => ({
      phase: "boot",
      settings: DEFAULT_SETTINGS,
      collectables: DEFAULT_COLLECTABLES,
      achievements: [],
      unlockedScenes: 0,
      currentScene: 0,
      yesPressed: false,
      noAttempts: 0,
      bootSeen: false,

      setPhase: (p) => set({ phase: p }),
      updateSettings: (s) =>
        set((st) => ({ settings: { ...st.settings, ...s } })),
      addCollectable: (k, n = 1) =>
        set((st) => ({
          collectables: { ...st.collectables, [k]: st.collectables[k] + n },
        })),
      unlockAchievement: (a) => {
        if (get().achievements.includes(a)) return;
        set((st) => ({ achievements: [...st.achievements, a] }));
        // Dispatch a window event so listeners (toasts) can react without
        // setState-in-effect anti-patterns.
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("achievement-unlocked", { detail: a })
          );
        }
      },
      advanceScene: () =>
        set((st) => ({
          currentScene: st.currentScene + 1,
          unlockedScenes: Math.max(st.unlockedScenes, st.currentScene + 1),
        })),
      setScene: (i) => set({ currentScene: i }),
      registerNo: () => set((st) => ({ noAttempts: st.noAttempts + 1 })),
      setYes: () => set({ yesPressed: true }),
      addReason: (r) =>
        set((st) => ({
          settings: { ...st.settings, reasons: [...st.settings.reasons, r] },
        })),
      removeReason: (i) =>
        set((st) => ({
          settings: {
            ...st.settings,
            reasons: st.settings.reasons.filter((_, idx) => idx !== i),
          },
        })),
      addTimelineEntry: (e) =>
        set((st) => ({
          settings: {
            ...st.settings,
            timeline: [...st.settings.timeline, e],
          },
        })),
      removeTimelineEntry: (i) =>
        set((st) => ({
          settings: {
            ...st.settings,
            timeline: st.settings.timeline.filter((_, idx) => idx !== i),
          },
        })),
      reset: () =>
        set({
          phase: "boot",
          settings: DEFAULT_SETTINGS,
          collectables: DEFAULT_COLLECTABLES,
          achievements: [],
          unlockedScenes: 0,
          currentScene: 0,
          yesPressed: false,
          noAttempts: 0,
          bootSeen: false,
        }),
    }),
    {
      name: "love-experience-v1",
      partialize: (s) => ({
        settings: s.settings,
        collectables: s.collectables,
        achievements: s.achievements,
        bootSeen: s.bootSeen,
      }),
    }
  )
);
