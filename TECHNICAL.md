# Technical Documentation

## System Overview

A cinematic Valentine's/Proposal experience built as a two-sided web application: a **Builder Dashboard** where a sender configures a personalized world, and a **Receiver Experience** that plays automatically when they open a unique link — zero inputs required.

## Technology Stack

### Core
- **Next.js 16.1.3** with App Router + Turbopack
- **TypeScript 5** (strict mode)
- **React 19**
- **Tailwind CSS 4** with custom design tokens
- **shadcn/ui** (New York style) component library

### Animation & Visuals
- **Framer Motion 12** — page transitions, spring physics, layout animations
- **Canvas 2D API** — custom particle system (fireflies, hearts, petals, stars)
- **canvas-confetti** — celebration effects
- **CSS animations** — heartbeat, aurora shift, twinkle, float

### State & Data
- **Zustand 5** with `persist` middleware — client state (phase, settings, collectables, achievements)
- **Prisma 6** + **SQLite** — server-side story persistence
- **IndexedDB** — voice note blob persistence across reloads
- **useSyncExternalStore** — hash-based router (SSR-safe)

### Audio
- **Web Audio API** — procedural sound generation (heartbeat, chimes, ambient pad, sparkles)
- **Howler.js 2** — uploaded music playback

### AI
- **z-ai-web-dev-sdk** — LLM-powered poem and compliment generation

### Fonts
- **Inter** — body text
- **Playfair Display** — display headings
- **Cormorant Garamond** — script/romantic text

## Architecture

### Routing

Hash-based routing avoids server-side route configuration:

| URL | Mode | Description |
|-----|------|-------------|
| `/` | landing | Entry point with CTA |
| `/#/builder` | builder | Sender's configuration dashboard |
| `/#/story/:id` | receiver | Zero-input receiver experience |

The router uses `useSyncExternalStore` for SSR compatibility:

