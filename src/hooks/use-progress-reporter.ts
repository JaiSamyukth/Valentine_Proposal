"use client";

import { useEffect, useRef } from "react";

/**
 * Reports the receiver's progress to the server so the sender can see
 * whether the link was opened and how far they got.
 *
 * - Fires immediately on mount (link opened)
 * - Fires on every phase/scene change
 * - Fires when YES is pressed
 * - Fires when the finale completes
 */

interface ProgressState {
  storyId: string;
  phase: string;
  scene?: number;
  yesPressed?: boolean;
  completed?: boolean;
}

export function useProgressReporter(
  storyId: string,
  phase: string,
  scene: number,
  yesPressed: boolean,
  completed: boolean
) {
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (!storyId) return;
    const key = `${phase}:${scene}:${yesPressed}:${completed}`;
    if (key === lastSentRef.current) return;
    lastSentRef.current = key;

    const state: ProgressState = {
      storyId,
      phase,
      scene,
      yesPressed,
      completed,
    };

    // Fire and forget — best-effort reporting
    fetch(`/api/story/${storyId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    }).catch(() => {
      /* noop — progress reporting is best-effort */
    });
  }, [storyId, phase, scene, yesPressed, completed]);
}
