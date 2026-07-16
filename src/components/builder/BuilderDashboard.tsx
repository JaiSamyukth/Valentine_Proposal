"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  Wand2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Music,
} from "lucide-react";
import { usePhotos } from "@/lib/photo-store";
import { THEME_LIST } from "@/lib/themes";
import { playPop, vibrate } from "@/lib/sound";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { StoryConfig } from "@/lib/story-config";
import { DEFAULT_STORY_CONFIG } from "@/lib/story-config";
import { storyUrl, navigate } from "@/lib/router";
import { StoryStatus } from "./StoryStatus";

const MINI_GAMES = [
  { key: "heartcatch", label: "Heart Catch", emoji: "🧺" },
  { key: "memory", label: "Memory Match", emoji: "🃏" },
  { key: "hidden", label: "Find Hidden Heart", emoji: "🔍" },
  { key: "whack", label: "Whack-a-Heart", emoji: "🔨" },
  { key: "cupid", label: "Cupid's Arrow", emoji: "🏹" },
  { key: "wheel", label: "Spin the Wheel", emoji: "🎡" },
  { key: "bubble", label: "Bubble Hearts", emoji: "🫧" },
  { key: "treasure", label: "Treasure Hunt", emoji: "🗝️" },
  { key: "reaction", label: "Heart Reflex", emoji: "⚡" },
  { key: "bouquet", label: "Build a Bouquet", emoji: "💐" },
];

const ENDING_STYLES = [
  { key: "fireworks", label: "Fireworks", emoji: "🎆" },
  { key: "lanterns", label: "Floating Lanterns", emoji: "🏮" },
  { key: "constellation", label: "Constellations", emoji: "🌟" },
  { key: "sunrise", label: "Sunrise", emoji: "🌅" },
];

const CONFETTI_STYLES = [
  { key: "hearts", label: "Hearts", emoji: "❤️" },
  { key: "roses", label: "Roses", emoji: "🌹" },
  { key: "stars", label: "Stars", emoji: "⭐" },
  { key: "mixed", label: "Mixed", emoji: "✨" },
];

const WEATHERS = [
  { key: "clear", label: "Clear", emoji: "🌌" },
  { key: "rain", label: "Gentle Rain", emoji: "🌧️" },
  { key: "snow", label: "Snow", emoji: "❄️" },
  { key: "aurora", label: "Aurora", emoji: "🌠" },
  { key: "stars", label: "Starfield", emoji: "✨" },
];

