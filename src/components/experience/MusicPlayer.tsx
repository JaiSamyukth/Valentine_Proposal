"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, X, ChevronDown, ChevronUp } from "lucide-react";
import { useExperience } from "@/lib/experience-store";
import { parseSpotifyId, parseYouTubeId } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function MusicPlayer() {
  const settings = useExperience((s) => s.settings);
  const phase = useExperience((s) => s.phase);
  const [open, setOpen] = useState(false);

  // Only show after setup if a link is configured
  if (phase === "boot" || phase === "setup") return null;
  if (!settings.spotifyUrl && !settings.youtubeUrl) return null;

  const spotifyId = settings.spotifyUrl ? parseSpotifyId(settings.spotifyUrl) : null;
  const ytId = settings.youtubeUrl ? parseYouTubeId(settings.youtubeUrl) : null;

  return (
    <div className="fixed bottom-20 left-4 z-[87] sm:bottom-24 sm:left-6">
      {/* Collapsed toggle */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-2 rounded-full glass px-3 py-2 text-xs text-white/80 transition-all hover:glass-strong btn-bouncy"
        aria-label={open ? "Collapse music player" : "Open music player"}
      >
        <Music className="h-4 w-4 text-[var(--rose-glow)]" />
        <span className="hidden sm:inline">
          {open ? "Hide" : "Our song"}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5" />
        )}
      </motion.button>

      {/* Expanded player */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="mt-2 w-[300px] overflow-hidden rounded-2xl glass-strong p-3 sm:w-[340px]"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/60">
                <Music className="h-3.5 w-3.5 text-[var(--rose-glow)]" />
                Now playing
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {spotifyId ? (
              <iframe
                src={`https://open.spotify.com/embed/${settings.spotifyUrl.includes("/playlist/") ? "playlist" : settings.spotifyUrl.includes("/album/") ? "album" : "track"}/${spotifyId}`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
                title="Spotify player"
              />
            ) : ytId ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=0&modestbranding=1&rel=0`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-xl"
                  title="YouTube player"
                />
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-white/40">
                Link not recognized.
              </p>
            )}

            <p className="mt-2 text-center font-script text-xs text-white/40">
              press play to let the music carry you ✨
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
