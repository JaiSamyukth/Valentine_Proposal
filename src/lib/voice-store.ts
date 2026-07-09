"use client";

import { create } from "zustand";

interface VoiceNote {
  url: string;
  duration: number;
}

interface VoiceState {
  note: VoiceNote | null;
  setNote: (url: string, duration: number) => void;
  clear: () => void;
}

export const useVoiceNote = create<VoiceState>((set) => ({
  note: null,
  setNote: (url, duration) => set({ note: { url, duration } }),
  clear: () => set({ note: null }),
}));
