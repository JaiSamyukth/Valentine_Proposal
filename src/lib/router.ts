"use client";

import { useEffect, useState } from "react";

export type RouteMode = "landing" | "builder" | "story";

export interface RouteState {
  mode: RouteMode;
  storyId?: string;
}

function parseHash(): RouteState {
  if (typeof window === "undefined") return { mode: "landing" };
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash.startsWith("builder")) return { mode: "builder" };
  if (hash.startsWith("story/")) {
    const id = hash.slice("story/".length).split("/")[0];
    return { mode: "story", storyId: id };
  }
  if (hash.startsWith("story=")) {
    const id = hash.slice("story=".length);
    return { mode: "story", storyId: id };
  }
  return { mode: "landing" };
}

export function useRouter(): RouteState {
  const [route, setRoute] = useState<RouteState>(parseHash);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route;
}

export function navigate(mode: RouteMode, storyId?: string) {
  if (mode === "builder") {
    window.location.hash = "/builder";
  } else if (mode === "story" && storyId) {
    window.location.hash = `/story/${storyId}`;
  } else {
    window.location.hash = "";
  }
}

/**
 * Build a full shareable URL for a story.
 */
export function storyUrl(storyId: string): string {
  if (typeof window === "undefined") return `/story/${storyId}`;
  return `${window.location.origin}${window.location.pathname}#/story/${storyId}`;
}
