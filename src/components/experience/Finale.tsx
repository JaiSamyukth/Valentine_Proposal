"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Play, Pause } from "lucide-react";
import { useExperience } from "@/lib/experience-store";
import { usePhotos } from "@/lib/photo-store";
import { useVoiceNote } from "@/lib/voice-store";
import { playChime, playFlourish, startAmbient, vibrate } from "@/lib/sound";

type Stage = "sky" | "fireworks" | "constellation" | "message" | "button";

export function Finale() {
  const settings = useExperience((s) => s.settings);
  const photos = usePhotos((s) => s.photos);
  const voiceNote = useVoiceNote((s) => s.note);
  const [stage, setStage] = useState<Stage>("sky");
  const [showButton, setShowButton] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(false);
  const [dateAccepted, setDateAccepted] = useState(false);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startAmbient();
    // sequence
    const t1 = setTimeout(() => setStage("fireworks"), 1200);
    const t2 = setTimeout(() => setStage("constellation"), 3500);
    const t3 = setTimeout(() => setStage("message"), 7000);
    const t4 = setTimeout(() => {
      setStage("button");
      setShowButton(true);
    }, 9500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // continuous fireworks during fireworks + constellation
  useEffect(() => {
    if (stage !== "fireworks" && stage !== "constellation") return;
    const burst = () => {
      const colors = ["#ff5e8a", "#ffd166", "#7ae7ff", "#ff9ecd", "#fff3c4"];
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 35,
        origin: {
          x: 0.2 + Math.random() * 0.6,
          y: 0.2 + Math.random() * 0.3,
        },
        colors,
        scalar: 0.9,
      });
      playChime(600 + Math.random() * 600, 0.4);
    };
    const interval = setInterval(burst, 700);
    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-20 text-center">
      {/* Brightening sky overlay */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === "sky" ? 0.3 : 0.7 }}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.72 0.20 40 / 0.5), transparent 60%), radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.65 0.20 340 / 0.4), transparent 60%)",
        }}
      />

      <AnimatePresence mode="wait">
        {stage === "sky" && (
          <motion.div
            key="sky"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-7xl"
              style={{
                filter:
                  "drop-shadow(0 0 30px rgba(255,209,102,0.8)) drop-shadow(0 0 80px rgba(255,94,138,0.5))",
              }}
            >
              🌅
            </motion.div>
            <p className="mt-6 font-script text-2xl text-white/70">
              The sky begins to open...
            </p>
          </motion.div>
        )}

        {(stage === "fireworks" ||
          stage === "constellation" ||
          stage === "message" ||
          stage === "button") && (
          <motion.div
            key="main"
            className="relative z-10 flex w-full max-w-3xl flex-col items-center"
          >
            <ConstellationCanvas
              names={[
                settings.senderName || "Me",
                settings.receiverName || "You",
              ]}
              active={stage !== "fireworks"}
            />

            <AnimatePresence>
              {(stage === "message" || stage === "button") && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="mt-10 max-w-xl"
                >
                  {settings.message ? (
                    <p className="font-script text-2xl leading-relaxed text-white/90 sm:text-3xl">
                      {settings.message}
                    </p>
                  ) : (
                    <p className="font-script text-2xl leading-relaxed text-white/90 sm:text-3xl">
                      In a world of countless stars, my whole sky found its
                      center the moment I met you. You are my favorite story —
                      and I'd like to keep writing it, one ordinary, magical day
                      at a time.
                    </p>
                  )}
                  <p className="mt-4 font-script text-lg text-[var(--gold)]">
                    — {settings.senderName || "Yours, always"}
                    {settings.petName ? `, ${settings.petName}` : ""}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {settings.dateSuggestion && showButton && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 rounded-full glass px-5 py-2 font-script text-base text-white/80"
              >
                📅 {settings.dateSuggestion}
              </motion.p>
            )}

            {/* Photo gallery reveal */}
            {showButton && photos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 w-full max-w-2xl"
              >
                <p className="mb-3 text-center text-xs uppercase tracking-[0.25em] text-white/50">
                  ✨ moments worth keeping ✨
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {photos.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.7, rotate: (Math.random() - 0.5) * 16 }}
                      animate={{ opacity: 1, scale: 1, rotate: (Math.random() - 0.5) * 8 }}
                      transition={{ delay: 0.8 + i * 0.15, type: "spring", stiffness: 200, damping: 14 }}
                      whileHover={{ scale: 1.08, rotate: 0, zIndex: 10 }}
                      className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-white/20 shadow-lg sm:h-28 sm:w-28"
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reasons reveal */}
            {showButton && settings.reasons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-8 w-full max-w-xl"
              >
                <p className="mb-3 text-center text-xs uppercase tracking-[0.25em] text-white/50">
                  ♡ reasons I adore you ♡
                </p>
                <ul className="space-y-1.5">
                  {settings.reasons.map((r, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.18 }}
                      className="flex items-start gap-2 rounded-xl glass px-4 py-2 font-script text-lg text-white/85"
                    >
                      <span className="mt-0.5 text-[var(--rose-glow)]">♡</span>
                      <span>{r}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Voice note player */}
            {showButton && voiceNote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="mt-8 flex items-center gap-3 rounded-2xl glass-strong px-5 py-4"
              >
                <button
                  onClick={() => {
                    if (!voiceRef.current) {
                      voiceRef.current = new Audio(voiceNote.url);
                      voiceRef.current.onended = () => setPlayingVoice(false);
                    }
                    if (playingVoice) {
                      voiceRef.current.pause();
                      setPlayingVoice(false);
                    } else {
                      voiceRef.current.play();
                      setPlayingVoice(true);
                    }
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] text-black glow-rose"
                  aria-label={playingVoice ? "Pause voice note" : "Play voice note"}
                >
                  {playingVoice ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                </button>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                    🎙️ a voice from the heart
                  </div>
                  <div className="font-script text-sm text-white/70">
                    Press play to hear their voice.
                  </div>
                </div>
              </motion.div>
            )}

            {/* Memories timeline reveal */}
            {showButton && settings.timeline.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
                className="mt-8 w-full max-w-xl"
              >
                <p className="mb-3 text-center text-xs uppercase tracking-[0.25em] text-white/50">
                  ✨ our story so far ✨
                </p>
                <div className="relative pl-6">
                  {/* vertical line */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[var(--rose-glow)] to-[var(--gold)]" />
                  {settings.timeline.map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.0 + i * 0.2 }}
                      className="relative mb-3 flex items-center gap-3"
                    >
                      <span className="absolute -left-[18px] flex h-5 w-5 items-center justify-center rounded-full bg-[var(--rose-glow)]/20 text-xs ring-2 ring-[var(--rose-glow)]/40">
                        {e.emoji}
                      </span>
                      <div className="ml-4 rounded-xl glass px-4 py-2">
                        <span className="text-xs text-[var(--gold)]">{e.date}</span>
                        <p className="font-script text-base text-white/85">{e.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI-generated poem reveal */}
            {showButton && settings.aiPoem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4 }}
                className="mt-8 w-full max-w-xl rounded-2xl glass-strong p-6"
              >
                <p className="mb-3 text-center text-xs uppercase tracking-[0.25em] text-[var(--gold)]">
                  ✨ a poem, written for you ✨
                </p>
                <p className="whitespace-pre-line text-center font-script text-xl italic leading-relaxed text-white/85">
                  {settings.aiPoem}
                </p>
              </motion.div>
            )}

            {/* AI-generated compliment reveal */}
            {showButton && settings.aiCompliment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.8 }}
                className="mt-4 max-w-xl"
              >
                <p className="text-center font-script text-lg text-[var(--rose-glow)]">
                  &ldquo;{settings.aiCompliment}&rdquo;
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {showButton && !dateAccepted && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setDateAccepted(true);
                    playFlourish();
                    vibrate([60, 80, 60]);
                    confetti({
                      particleCount: 250,
                      spread: 360,
                      origin: { y: 0.5 },
                      startVelocity: 45,
                      shapes: ["❤️", "💖", "✨", "🌹", "💫"],
                      scalar: 1.6,
                    });
                    // Report "date accepted" to the server so the sender knows
                    const storyId = window.location.hash.match(/story\/([^/?]+)/)?.[1];
                    if (storyId) {
                      fetch(`/api/story/${storyId}/progress`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          phase: "done",
                          completed: true,
                          dateAccepted: true,
                        }),
                      }).catch(() => {});
                    }
                  }}
                  className="relative mt-10 overflow-hidden rounded-full bg-gradient-to-r from-[var(--rose-glow)] via-[#ff8e72] to-[var(--gold)] px-10 py-5 font-display text-xl text-black glow-rose sm:text-2xl"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    ❤️ Let&apos;s Make This Date Happen ❤️
                  </span>
                  <span className="absolute inset-0 shimmer opacity-50" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Thank-you after accepting the date */}
            <AnimatePresence>
              {showButton && dateAccepted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="mt-10 flex flex-col items-center gap-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-6xl"
                    style={{ filter: "drop-shadow(0 0 30px rgba(255,94,138,0.9))" }}
                  >
                    💖
                  </motion.div>
                  <p className="font-display text-3xl gradient-text-rose sm:text-4xl">
                    They said yes.
                  </p>
                  <p className="font-script text-lg text-white/60">
                    {settings.senderName || "Someone"} will know.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {showButton && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 font-script text-base text-white/40"
              >
                The end of the beginning. ✨
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Draws two names as constellations of stars, with lines connecting them.
 */
function ConstellationCanvas({
  names,
  active,
}: {
  names: [string, string];
  active: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth * 2);
    let h = (canvas.height = 260 * 2);
    ctx.scale(2, 2);
    w = canvas.offsetWidth;
    h = 260;

    // sample points from text
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d");
    if (!octx) return;
    octx.fillStyle = "#fff";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    const fontSize = Math.min(72, w / (Math.max(...names.map((n) => n.length)) * 0.7));
    octx.font = `700 ${fontSize}px var(--font-playfair), Georgia, serif`;

    interface Pt {
      x: number;
      y: number;
      r: number;
      delay: number;
    }
    const allPoints: { pts: Pt[]; center: number }[] = [];
    const gap = w / (names.length + 1);
    names.forEach((name, ni) => {
      octx.clearRect(0, 0, w, h);
      const cx = gap * (ni + 1);
      octx.fillText(name, cx, h / 2);
      const data = octx.getImageData(0, 0, w, h).data;
      const pts: Pt[] = [];
      const step = Math.max(3, Math.floor(fontSize / 14));
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = (y * w + x) * 4 + 3;
          if (data[idx] > 128) {
            pts.push({
              x: x + (Math.random() - 0.5) * 2,
              y: y + (Math.random() - 0.5) * 2,
              r: 1 + Math.random() * 1.5,
              delay: Math.random() * 0.8,
            });
          }
        }
      }
      // downsample if too many
      const maxPts = 90;
      const final =
        pts.length > maxPts
          ? pts.filter((_, i) => i % Math.ceil(pts.length / maxPts) === 0)
          : pts;
      allPoints.push({ pts: final, center: cx });
    });

    let raf = 0;
    const start = performance.now();

    const draw = () => {
      const elapsed = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      allPoints.forEach(({ pts, center }, ni) => {
        // connecting line under the name
        const lineProg = Math.min(1, Math.max(0, (elapsed - 1.2 - ni * 0.3) / 1));
        if (lineProg > 0 && pts.length > 1) {
          ctx.save();
          ctx.globalAlpha = 0.25 * lineProg;
          ctx.strokeStyle = ni === 0 ? "#ff5e8a" : "#ffd166";
          ctx.lineWidth = 1;
          ctx.beginPath();
          const sorted = [...pts].sort((a, b) => a.x - b.x);
          ctx.moveTo(sorted[0].x, sorted[0].y);
          for (let i = 1; i < sorted.length; i++) {
            ctx.lineTo(sorted[i].x, sorted[i].y);
          }
          ctx.stroke();
          ctx.restore();
        }

        // stars
        pts.forEach((p) => {
          const localProg = Math.min(
            1,
            Math.max(0, (elapsed - p.delay - ni * 0.3) / 0.6)
          );
          if (localProg <= 0) return;
          const tw = 0.6 + 0.4 * Math.sin(elapsed * 3 + p.x);
          ctx.save();
          ctx.globalAlpha = localProg * tw;
          const color = ni === 0 ? "#ff9ecd" : "#ffe5b4";
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          grad.addColorStop(0, color);
          grad.addColorStop(0.4, color + "80");
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.globalAlpha = localProg;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [names, active]);

  return (
    <canvas
      ref={canvasRef}
      className="h-[260px] w-full max-w-2xl"
      aria-label={`${names[0]} and ${names[1]} written in the stars`}
    />
  );
}
