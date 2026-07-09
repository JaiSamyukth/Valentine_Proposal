# Valentine's / Proposal Experience — Worklog

## Project Status
A cinematic, single-page Valentine's/Proposal experience built on Next.js 16 + TypeScript + Tailwind 4 + Framer Motion. The site flows through a state machine: **boot → setup → journey → question → finale**, with an always-on "living world" (canvas particles, cursor sparkle trail, aurora, wandering NPCs, film grain).

## Architecture
- `src/lib/experience-store.ts` — Zustand store (persisted): phase, settings, collectables, achievements. Dispatches `achievement-unlocked` window events for toast UI.
- `src/lib/sound.ts` — Web Audio API procedural engine (heartbeat, chimes, sparkle, ambient pad) + Howler for uploaded music. No external audio files needed.
- `src/lib/themes.ts` — 7 themes (aurora, galaxy, blossom, sunset, forest, ocean, luxury) each with sky gradient, particle palette, creatures, cursor.
- `src/lib/content.ts` — collectable/achievement metadata + funny popup strings.
- `src/components/world/` — LivingBackground (canvas particle system), AuroraLayer, CursorTrail (heart cursor + sparkles).
- `src/components/experience/` — ExperienceRoot (orchestrator), OpeningSequence, SetupForm, Journey, Question, Finale, HUD, FunnyPopups, AchievementToasts, SecretListener (Konami + typed commands), WanderingNPCs, MuteButton.
- `src/components/games/` — HeartCatch, MemoryMatch, FindHiddenHeart.

## Completed (Phase 1)
- Cinematic opening: black screen → glowing heartbeat heart → typewriter lines ("You've just received something... that someone spent courage on") → entrance.
- Setup form: sender/receiver required + optional (quote, message, theme picker, favorite color, pet name, date suggestion, secret code, spotify/youtube). Glassmorphic, animated.
- Living world: canvas particles (fireflies/hearts/petals/stars/snow/bubbles) reactive to mouse, aurora gradient, film grain, vignette, custom heart cursor with sparkle trail.
- Journey: 7 scenes — intro, Heart Catch game, interstitial, Memory Match, constellation surprise, Find Hidden Heart, pre-question. Progress dots. Funny popups between.
- Question: YES button (glowing, slowly growing) + NO button chaos (transforms text→emoji→dissolves into confetti, never rejects).
- Finale: sky opens, continuous fireworks, names drawn as constellations (text-sampled stars + connecting lines), handwritten message reveal, "Let's Make This Date Happen" button.
- Achievements + collectables HUD (backpack), achievement toasts.
- Secret features: Konami code, typing commands (love, flowers, cat, galaxy, magic, etc.), wandering clickable NPCs (cat/fox/owl/butterfly/dragon/whale/ghost/alien/robot).
- Audio: procedural ambient pad + heartbeat + chimes, mute toggle, mobile vibration.
- Lint clean. Dev server compiles with no errors.

## Verification (agent-browser end-to-end)
Full flow verified via agent-browser with **zero console errors**:
1. **Boot** — black screen, glowing heartbeat heart, "tap to begin / skip intro" ✓
2. **Setup** — form renders, names required, 7 theme picker buttons, optional extras accordion, begin button disabled until valid ✓
3. **Journey intro** — "Welcome, Jordan." personalized ✓
4. **Heart Catch** — playable, caught 12 hearts, collection 22→33, auto-advanced to interstitial ✓ (fixed a setState-during-render bug by moving game state to refs)
5. **Interstitial** — "Butterflies loaded." with floating emoji ✓
6. **Memory Match** — 12 cards, solved all 6 pairs via DOM solver, auto-advanced, achievement "Cupid Certified" unlocked ✓
7. **Constellation surprise** — "Look up." auto-advanced after ~2.8s ✓
8. **Find Hidden Heart** — 24-card grid, found heart at index 22, auto-advanced, achievement "Treasure Finder" + magic key ✓
9. **Pre-question** — "Jordan, there's something I've been wanting to ask..." ✓
10. **Question** — "Jordan, will you be my Valentine?" with YES (growing/glowing) + NO (chaos: No→Maybe?→Think again→Are you sure?→Retry) ✓
11. **Finale** — sky opens, fireworks, names as constellations, message reveal ("In a world of countless stars..."), signed "— Alex", "Let's Make This Date Happen" button ✓

Also verified: wandering NPCs (🐰🐉🦋👻🤖🦉), funny popups ("Compiling romance..."), achievement toasts, collection HUD (46 items), particles, cursor heart trail, sounds. Manifest.json created to fix 404.

## Known Limitations / Next Steps
- Spotify/YouTube embed not yet wired into actual playback (links stored only).
- Only 3 of the requested ~30 mini-games implemented.
- Photo/voice-note uploads not yet implemented.
- No "fake OS boot" or rare chaos events (1% gravity-flip etc.) yet.
- Themes change particles but full scene-skin swaps (hidden universes) not yet built.
- PWA manifest referenced but not created.

## Priority Recommendations for Next Phase
1. Wire Spotify/YouTube audio playback in setup + finale.
2. Add 2–3 more mini-games (Cupid Arrow, Spin the Wheel, Sliding Puzzle).
3. Add photo/voice-note upload with object URLs.
4. Add rare chaos events + fake LoveOS boot overlay.
5. PWA manifest + service worker for offline.
6. Increase easter egg density (clickable stars, moon-click counter, double-click logo).
