"use client";

import { create } from "zustand";

interface Photo {
  id: string;
  url: string;
  name: string;
}

interface PhotoState {
  photos: Photo[];
  addPhoto: (url: string, name: string) => void;
  removePhoto: (id: string) => void;
  clear: () => void;
}

export const usePhotos = create<PhotoState>((set) => ({
  photos: [],
  addPhoto: (url, name) =>
    set((st) => ({
      photos: [
        ...st.photos,
        { id: Math.random().toString(36).slice(2), url, name },
      ],
    })),
  removePhoto: (id) =>
    set((st) => ({ photos: st.photos.filter((p) => p.id !== id) })),
  clear: () => set({ photos: [] }),
}));
