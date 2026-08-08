"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSparkle } from "@/lib/sound";

export interface DialogueSegment {
  text: string;
  /** Pause (ms) BEFORE this segment is typed. */
  pauseBefore?: number;
  /** Speed multiplier for this segment. 1 = normal, 0.5 = fast, 2 = slow. */
  speed?: number;
  /** Emotion triggers world reactions (stars twinkle, etc.) */
  emotion?: "warm" | "funny" | "suspense" | "reveal";
}

interface Props {
  segments: DialogueSegment[];
  onComplete?: () => void;
  /** Allow click-to-skip / click-to-continue. */
  interactive?: boolean;
  className?: string;
  /** Play soft typing sounds. */
  sound?: boolean;
}

/**
 * Cinematic typewriter dialogue engine.
 * - Variable typing speed per segment
 * - Pauses before emotional words
 * - Blinking cursor
 * - Click to skip / continue
 * - Emotion callbacks for world reactions
 */
export function TypewriterDialogue({
  segments,
  onComplete,
  interactive = true,
  className = "",
  sound = false,
}: Props) {
  const [segIndex, setSegIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completedRef = useRef(false);

  // Reset when segments change
  useEffect(() => {
    setSegIndex(0);
    setDisplay("");
    setDone(false);
    completedRef.current = false;
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [segments]);

  // Type the current segment
  useEffect(() => {
    if (done || segIndex >= segments.length) return;
    const seg = segments[segIndex];
    const baseSpeed = 45;
    const speed = seg.speed ?? 1;
    const charSpeed = baseSpeed / speed;

    const startDelay = seg.pauseBefore ?? 0;
    setWaiting(startDelay > 0);

    const startTimer = setTimeout(function typeStep() {
      setWaiting(false);
      let i = 0;
      const step = () => {
        if (i <= seg.text.length) {
          setDisplay(seg.text.slice(0, i));
          i++;
          // natural variation: longer pause after punctuation
          const lastChar = seg.text[i - 2];
          let delay = charSpeed;
          if (lastChar === "." || lastChar === "!" || lastChar === "?")
            delay = charSpeed * 6;
          else if (lastChar === "," || lastChar === ";")
            delay = charSpeed * 3;
          else delay = charSpeed + (Math.random() * 30 - 15);

          if (sound && i % 3 === 0 && Math.random() < 0.4) playSparkle();

          const t = setTimeout(step, delay);
          timersRef.current.push(t);
        } else {
          // segment complete — move to next after a short pause
          const nextTimer = setTimeout(() => {
            setSegIndex((idx) => idx + 1);
          }, 400);
          timersRef.current.push(nextTimer);
        }
      };
      step();
    }, startDelay);
    timersRef.current.push(startTimer);
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [segIndex, segments, done]);

  // All segments complete
  useEffect(() => {
    if (segIndex >= segments.length && !completedRef.current) {
      completedRef.current = true;
      setDone(true);
      onComplete?.();
    }
  }, [segIndex, segments.length, onComplete]);

  const skip = () => {
    if (!interactive) return;
    if (done) return;
    // skip to end of current segment, then advance
    if (segIndex < segments.length) {
      const seg = segments[segIndex];
      setDisplay(seg.text);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      const t = setTimeout(() => setSegIndex((idx) => idx + 1), 200);
      timersRef.current.push(t);
    }
  };

  const currentSeg = segments[segIndex];

  return (
    <div
      className={className}
      onClick={skip}
      style={{ cursor: interactive && !done ? "pointer" : "default" }}
    >
      <AnimatePresence mode="wait">
        {waiting && (
          <motion.span
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            exit={{ opacity: 0 }}
            className="inline-block"
          >
            <span className="text-white/40">···</span>
          </motion.span>
        )}
      </AnimatePresence>

      {!waiting && (
        <span className={currentSeg?.emotion === "reveal" ? "gradient-text-gold" : ""}>
          {display}
          {!done && (
            <span className="typing-caret inline-block" />
          )}
        </span>
      )}

      {done && interactive && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-2 text-xs text-white/40"
        >
          ▾
        </motion.span>
      )}
    </div>
  );
}
