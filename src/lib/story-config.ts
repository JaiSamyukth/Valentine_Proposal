import type { ThemeKey } from "./experience-store";

/**
 * The full configuration for a personalized love-story experience.
 * Created by the sender in the Builder Dashboard, persisted to the DB,
 * and loaded by the receiver via a unique /story/:id URL.
 */

export interface StoryConfig {
  // required
  senderName: string;
  receiverName: string;

  // story & dialogue
  quote: string;
  message: string;
  petName: string;
  chapters: { title: string; body: string }[];
  dialogues: { text: string; emotion: "warm" | "funny" | "suspense" | "reveal" }[];
  reasons: string[];
  timeline: { date: string; title: string; emoji: string }[];

  // media
  photos: string[]; // URLs (object URLs for same-browser, or hosted)
  voiceNoteUrl: string;
  spotifyUrl: string;
  youtubeUrl: string;
  backgroundMusic: string;

  // world customization
  theme: ThemeKey;
  favoriteColor: string;
  particleIntensity: "calm" | "normal" | "party";
  animationSpeed: number; // 0.5 - 2.0
  weather: "clear" | "rain" | "snow" | "aurora" | "stars";
  timeOfDay: "dawn" | "day" | "dusk" | "night";

  // gameplay
  miniGames: string[]; // selected game keys
  difficulty: "gentle" | "normal" | "challenging";

  // ending
  endingStyle: "fireworks" | "lanterns" | "constellation" | "sunrise";
  confettiStyle: "hearts" | "roses" | "stars" | "mixed";

  // secrets
  secretCode: string;
  secretMessage: string;

  // AI-generated
  aiPoem: string;
  aiCompliment: string;

  // date
  dateSuggestion: string;
  countdownTarget: string;
}

export const DEFAULT_STORY_CONFIG: StoryConfig = {
  senderName: "",
  receiverName: "",
  quote: "",
  message: "",
  petName: "",
  chapters: [],
  dialogues: [],
  reasons: [],
  timeline: [],
  photos: [],
  voiceNoteUrl: "",
  spotifyUrl: "",
  youtubeUrl: "",
  backgroundMusic: "",
  theme: "aurora",
  favoriteColor: "#ff5e8a",
  particleIntensity: "normal",
  animationSpeed: 1,
  weather: "clear",
  timeOfDay: "night",
  miniGames: ["heartcatch", "memory", "hidden", "whack", "cupid", "wheel", "sliding", "bubble", "treasure", "reaction", "bouquet"],
  difficulty: "normal",
  endingStyle: "fireworks",
  confettiStyle: "mixed",
  secretCode: "",
  secretMessage: "",
  aiPoem: "",
  aiCompliment: "",
  dateSuggestion: "",
  countdownTarget: "",
};

/**
 * Generate a short, readable, unique story ID.
 */
export function generateStoryId(): string {
  const chars = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Generate a deterministic procedural seed from a story ID.
 * The seed controls weather, NPC behavior, particle variations, etc.
 */
export function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * A seeded pseudo-random number generator (mulberry32).
 * Returns a function that produces deterministic floats in [0, 1).
 */
export function makeRng(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