```ts
export function useRouter(): RouteState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

### Database Schema

```prisma
model Story {
  id        String   @id          // 8-char unique ID (e.g. "ABC12345")
  config    String                // JSON-encoded StoryConfig
  seed      Int                   // Procedural seed derived from ID
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model StoryView {
  id            String   @id @default(cuid())
  storyId       String
  openedAt      DateTime @default(now())
  lastSeenAt    DateTime @updatedAt
  completedAt   DateTime?          // null until receiver finishes
  currentPhase  String   @default("opening")
  currentScene  Int      @default(0)
  yesPressed    Boolean  @default(false)
  dateAccepted  Boolean  @default(false)  // clicked the final CTA
  userAgent     String?
}
```

### Story Configuration

The `StoryConfig` interface (`src/lib/story-config.ts`) contains 25+ fields:

- **Required**: senderName, receiverName
- **Story**: quote, message, petName, chapters, dialogues, reasons, timeline
- **Media**: photos, voiceNoteUrl, spotifyUrl, youtubeUrl
- **World**: theme (7 options), particleIntensity, weather, timeOfDay
- **Gameplay**: miniGames (array of 10 game keys), difficulty
- **Ending**: endingStyle, confettiStyle
- **Secrets**: secretCode, secretMessage
- **AI**: aiPoem, aiCompliment

### Procedural Seed System

Each story ID generates a deterministic seed:

```ts
export function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
```

The seed varies particle density (±20%) via a mulberry32 PRNG. Same story ID → same visual density every visit.

### Game Loop Pattern

All mini-games use a bulletproof ref-based pattern to avoid React stale-closure bugs:

```ts
// Refs hold the source of truth
const itemsRef = useRef<Item[]>([]);
const onWinRef = useRef(onWin);

// RAF loop reads/writes refs, syncs to state for rendering
useEffect(() => {
  let raf = 0;
  const tick = () => {
    const next = computeNext(itemsRef.current);  // pure function
    itemsRef.current = next;                      // update ref
    setItems(next);                               // update state (plain value, not updater)
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, []);
```

**Why not `setState((prev) => ...)` updaters?** React may defer updater execution in concurrent mode. Variables assigned inside an updater (`deferredScore = addScore`) are read as 0 outside it. This was the root cause of the Heart Catch score-not-counting bug.

### Progress Tracking

The receiver reports progress via `POST /api/story/:id/progress`:

1. **On open**: `{ phase: "opening" }` — creates a StoryView row
2. **On phase change**: `{ phase: "journey"|"question"|"finale", scene: N }`
3. **On YES press**: `{ yesPressed: true }`
4. **On final button**: `{ phase: "done", completed: true, dateAccepted: true }`

The sender's Builder Dashboard polls `GET /api/story/:id/status` every 15 seconds to display:
- Total views
- Completions
- Date accepted (prominent banner)
- Latest view phase + progress bar
- All sessions list

### Audio Engine

`src/lib/sound.ts` uses the Web Audio API to generate all sounds procedurally — no audio files needed:

- **Master gain** → 0.5 volume, mutable
- **Heartbeat**: Two sine wave thumps (60Hz → 32Hz) with exponential decay
- **Chimes**: Triangle wave with frequency sweep
- **Ambient pad**: 3 sine oscillators (110/165/220Hz) with slow LFO modulation
- **Sparkles**: High-frequency sine bursts (1200-2600Hz)

### Chaos Events

| Event | Trigger | Effect | Duration |
|-------|---------|--------|----------|
| LoveOS Boot | 12% chance, journey/question | Fake OS boot sequence with terminal lines | Until dismissed |
| 8-bit Retro | 6% chance, journey/question | Pixelation overlay, scanlines, retro HUD | 5s auto-dismiss |
| Gravity Flip | 5% chance, journey/question | Page rotates 180°, floating arrows | 4s auto-dismiss |
| Fake Blue Screen | 4% chance, journey/question | Windows BSOD with love-themed stop code | 5s or keypress |

### Performance

- **Turbopack** for sub-second hot reloads
- **Canvas particles** capped at 130 (device-scaled)
- **DPR capped at 2** for canvas rendering
- **requestAnimationFrame** for all game loops (pauses when tab inactive)
- **Zustand selectors** prevent unnecessary re-renders
- **Code splitting** via dynamic imports (PortalRoom loaded on demand)

### Accessibility

- `prefers-reduced-motion` disables animations
- Semantic HTML (`main`, `header`, `nav`, `section`)
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen-reader-only content where needed
- Color contrast meets WCAG AA on key text

## API Reference

### `POST /api/story`
Create a new story.

**Request body:**
```json
{ "config": { "senderName": "Alex", "receiverName": "Jordan", ... } }
```

**Response:**
```json
{ "id": "ABC12345", "seed": 1234567890 }
```

### `GET /api/story/:id`
Load a story configuration.

**Response:**
```json
{ "id": "ABC12345", "config": { ... }, "seed": 1234567890 }
```

### `POST /api/story/:id/progress`
Report receiver progress.

**Request body:**
```json
{ "phase": "journey", "scene": 3, "yesPressed": false, "completed": false, "dateAccepted": false }
```

### `GET /api/story/:id/status`
Get receiver activity (for the sender).

**Response:**
```json
{
  "totalViews": 2,
  "completions": 1,
  "dateAccepted": true,
  "latestView": { "currentPhase": "done", "yesPressed": true, "dateAccepted": true, ... },
  "allViews": [ ... ]
}
```

### `POST /api/ai`
Generate AI content.

**Request body:**
```json
{ "type": "poem", "receiverName": "Jordan", "senderName": "Alex", "context": "optional" }
```

**Response:**
```json
{ "text": "Our hands, a quiet map of all the places..." }
```

## File Count

| Category | Files |
|----------|-------|
| Mini-games | 10 |
| Experience components | 20 |
| World components | 3 |
| Builder components | 2 |
| UI components (shadcn) | 50+ |
| API routes | 4 |
| Lib/hooks | 15 |
| **Total source files** | **~105** |