export function BuilderDashboard() {
  const [config, setConfig] = useState<StoryConfig>({ ...DEFAULT_STORY_CONFIG });
  const [saving, setSaving] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState<"poem" | "compliment" | null>(null);
  const photos = usePhotos((s) => s.photos);

  const update = (patch: Partial<StoryConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
  };

  const valid = config.senderName.trim() && config.receiverName.trim();

  const save = async () => {
    if (!valid) {
      vibrate(40);
      return;
    }
    setSaving(true);
    try {
      // include photo URLs in config
      const configToSave = {
        ...config,
        photos: photos.map((p) => p.url),
      };
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: configToSave }),
      });
      const data = await res.json();
      if (data.id) {
        setStoryId(data.id);
        playPop();
        vibrate(30);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (!storyId) return;
    const url = storyUrl(storyId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  const previewStory = () => {
    if (!storyId) return;
    navigate("story", storyId);
  };

  const generateAI = async (type: "poem" | "compliment") => {
    setAiLoading(type);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          receiverName: config.receiverName,
          senderName: config.senderName,
          context: config.quote || undefined,
        }),
      });
      const data = await res.json();
      if (data.text) {
        if (type === "poem") update({ aiPoem: data.text });
        else update({ aiCompliment: data.text });
        playPop();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(null);
    }
  };

  const toggleMiniGame = (key: string) => {
    const games = config.miniGames.includes(key)
      ? config.miniGames.filter((g) => g !== key)
      : [...config.miniGames, key];
    update({ miniGames: games });
    playPop();
  };

  return (
    <div className="relative z-10 min-h-screen w-full px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
            <Wand2 className="h-3.5 w-3.5 text-[var(--gold)]" />
            builder dashboard
          </div>
          <h1 className="font-display text-4xl leading-tight gradient-text-rose sm:text-5xl">
            Direct their experience
          </h1>
          <p className="mt-3 font-script text-lg text-white/60">
            Configure every detail. Generate a link. They open it — and a world
            built just for them begins.
          </p>
        </motion.div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          {/* Required fields */}
          <Section title="The two names" required>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="From (your name)"
                value={config.senderName}
                onChange={(v) => update({ senderName: v })}
                placeholder="Alex"
              />
              <Field
                label="To (their name)"
                value={config.receiverName}
                onChange={(v) => update({ receiverName: v })}
                placeholder="Jordan"
              />
            </div>
          </Section>

          {/* Theme */}
          <Section title="World theme">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {THEME_LIST.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    playPop();
                    update({ theme: t.key });
                  }}
                  className={cn(
                    "relative overflow-hidden rounded-xl border p-2 text-left transition-all btn-bouncy",
                    config.theme === t.key
                      ? "border-[var(--rose-glow)] glow-rose"
                      : "border-white/10 hover:border-white/30"
                  )}
                  style={{ background: t.sky }}
                >
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative">
                    <div className="text-xl">{t.cursorEmoji}</div>
                    <div className="mt-1 text-[10px] font-medium text-white">
                      {t.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* World customization */}
          <Section title="Atmosphere">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-white/50">
                  Weather
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {WEATHERS.map((w) => (
                    <button
                      key={w.key}
                      onClick={() => {
                        playPop();
                        update({ weather: w.key as StoryConfig["weather"] });
                      }}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs transition-all",
                        config.weather === w.key
                          ? "bg-[var(--rose-glow)]/20 text-[var(--rose-glow)]"
                          : "glass text-white/60"
                      )}
                    >
                      {w.emoji} {w.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-white/50">
                  Particle intensity
                </Label>
                <div className="flex gap-1.5">
                  {(["calm", "normal", "party"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        playPop();
                        update({ particleIntensity: p });
                      }}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs capitalize transition-all",
                        config.particleIntensity === p
                          ? "bg-[var(--rose-glow)]/20 text-[var(--rose-glow)]"
                          : "glass text-white/60"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Story & message */}
          <Section title="Story & message">
            <div className="space-y-4">
              <Field
                label="A short quote"
                value={config.quote}
                onChange={(v) => update({ quote: v })}
                placeholder="In all the world, there is no heart for me like yours."
              />
              <Field
                label="Your message (revealed at the finale)"
                value={config.message}
                onChange={(v) => update({ message: v })}
                placeholder="Every moment with you feels like coming home..."
                multiline
              />
              <Field
                label="Pet name"
                value={config.petName}
                onChange={(v) => update({ petName: v })}
                placeholder="my moon"
              />
              <Field
                label="Date suggestion"
                value={config.dateSuggestion}
                onChange={(v) => update({ dateSuggestion: v })}
                placeholder="Dinner under the stars, this Saturday"
              />
            </div>
          </Section>

          {/* AI generation */}
          <Section title="AI-generated romance">
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-[0.2em] text-white/50">
                    <Sparkles className="mr-1 inline h-3 w-3 text-[var(--gold)]" />
                    Love poem
                  </Label>
                  <button
                    onClick={() => generateAI("poem")}
                    disabled={!config.receiverName || aiLoading === "poem"}
                    className="flex items-center gap-1 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-xs text-[var(--gold)] disabled:opacity-40"
                  >
                    {aiLoading === "poem" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Wand2 className="h-3 w-3" />
                    )}
                    generate
                  </button>
                </div>
                <Textarea
                  value={config.aiPoem}
                  onChange={(e) => update({ aiPoem: e.target.value })}
                  placeholder="Click generate to create a poem for them..."
                  rows={3}
                  className="resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[var(--gold)]"
                />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-[0.2em] text-white/50">
                    <Heart className="mr-1 inline h-3 w-3 text-[var(--rose-glow)]" />
                    Compliment
                  </Label>
                  <button
                    onClick={() => generateAI("compliment")}
                    disabled={!config.receiverName || aiLoading === "compliment"}
                    className="flex items-center gap-1 rounded-full border border-[var(--rose-glow)]/40 bg-[var(--rose-glow)]/10 px-3 py-1 text-xs text-[var(--rose-glow)] disabled:opacity-40"
                  >
                    {aiLoading === "compliment" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Wand2 className="h-3 w-3" />
                    )}
                    generate
                  </button>
                </div>
                <Textarea
                  value={config.aiCompliment}
                  onChange={(e) => update({ aiCompliment: e.target.value })}
                  placeholder="Click generate to craft a compliment..."
                  rows={2}
                  className="resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[var(--rose-glow)]"
                />
              </div>
            </div>
          </Section>

          {/* Mini-games selection */}
          <Section title="Mini-games in their journey">
            <div className="flex flex-wrap gap-2">
              {MINI_GAMES.map((g) => (
                <button
                  key={g.key}
                  onClick={() => toggleMiniGame(g.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all",
                    config.miniGames.includes(g.key)
                      ? "bg-[var(--rose-glow)]/20 text-[var(--rose-glow)] border border-[var(--rose-glow)]/40"
                      : "glass text-white/50 border border-white/10"
                  )}
                >
                  <span>{g.emoji}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Ending */}
          <Section title="Ending style">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-white/50">
                  Finale
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {ENDING_STYLES.map((e) => (
                    <button
                      key={e.key}
                      onClick={() => {
                        playPop();
                        update({ endingStyle: e.key as StoryConfig["endingStyle"] });
                      }}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs transition-all",
                        config.endingStyle === e.key
                          ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                          : "glass text-white/60"
                      )}
                    >
                      {e.emoji} {e.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-white/50">
                  Confetti
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {CONFETTI_STYLES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => {
                        playPop();
                        update({ confettiStyle: c.key as StoryConfig["confettiStyle"] });
                      }}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs transition-all",
                        config.confettiStyle === c.key
                          ? "bg-[var(--rose-glow)]/20 text-[var(--rose-glow)]"
                          : "glass text-white/60"
                      )}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Secrets */}
          <Section title="Secrets">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Secret code (they can type it)"
                value={config.secretCode}
                onChange={(v) => update({ secretCode: v })}
                placeholder="forever"
              />
              <Field
                label="Secret message (revealed by the code)"
                value={config.secretMessage}
                onChange={(v) => update({ secretMessage: v })}
                placeholder="There's a hidden note just for you..."
              />
            </div>
          </Section>

          {/* Photos note */}
          <Section title="Photos & music">
            <p className="mb-2 text-xs text-white/40">
              Photos can be added after generating the link (in the live preview).
              Music links:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Spotify"
                value={config.spotifyUrl}
                onChange={(v) => update({ spotifyUrl: v })}
                placeholder="https://open.spotify.com/..."
                icon={<Music className="h-3.5 w-3.5" />}
              />
              <Field
                label="YouTube"
                value={config.youtubeUrl}
                onChange={(v) => update({ youtubeUrl: v })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </Section>

          {/* Generate button */}
          <div className="mt-8">
            <motion.button
              onClick={save}
              whileHover={{ scale: valid ? 1.02 : 1 }}
              whileTap={{ scale: valid ? 0.98 : 1 }}
              disabled={!valid || saving}
              className={cn(
                "relative w-full overflow-hidden rounded-2xl py-4 font-display text-lg transition-all",
                valid && !saving
                  ? "bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] text-black glow-rose"
                  : "cursor-not-allowed bg-white/10 text-white/40"
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                {storyId ? "Update experience" : "Generate unique link"}
              </span>
              {valid && !saving && (
                <span className="absolute inset-0 shimmer opacity-40" />
              )}
            </motion.button>

            {!valid && (
              <p className="mt-2 text-center text-xs text-[var(--rose-glow)]">
                Both names are needed to generate the link.
              </p>
            )}
          </div>

          {/* Generated link */}
          <AnimatePresence>
            {storyId && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                className="mt-4 overflow-hidden"
              >
                <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                    ✨ their unique link
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-black/40 px-3 py-2 text-sm text-white/80">
                      {storyUrl(storyId)}
                    </code>
                    <button
                      onClick={copyLink}
                      className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-[var(--gold)]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={previewStory}
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] px-3 py-2 text-xs text-black"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      preview
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-white/40">
                    Opening this link begins their experience immediately — zero
                    inputs, everything pre-configured.
                  </p>
                </div>

                {/* Receiver activity tracking */}
                <div className="mt-4">
                  <StoryStatus storyId={storyId} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Each link generates a unique procedural universe — no two are identical.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  required,
}: {
  title: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 flex items-center gap-1 font-display text-sm uppercase tracking-[0.15em] text-white/70">
        {title}
        {required && <span className="text-[var(--rose-glow)]">*</span>}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-white/50">
        {label}
      </Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[var(--rose-glow)]"
        />
      ) : (
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </span>
          )}
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[var(--rose-glow)]",
              icon && "pl-9"
            )}
          />
        </div>
      )}
    </div>
  );
}
