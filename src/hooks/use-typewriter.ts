"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Typewriter hook that reveals text character-by-character.
 */
export function useTypewriter(
  text: string,
  speed = 45,
  startDelay = 0,
  enabled = true
) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplay(text);
      setDone(true);
      return;
    }
    setDisplay("");
    setDone(false);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(function step() {
      if (i <= text.length) {
        setDisplay(text.slice(0, i));
        i++;
        timer = setTimeout(step, speed + (Math.random() * 30 - 15));
      } else {
        setDone(true);
      }
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [text, speed, startDelay, enabled]);

  return { display, done };
}

/**
 * Sequence runner: steps through timed phases.
 */
export function useSequence<T>(steps: T[], onComplete?: () => void) {
  const [index, setIndex] = useState(0);
  const next = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= steps.length) {
        onComplete?.();
        return i;
      }
      return i + 1;
    });
  }, [steps.length, onComplete]);
  return { index, next, current: steps[index], isFirst: index === 0 };
}
