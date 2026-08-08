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
// IMPORTANT: getServerSnapshot must return a cached value to avoid infinite loops.
const SERVER_SNAPSHOT: RouteState = { mode: "landing" };
let cachedSnapshot: RouteState | null = null;
let cachedHash = "";

function subscribe(callback: () => void): () => void {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot(): RouteState {
  const hash = window.location.hash;
  if (cachedSnapshot && hash === cachedHash) return cachedSnapshot;
  cachedHash = hash;
  cachedSnapshot = parseHash();
  return cachedSnapshot;
}

function getServerSnapshot(): RouteState {
  return SERVER_SNAPSHOT;
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
