"use client";

import { useEffect, useRef } from "react";
import { THEMES } from "@/lib/themes";
import type { ThemeKey } from "@/lib/experience-store";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  type: "firefly" | "heart" | "petal" | "star" | "snow" | "bubble" | "leaf";
  rot: number;
  vr: number;
  phase: number;
  twinkle: number;
  alphaDir: number;
}

interface Props {
  theme: ThemeKey;
  intensity?: "calm" | "normal" | "party";
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function LivingBackground({ theme, intensity = "normal" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const densityFactor =
      intensity === "calm" ? 0.5 : intensity === "party" ? 1.6 : 1;
    const baseCount = Math.min(
      130,
      Math.floor((w * h) / 14000) * densityFactor
    );

    const spawn = (type: Particle["type"]): Particle => {
      const t = THEMES[themeRef.current];
      const color = t.particles[Math.floor(Math.random() * t.particles.length)];
      const p: Particle = {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        size: 0,
        alpha: 0,
        alphaDir: 1,
        color,
        type,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() * 0.04 + 0.01,
      };
      switch (type) {
        case "firefly":
          p.size = 1.5 + Math.random() * 2.5;
          p.vx = (Math.random() - 0.5) * 0.25;
          p.vy = (Math.random() - 0.5) * 0.25;
          p.alpha = Math.random() * 0.8 + 0.2;
          break;
        case "heart":
          p.size = 6 + Math.random() * 10;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -0.2 - Math.random() * 0.4;
          p.alpha = 0.4 + Math.random() * 0.4;
          break;
        case "petal":
          p.size = 5 + Math.random() * 7;
          p.vx = 0.2 + Math.random() * 0.4;
          p.vy = 0.2 + Math.random() * 0.3;
          p.alpha = 0.5 + Math.random() * 0.4;
          break;
        case "leaf":
          p.size = 6 + Math.random() * 8;
          p.vx = -0.3 - Math.random() * 0.3;
          p.vy = 0.2 + Math.random() * 0.3;
          p.alpha = 0.5 + Math.random() * 0.4;
          break;
        case "snow":
          p.size = 1.5 + Math.random() * 3;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = 0.3 + Math.random() * 0.5;
          p.alpha = 0.5 + Math.random() * 0.5;
          break;
        case "bubble":
          p.size = 3 + Math.random() * 8;
          p.vx = (Math.random() - 0.5) * 0.2;
          p.vy = -0.3 - Math.random() * 0.5;
          p.alpha = 0.3 + Math.random() * 0.4;
          break;
        case "star":
          p.size = 0.8 + Math.random() * 1.8;
          p.vx = 0;
          p.vy = 0;
          p.alpha = Math.random();
          break;
      }
      return p;
    };

    const t = THEMES[themeRef.current];
    const counts: Record<string, number> = {};
    t.creatures.forEach((c) => {
      counts[c] =
        (counts[c] || 0) + Math.floor(baseCount / t.creatures.length);
    });
    counts.star = (counts.star || 0) + 30;

    particlesRef.current = [];
    (Object.keys(counts) as Particle["type"][]).forEach((type) => {
      for (let i = 0; i < counts[type]; i++) {
        particlesRef.current.push(spawn(type));
      }
    });

    const drawHeart = (
      x: number,
      y: number,
      s: number,
      color: string,
      a: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s / 16, s / 16);
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(0, -2, -8, -2, -8, 4);
      ctx.bezierCurveTo(-8, 9, 0, 13, 0, 16);
      ctx.bezierCurveTo(0, 13, 8, 9, 8, 4);
      ctx.bezierCurveTo(8, -2, 0, -2, 0, 4);
      ctx.fill();
      ctx.restore();
    };

    const drawPetal = (
      x: number,
      y: number,
      s: number,
      color: string,
      a: number,
      rot: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (
      x: number,
      y: number,
      s: number,
      color: string,
      a: number
    ) => {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = a * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, s * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawBubble = (
      x: number,
      y: number,
      s: number,
      color: string,
      a: number
    ) => {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x - s * 0.3, y - s * 0.3, s * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const ps = particlesRef.current;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        if (!reduced) {
          p.phase += 0.01;
          if (p.type === "firefly") {
            p.vx += Math.sin(p.phase) * 0.02;
            p.vy += Math.cos(p.phase * 0.8) * 0.02;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.x += p.vx;
            p.y += p.vy;
            p.alpha += p.alphaDir * p.twinkle;
            if (p.alpha > 1) {
              p.alpha = 1;
              p.alphaDir = -1;
            }
            if (p.alpha < 0.1) {
              p.alpha = 0.1;
              p.alphaDir = 1;
            }
          } else if (p.type === "star") {
            p.alpha += p.alphaDir * p.twinkle * 0.5;
            if (p.alpha > 1) {
              p.alpha = 1;
              p.alphaDir = -1;
            }
            if (p.alpha < 0.15) {
              p.alpha = 0.15;
              p.alphaDir = 1;
            }
          } else {
            p.x += p.vx + Math.sin(p.phase) * 0.3;
            p.y += p.vy;
            p.rot += p.vr;
          }

          if (p.type === "firefly" && mouseRef.current.active) {
            const dx = mouseRef.current.x - p.x;
            const dy = mouseRef.current.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 160 && dist > 0.1) {
              p.vx += (dx / dist) * 0.04;
              p.vy += (dy / dist) * 0.04;
            }
          }

          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }

        switch (p.type) {
          case "firefly": {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            const grad = ctx.createRadialGradient(
              p.x,
              p.y,
              0,
              p.x,
              p.y,
              p.size * 6
            );
            grad.addColorStop(0, p.color);
            grad.addColorStop(0.3, p.color + "80");
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            break;
          }
          case "heart":
            drawHeart(p.x, p.y, p.size, p.color, p.alpha);
            break;
          case "petal":
            drawPetal(p.x, p.y, p.size, p.color, p.alpha, p.rot);
            break;
          case "leaf":
            drawPetal(p.x, p.y, p.size, p.color, p.alpha, p.rot);
            break;
          case "snow":
            drawStar(p.x, p.y, p.size, "#ffffff", p.alpha);
            break;
          case "bubble":
            drawBubble(p.x, p.y, p.size, p.color, p.alpha);
            break;
          case "star":
            drawStar(p.x, p.y, p.size, p.color, p.alpha);
            break;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
