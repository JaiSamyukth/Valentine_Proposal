import type { ThemeKey } from "./experience-store";

export interface ThemeDef {
  key: ThemeKey;
  name: string;
  // CSS gradient stops for the sky background
  sky: string;
  // particle color palette
  particles: string[];
  // accent color
  accent: string;
  // emoji for cursor
  cursorEmoji: string;
  // ambient creature set
  creatures: ("firefly" | "butterfly" | "petal" | "leaf" | "snow" | "star" | "bubble")[];
  description: string;
}

export const THEMES: Record<ThemeKey, ThemeDef> = {
  aurora: {
    key: "aurora",
    name: "Aurora Night",
    sky: "radial-gradient(ellipse 80% 60% at 30% -10%, oklch(0.28 0.18 320 / 0.6), transparent 60%), radial-gradient(ellipse 70% 60% at 75% 0%, oklch(0.30 0.16 200 / 0.5), transparent 60%), radial-gradient(ellipse 90% 70% at 50% 110%, oklch(0.20 0.10 280 / 0.7), transparent 60%), linear-gradient(180deg, oklch(0.08 0.03 290), oklch(0.12 0.04 320))",
    particles: ["#ff5e8a", "#ffd166", "#7ae7ff", "#ff9ecd"],
    accent: "#ff5e8a",
    cursorEmoji: "❤️",
    creatures: ["firefly", "star", "butterfly"],
    description: "Glowing skies and drifting fireflies.",
  },
  galaxy: {
    key: "galaxy",
    name: "Deep Galaxy",
    sky: "radial-gradient(ellipse 90% 60% at 50% 0%, oklch(0.30 0.20 290 / 0.7), transparent 60%), radial-gradient(ellipse 60% 50% at 20% 90%, oklch(0.28 0.18 200 / 0.5), transparent 60%), linear-gradient(180deg, oklch(0.05 0.02 280), oklch(0.10 0.04 290))",
    particles: ["#c4a8ff", "#7ae7ff", "#ffd166", "#ff9ecd"],
    accent: "#c4a8ff",
    cursorEmoji: "✨",
    creatures: ["star", "firefly"],
    description: "A cosmos of endless stars.",
  },
  blossom: {
    key: "blossom",
    name: "Cherry Blossom",
    sky: "radial-gradient(ellipse 80% 60% at 30% 0%, oklch(0.78 0.10 350 / 0.5), transparent 60%), radial-gradient(ellipse 70% 60% at 80% 10%, oklch(0.82 0.08 30 / 0.4), transparent 60%), linear-gradient(180deg, oklch(0.55 0.10 350), oklch(0.70 0.08 20))",
    particles: ["#ffd1dc", "#ffb3c6", "#ffe5b4", "#ff8fab"],
    accent: "#ff8fab",
    cursorEmoji: "🌸",
    creatures: ["petal", "butterfly"],
    description: "Soft petals on a spring breeze.",
  },
  sunset: {
    key: "sunset",
    name: "Golden Sunset",
    sky: "radial-gradient(ellipse 90% 70% at 50% 100%, oklch(0.72 0.20 40 / 0.7), transparent 55%), radial-gradient(ellipse 70% 50% at 20% 10%, oklch(0.55 0.22 10 / 0.5), transparent 60%), linear-gradient(180deg, oklch(0.40 0.18 20), oklch(0.65 0.20 40))",
    particles: ["#ffd166", "#ff8e72", "#ff5e8a", "#ffe5b4"],
    accent: "#ff8e72",
    cursorEmoji: "🌅",
    creatures: ["firefly", "butterfly", "leaf"],
    description: "Warm hues melting into dusk.",
  },
  forest: {
    key: "forest",
    name: "Magic Forest",
    sky: "radial-gradient(ellipse 80% 60% at 30% 0%, oklch(0.40 0.12 150 / 0.6), transparent 60%), radial-gradient(ellipse 70% 50% at 70% 100%, oklch(0.30 0.10 160 / 0.7), transparent 60%), linear-gradient(180deg, oklch(0.10 0.03 150), oklch(0.16 0.05 160))",
    particles: ["#7affb3", "#ffd166", "#a8e6cf", "#ff9ecd"],
    accent: "#7affb3",
    cursorEmoji: "🍃",
    creatures: ["firefly", "leaf", "butterfly"],
    description: "Whispering woods full of wonder.",
  },
  ocean: {
    key: "ocean",
    name: "Deep Ocean",
    sky: "radial-gradient(ellipse 80% 60% at 30% 0%, oklch(0.45 0.14 230 / 0.6), transparent 60%), radial-gradient(ellipse 70% 60% at 70% 100%, oklch(0.35 0.12 200 / 0.7), transparent 60%), linear-gradient(180deg, oklch(0.10 0.03 220), oklch(0.16 0.05 200))",
    particles: ["#7ae7ff", "#a8e6ff", "#ffd166", "#ff9ecd"],
    accent: "#7ae7ff",
    cursorEmoji: "🫧",
    creatures: ["bubble", "firefly", "star"],
    description: "Bioluminescent tides below.",
  },
  luxury: {
    key: "luxury",
    name: "Black & Gold",
    sky: "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.40 0.10 75 / 0.4), transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, oklch(0.30 0.06 60 / 0.4), transparent 60%), linear-gradient(180deg, oklch(0.06 0.01 60), oklch(0.10 0.02 70))",
    particles: ["#ffd166", "#f5d77a", "#e8c460", "#fff3c4"],
    accent: "#ffd166",
    cursorEmoji: "🪙",
    creatures: ["star", "firefly"],
    description: "Opulence in every shimmer.",
  },
};

export const THEME_LIST = Object.values(THEMES);
