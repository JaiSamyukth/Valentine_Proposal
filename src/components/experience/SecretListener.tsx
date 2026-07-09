"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useExperience } from "@/lib/experience-store";
import { playChime, playFlourish, vibrate } from "@/lib/sound";
import { triggerFunnyPopup } from "./FunnyPopups";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const COMMANDS: Record<string, () => void> = {
  love: () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      shapes: ["❤️"],
      scalar: 1.6,
    });
    triggerFunnyPopup("Love deployed. 💖");
  },
  flowers: () => {
    confetti({
      particleCount: 60,
      spread: 100,
      origin: { y: 0.6 },
      shapes: ["🌸", "🌹", "🌷"],
      scalar: 1.8,
    });
    triggerFunnyPopup("A bouquet for you. 💐");
  },
  pizza: () => {
    confetti({
      particleCount: 40,
      spread: 80,
      origin: { y: 0.6 },
      shapes: ["🍕"],
      scalar: 2,
    });
    triggerFunnyPopup("Pizza party initiated. 🍕");
  },
  coffee: () => {
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { y: 0.6 },
      shapes: ["☕"],
      scalar: 2,
    });
    triggerFunnyPopup("Brewing warmth... ☕");
  },
  hug: () => {
    triggerFunnyPopup("🤗 Sending a hug across the screen.");
    playChime(700, 0.6);
  },
  dance: () => {
    confetti({
      particleCount: 50,
      spread: 120,
      origin: { y: 0.7 },
      shapes: ["🕺", "💃"],
      scalar: 2.2,
    });
    triggerFunnyPopup("Dance mode: ON. 🕺💃");
  },
  galaxy: () => {
    confetti({
      particleCount: 100,
      spread: 160,
      startVelocity: 45,
      origin: { y: 0.5 },
      shapes: ["✨", "⭐", "🌟"],
      scalar: 1.4,
    });
    triggerFunnyPopup("Galaxy activated. 🌌");
  },
  stars: () => {
    confetti({
      particleCount: 80,
      spread: 180,
      origin: { y: 0.2 },
      shapes: ["⭐", "✨"],
      scalar: 1.3,
      gravity: 0.3,
    });
    triggerFunnyPopup("Stars raining down. 🌠");
  },
  magic: () => {
    confetti({
      particleCount: 120,
      spread: 360,
      origin: { y: 0.5, x: 0.5 },
      startVelocity: 30,
      shapes: ["✨", "💫", "🪄"],
      scalar: 1.5,
    });
    triggerFunnyPopup("✨ Magic!");
  },
  cat: () => {
    confetti({
      particleCount: 30,
      spread: 90,
      origin: { y: 0.6 },
      shapes: ["🐱"],
      scalar: 2,
    });
    triggerFunnyPopup("A cat appeared. 🐱");
  },
  penguin: () => {
    confetti({
      particleCount: 30,
      spread: 90,
      origin: { y: 0.6 },
      shapes: ["🐧"],
      scalar: 2,
    });
    triggerFunnyPopup("Penguin dancing by. 🐧");
  },
  dragon: () => {
    confetti({
      particleCount: 25,
      spread: 80,
      origin: { y: 0.5 },
      shapes: ["🐉"],
      scalar: 2.4,
    });
    triggerFunnyPopup("A tiny dragon flew past. 🐉");
  },
  rain: () => {
    triggerFunnyPopup("🌧️ Listen... the rain.");
    playChime(400, 1.2);
  },
  snow: () => {
    confetti({
      particleCount: 80,
      spread: 180,
      origin: { y: -0.1 },
      shapes: ["❄️", "⛄"],
      scalar: 1.4,
      gravity: 0.6,
    });
    triggerFunnyPopup("❄️ Let it snow.");
  },
  moon: () => {
    confetti({
      particleCount: 20,
      spread: 60,
      origin: { y: 0.2 },
      shapes: ["🌙"],
      scalar: 2.6,
    });
    triggerFunnyPopup("The moon is listening. 🌙");
  },
  portal: () => {
    // Opens the Portal Room museum — imported lazily via dynamic import to
    // avoid circular deps. The openPortalRoom trigger is set by the PortalRoom
    // component on mount.
    import("./PortalRoom").then(({ openPortalRoom }) => {
      openPortalRoom();
    });
    triggerFunnyPopup("🌀 Opening a portal...");
  },
};

export function SecretListener() {
  const konamiRef = useRef<string[]>([]);
  const bufferRef = useRef("");
  const bufferTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlock = useExperience((s) => s.unlockAchievement);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Konami
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > KONAMI.length) {
        konamiRef.current.shift();
      }
      if (konamiRef.current.join(",").toLowerCase() === KONAMI.join(",").toLowerCase()) {
        konamiRef.current = [];
        unlock("konami");
        playFlourish();
        vibrate([60, 40, 60, 40, 80]);
        confetti({
          particleCount: 200,
          spread: 360,
          origin: { y: 0.5 },
          startVelocity: 40,
        });
        triggerFunnyPopup("🎮 Secret unlocked. You know the code.");
      }

      // Typed commands
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        bufferRef.current += e.key.toLowerCase();
        if (bufferRef.current.length > 12) {
          bufferRef.current = bufferRef.current.slice(-12);
        }
        if (bufferTimer.current) clearTimeout(bufferTimer.current);
        bufferTimer.current = setTimeout(() => {
          bufferRef.current = "";
        }, 1500);

        for (const cmd of Object.keys(COMMANDS)) {
          if (bufferRef.current.endsWith(cmd)) {
            COMMANDS[cmd]();
            unlock("explorer");
            bufferRef.current = "";
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlock]);

  return null;
}
