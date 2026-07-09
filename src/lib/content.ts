import type {
  AchievementKey,
  CollectableKey,
} from "./experience-store";

export const COLLECTABLE_META: Record<
  CollectableKey,
  { label: string; emoji: string; color: string }
> = {
  flower: { label: "Flower", emoji: "🌸", color: "#ff8fab" },
  star: { label: "Star", emoji: "⭐", color: "#ffd166" },
  chocolate: { label: "Chocolate", emoji: "🍫", color: "#c8966a" },
  letter: { label: "Love Letter", emoji: "💌", color: "#ff5e8a" },
  heart: { label: "Heart", emoji: "❤️", color: "#ff3b6b" },
  rose: { label: "Rose", emoji: "🌹", color: "#e11d48" },
  note: { label: "Music Note", emoji: "🎵", color: "#7ae7ff" },
  goldenHeart: { label: "Golden Heart", emoji: "💛", color: "#ffd166" },
  sparkle: { label: "Sparkle", emoji: "✨", color: "#fff3c4" },
  coin: { label: "Coin", emoji: "🪙", color: "#f5d77a" },
  diamond: { label: "Diamond", emoji: "💎", color: "#7ae7ff" },
  key: { label: "Magic Key", emoji: "🗝️", color: "#ffd166" },
};

export const ACHIEVEMENT_META: Record<
  AchievementKey,
  { label: string; emoji: string; desc: string }
> = {
  firstStep: {
    label: "First Step",
    emoji: "👣",
    desc: "You began the journey.",
  },
  heartHunter: {
    label: "Heart Hunter",
    emoji: "🏹",
    desc: "Caught 10 falling hearts.",
  },
  memoryMaster: {
    label: "Cupid Certified",
    emoji: "💞",
    desc: "Matched every pair from memory.",
  },
  hiddenFinder: {
    label: "Treasure Finder",
    emoji: "🔍",
    desc: "Found the hidden heart.",
  },
  cupid: {
    label: "Master of Romance",
    emoji: "💘",
    desc: "Completed all the games.",
  },
  butterflyWhisperer: {
    label: "Butterfly Whisperer",
    emoji: "🦋",
    desc: "A butterfly landed on your cursor.",
  },
  flowerCollector: {
    label: "Flower Collector",
    emoji: "💐",
    desc: "Collected 10 flowers.",
  },
  chaosSurvivor: {
    label: "Chaos Survivor",
    emoji: "🌀",
    desc: "Survived the NO button's mischief.",
  },
  loveSpeedrunner: {
    label: "Love Speedrunner",
    emoji: "⚡",
    desc: "Reached the question in record time.",
  },
  konami: {
    label: "Secret Keeper",
    emoji: "🎮",
    desc: "Entered the legendary code.",
  },
  explorer: {
    label: "Galaxy Explorer",
    emoji: "🔭",
    desc: "Discovered a hidden command.",
  },
  constellation: {
    label: "Star Weaver",
    emoji: "🌟",
    desc: "Connected the constellations.",
  },
};

export const COLLECTABLE_ORDER: CollectableKey[] = [
  "flower",
  "star",
  "heart",
  "rose",
  "chocolate",
  "note",
  "sparkle",
  "coin",
  "goldenHeart",
  "diamond",
  "key",
  "letter",
];

export const FUNNY_POPUPS = [
  "Loading butterflies...",
  "Downloading courage...",
  "Compiling romance...",
  "Checking heart status...",
  "Finding happiness...",
  "Love.exe running...",
  "Searching universe...",
  "Found one person.",
  "Installing memories...",
  "Error 404: Cold heart not found.",
  "Brewing affection...",
  "Calibrating butterflies...",
  "Polishing stars...",
  "Whispering sweet nothings...",
  "Untangling heartstrings...",
  "Warming up the moon...",
  "Rehearsing the question...",
  "Charging cupid's arrow...",
  "Reorganizing the cosmos...",
  "Fluffing the clouds...",
];
