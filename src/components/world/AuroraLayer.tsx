"use client";

import { THEMES } from "@/lib/themes";
import type { ThemeKey } from "@/lib/experience-store";

export function AuroraLayer({ theme }: { theme: ThemeKey }) {
  const t = THEMES[theme];
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background: t.sky }}
      aria-hidden
    >
      <div className="absolute inset-0 animate-aurora opacity-70">
        <div
          className="absolute -top-1/4 -left-1/4 h-[60vh] w-[60vh] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${t.accent}40, transparent 70%)`,
          }}
        />
        <div
          className="absolute top-1/3 -right-1/4 h-[55vh] w-[55vh] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${t.particles[2]}30, transparent 70%)`,
            animationDelay: "-7s",
          }}
        />
        <div
          className="absolute -bottom-1/4 left-1/3 h-[50vh] w-[50vh] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${t.particles[0]}30, transparent 70%)`,
            animationDelay: "-14s",
          }}
        />
      </div>
    </div>
  );
}
