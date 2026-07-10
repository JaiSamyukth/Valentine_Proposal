"use client";

import { useSyncExternalStore } from "react";

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
  return { mode: "landing" };
}

// useSyncExternalStore: subscribe to hashchange, getSnapshot reads the hash.
// This avoids setState-in-effect and handles SSR correctly.
function subscribe(callback: () => void): () => void {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot(): RouteState {
  return parseHash();
}

function getServerSnapshot(): RouteState {
  return { mode: "landing" };
}

export function useRouter(): RouteState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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

export function storyUrl(storyId: string): string {
  if (typeof window === "undefined") return `/story/${storyId}`;
  return `${window.location.origin}${window.location.pathname}#/story/${storyId}`;
}
