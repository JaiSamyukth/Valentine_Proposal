"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { useVoiceNote } from "@/lib/voice-store";
import { saveBlob, loadBlob, deleteBlob } from "@/lib/idb";
import { playPop, vibrate } from "@/lib/sound";
import { Label } from "@/components/ui/label";

const VOICE_KEY = "voiceNote";

export function VoiceNoteRecorder() {
  const note = useVoiceNote((s) => s.note);
  const setNote = useVoiceNote((s) => s.setNote);
  const clear = useVoiceNote((s) => s.clear);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Restore from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    loadBlob(VOICE_KEY).then((blob) => {
      if (cancelled || !blob) return;
      const url = URL.createObjectURL(blob);
      // duration unknown until loaded; estimate via Audio metadata
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        if (!cancelled) {
          setNote(url, isFinite(audio.duration) ? audio.duration : 0);
        }
      };
      // fallback if metadata fails
      setTimeout(() => {
        if (!cancelled && !note) {
          setNote(url, 0);
        }
      }, 500);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRef.current && mediaRef.current.state !== "inactive") {
        mediaRef.current.stop();
      }
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setNote(url, seconds);
        // persist to IndexedDB
        saveBlob(VOICE_KEY, blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      vibrate(20);
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setError("Microphone access was denied or unavailable.");
    }
  };

  const stop = () => {
    if (mediaRef.current && mediaRef.current.state === "recording") {
      mediaRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    playPop();
  };

  const togglePlay = () => {
    if (!note) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(note.url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const remove = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
    clear();
    deleteBlob(VOICE_KEY);
    playPop();
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/50">
        <Mic className="h-3.5 w-3.5 text-[var(--rose-glow)]" />
        Voice note (revealed in the finale)
      </Label>

      {!note && !recording && (
        <button
          onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--rose-glow)]/40 bg-[var(--rose-glow)]/5 py-4 text-sm text-[var(--rose-glow)] transition-colors hover:bg-[var(--rose-glow)]/15"
        >
          <Mic className="h-4 w-4" />
          Record a voice message
        </button>
      )}

      {recording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-3 rounded-xl border border-[var(--rose-glow)] bg-[var(--rose-glow)]/10 py-4"
        >
          <motion.span
            className="h-3 w-3 rounded-full bg-[var(--rose-glow)]"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="font-mono text-sm text-white">REC {fmt(seconds)}</span>
          <button
            onClick={stop}
            className="flex items-center gap-1 rounded-full bg-[var(--rose-glow)] px-3 py-1 text-xs text-black"
          >
            <Square className="h-3 w-3 fill-current" />
            Stop
          </button>
        </motion.div>
      )}

      {note && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <button
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] text-black"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </button>
          <div className="flex-1">
            <div className="text-sm text-white/80">Voice note</div>
            <div className="text-xs text-white/40">
              {fmt(Math.round(note.duration))} · ready for the finale
            </div>
          </div>
          <button
            onClick={remove}
            className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-[var(--rose-glow)]"
            aria-label="Delete voice note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-[11px] text-[var(--rose-glow)]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      <p className="mt-1.5 text-[11px] text-white/30">
        Record a short message in your own voice. Stays in your browser only.
      </p>
    </div>
  );
}
