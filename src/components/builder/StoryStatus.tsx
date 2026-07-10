"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CheckCircle2,
  Clock,
  Heart,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { playPop } from "@/lib/sound";

interface ViewData {
  openedAt: string;
  lastSeenAt: string;
  completedAt: string | null;
  currentPhase: string;
  currentScene: number;
  yesPressed: boolean;
}

interface StatusData {
  totalViews: number;
  completions: number;
  latestView: ViewData | null;
  allViews: ViewData[];
}

interface Props {
  storyId: string;
}

const PHASE_LABELS: Record<string, { label: string; emoji: string; pct: number }> = {
  opening: { label: "Opening sequence", emoji: "🎬", pct: 5 },
  journey: { label: "On the journey", emoji: "🗺️", pct: 30 },
  question: { label: "Reached the question", emoji: "💞", pct: 75 },
  finale: { label: "Watching the finale", emoji: "🎆", pct: 95 },
  done: { label: "Completed", emoji: "✨", pct: 100 },
};

export function StoryStatus({ storyId }: Props) {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/story/${storyId}/status`);
      const data = await res.json();
      setStatus(data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(true), 15000);
    return () => clearInterval(interval);
  }, [storyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    );
  }

  if (!status || status.totalViews === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <Eye className="mx-auto mb-2 h-6 w-6 text-white/30" />
        <p className="font-script text-sm text-white/50">
          No one has opened this link yet.
        </p>
        <p className="mt-1 text-[11px] text-white/30">
          You&apos;ll see when they do — check back here anytime.
        </p>
      </div>
    );
  }

  const latest = status.latestView;
  const phaseInfo = latest
    ? PHASE_LABELS[latest.currentPhase] || PHASE_LABELS.opening
    : null;
  const isComplete = latest?.completedAt !== null;

  return (
    <div className="rounded-2xl border border-[var(--rose-glow)]/20 bg-[var(--rose-glow)]/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
          <Eye className="h-3.5 w-3.5 text-[var(--rose-glow)]" />
          receiver activity
        </div>
        <button
          onClick={() => {
            playPop();
            fetchStatus();
          }}
          className="flex items-center gap-1 rounded-full glass px-2 py-1 text-[10px] text-white/50 hover:text-white/80"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <div className="font-display text-2xl text-white">
            {status.totalViews}
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-white/40">
            {status.totalViews === 1 ? "view" : "views"}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <div className="font-display text-2xl text-[var(--gold)]">
            {status.completions}
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-white/40">
            completed
          </div>
        </div>
      </div>

      {/* Latest view */}
      {latest && phaseInfo && (
        <AnimatePresence mode="wait">
          <motion.div
            key={latest.currentPhase + latest.currentScene}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-black/30 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-white/80">
                <span className="text-lg">{phaseInfo.emoji}</span>
                {phaseInfo.label}
              </span>
              {isComplete ? (
                <span className="flex items-center gap-1 rounded-full bg-[var(--gold)]/20 px-2 py-0.5 text-[10px] text-[var(--gold)]">
                  <CheckCircle2 className="h-3 w-3" />
                  done
                </span>
              ) : latest.yesPressed ? (
                <span className="flex items-center gap-1 rounded-full bg-[var(--rose-glow)]/20 px-2 py-0.5 text-[10px] text-[var(--rose-glow)]">
                  <Heart className="h-3 w-3 fill-current" />
                  said yes!
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full glass px-2 py-0.5 text-[10px] text-white/50">
                  <Clock className="h-3 w-3" />
                  in progress
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)]"
                initial={{ width: 0 }}
                animate={{ width: `${phaseInfo.pct}%` }}
                transition={{ duration: 0.6 }}
                style={{ boxShadow: "0 0 8px rgba(255,94,138,0.5)" }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-white/40">
              <span>
                opened {timeAgo(latest.openedAt)}
              </span>
              <span>
                last seen {timeAgo(latest.lastSeenAt)}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* All views list (if multiple) */}
      {status.allViews.length > 1 && (
        <div className="mt-3 space-y-1">
          <div className="text-[10px] uppercase tracking-[0.15em] text-white/30">
            all sessions
          </div>
          {status.allViews.slice(0, 5).map((v, i) => {
            const pi = PHASE_LABELS[v.currentPhase] || PHASE_LABELS.opening;
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2 py-1 text-[11px]"
              >
                <span className="text-white/50">
                  {pi.emoji} {pi.label}
                </span>
                <span className="text-white/30">{timeAgo(v.openedAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
