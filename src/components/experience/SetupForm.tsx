"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles, Heart, Music, Link2 } from "lucide-react";
import { useExperience } from "@/lib/experience-store";
import { THEME_LIST } from "@/lib/themes";
import { playPop, vibrate } from "@/lib/sound";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SetupForm({ onBegin }: { onBegin: () => void }) {
  const settings = useExperience((s) => s.settings);
  const updateSettings = useExperience((s) => s.updateSettings);
  const [showExtras, setShowExtras] = useState(false);
  const [touched, setTouched] = useState(false);

  const valid = settings.senderName.trim() && settings.receiverName.trim();

  const begin = () => {
    setTouched(true);
    if (!valid) {
      vibrate(40);
      return;
    }
    playPop();
    vibrate(30);
    onBegin();
  };

  return (
    <motion.div
      className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="w-full max-w-xl">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
            an invitation awaits
          </div>
          <h1 className="font-display text-4xl leading-tight gradient-text-rose sm:text-5xl">
            Let's craft something
            <br />
            unforgettable
          </h1>
          <p className="mt-3 font-script text-lg text-white/60">
            Only two names are required. The rest is magic we'll add along the
            way.
          </p>
        </motion.div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="From (your name)"
                required
                value={settings.senderName}
                onChange={(v) => updateSettings({ senderName: v })}
                placeholder="Alex"
                error={touched && !settings.senderName.trim()}
              />
              <Field
                label="To (their name)"
                required
                value={settings.receiverName}
                onChange={(v) => updateSettings({ receiverName: v })}
                placeholder="Jordan"
                error={touched && !settings.receiverName.trim()}
              />
            </div>

            {/* Theme picker */}
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">
                Choose a world
              </Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {THEME_LIST.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      playPop();
                      updateSettings({ theme: t.key });
                    }}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border p-2.5 text-left transition-all btn-bouncy",
                      settings.theme === t.key
                        ? "border-[var(--rose-glow)] glow-rose"
                        : "border-white/10 hover:border-white/30"
                    )}
                    style={{ background: t.sky, backgroundSize: "cover" }}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative">
                      <div className="text-2xl">{t.cursorEmoji}</div>
                      <div className="mt-1 text-[11px] font-medium text-white">
                        {t.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Extras toggle */}
            <button
              type="button"
              onClick={() => {
                playPop();
                setShowExtras((s) => !s);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[var(--rose-glow)]" />
                Optional extras
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showExtras && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {showExtras && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pt-2">
                    <Field
                      label="A short quote"
                      value={settings.quote}
                      onChange={(v) => updateSettings({ quote: v })}
                      placeholder="In all the world, there is no heart for me like yours."
                      multiline
                    />
                    <Field
                      label="Your message (revealed at the finale)"
                      value={settings.message}
                      onChange={(v) => updateSettings({ message: v })}
                      placeholder="Every moment with you feels like coming home..."
                      multiline
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Pet name"
                        value={settings.petName}
                        onChange={(v) => updateSettings({ petName: v })}
                        placeholder="my moon"
                      />
                      <Field
                        label="Favorite color"
                        value={settings.favoriteColor}
                        onChange={(v) => updateSettings({ favoriteColor: v })}
                        placeholder="#ff5e8a"
                        type="color"
                      />
                    </div>
                    <Field
                      label="A date suggestion"
                      value={settings.dateSuggestion}
                      onChange={(v) => updateSettings({ dateSuggestion: v })}
                      placeholder="Dinner under the stars, this Saturday"
                    />
                    <Field
                      label="Secret code (they can type it later)"
                      value={settings.secretCode}
                      onChange={(v) => updateSettings({ secretCode: v })}
                      placeholder="forever"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Spotify link"
                        value={settings.spotifyUrl}
                        onChange={(v) => updateSettings({ spotifyUrl: v })}
                        placeholder="https://open.spotify.com/..."
                        icon={<Music className="h-3.5 w-3.5" />}
                      />
                      <Field
                        label="YouTube link"
                        value={settings.youtubeUrl}
                        onChange={(v) => updateSettings({ youtubeUrl: v })}
                        placeholder="https://youtube.com/watch?v=..."
                        icon={<Link2 className="h-3.5 w-3.5" />}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Begin button */}
            <motion.button
              onClick={begin}
              whileHover={{ scale: valid ? 1.02 : 1 }}
              whileTap={{ scale: valid ? 0.98 : 1 }}
              disabled={!valid}
              className={cn(
                "relative w-full overflow-hidden rounded-2xl py-4 font-display text-lg transition-all",
                valid
                  ? "bg-gradient-to-r from-[var(--rose-glow)] to-[var(--gold)] text-black glow-rose"
                  : "cursor-not-allowed bg-white/10 text-white/40"
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                Begin the journey
                <Heart className="h-5 w-5" />
              </span>
              {valid && (
                <span className="absolute inset-0 shimmer opacity-40" />
              )}
            </motion.button>

            {touched && !valid && (
              <p className="text-center text-xs text-[var(--rose-glow)]">
                Both names are needed to begin 💫
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Nothing here is uploaded. Everything lives only in this browser.
        </p>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  multiline,
  error,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  error?: boolean;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/50">
        {label}
        {required && <span className="text-[var(--rose-glow)]">*</span>}
      </Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(
            "resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[var(--rose-glow)]",
            error && "border-[var(--rose-glow)]"
          )}
        />
      ) : type === "color" ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#ff5e8a"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[var(--rose-glow)]"
          />
        </div>
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
              icon && "pl-9",
              error && "border-[var(--rose-glow)]"
            )}
          />
        </div>
      )}
    </div>
  );
}
