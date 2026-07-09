"use client";

import { Howl } from "howler";

/**
 * Procedural audio engine using the Web Audio API.
 * Generates heartbeat, chimes, sparkles, and ambient pads without external files.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let ambientStarted = false;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
}

export function setMuted(m: boolean) {
  muted = m;
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.05);
  }
}

export function isMuted() {
  return muted;
}

/** A soft "thump-thump" heartbeat. */
export function playHeartbeat(intensity = 1) {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;

  const thump = (t: number, vol: number) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.14);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * 0.6 * intensity, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(g);
    g.connect(masterGain!);
    osc.start(t);
    osc.stop(t + 0.3);
  };

  thump(now, 0.9);
  thump(now + 0.22, 0.6);
}

/** A gentle, sparkling chime — used for collectables & achievements. */
export function playChime(freq = 880, duration = 0.5) {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

/** A triumphant little flourish for achievements. */
export function playFlourish() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    setTimeout(() => playChime(f, 0.45), i * 110);
  });
}

/** A soft pop for clicks. */
export function playPop() {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.2);
}

/** A magical sparkle for cursor effects. */
export function playSparkle() {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const freq = 1200 + Math.random() * 1400;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.08);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.15);
}

/** A warm low pad — ambient background drone. */
export function startAmbient() {
  const c = getCtx();
  if (!c || !masterGain || ambientStarted) return;
  ambientStarted = true;
  const freqs = [110, 164.81, 220];
  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    g.gain.value = 0;
    g.gain.setTargetAtTime(0.035, c.currentTime, 2);
    // slow LFO for movement
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.07 + i * 0.02;
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    osc.connect(g);
    g.connect(masterGain!);
    osc.start();
    ambientNodes.push({ osc, gain: g });
  });
}

export function stopAmbient() {
  const c = getCtx();
  if (!c) return;
  ambientNodes.forEach(({ osc, gain }) => {
    gain.gain.setTargetAtTime(0, c.currentTime, 0.5);
    setTimeout(() => {
      try {
        osc.stop();
      } catch {
        /* noop */
      }
    }, 800);
  });
  ambientNodes = [];
  ambientStarted = false;
}

/** Play uploaded music via Howler. */
let musicHowl: Howl | null = null;
export function playMusic(url: string) {
  if (musicHowl) {
    musicHowl.unload();
    musicHowl = null;
  }
  musicHowl = new Howl({
    src: [url],
    html5: true,
    volume: 0.4,
    loop: true,
  });
  musicHowl.play();
}

export function stopMusic() {
  if (musicHowl) {
    musicHowl.fade(musicHowl.volume(), 0, 600);
    setTimeout(() => {
      musicHowl?.unload();
      musicHowl = null;
    }, 700);
  }
}

/**
 * Extract a Spotify track/playlist ID from any Spotify URL.
 * Returns null if not a valid Spotify link.
 */
export function parseSpotifyId(url: string): string | null {
  const m = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
  if (!m) return null;
  return m[2];
}

/**
 * Extract a YouTube video ID from any YouTube URL.
 */
export function parseYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (!m) return null;
  return m[1];
}

/** Vibrate (mobile). */
export function vibrate(pattern: number | number[] = 30) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
}
