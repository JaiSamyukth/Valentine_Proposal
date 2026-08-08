# Development Guide

## Getting Started

```bash
bun install        # Install dependencies
bun run db:push    # Set up database
bun run dev        # Start dev server at localhost:3000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Animation | Framer Motion 12 |
| State | Zustand 5 (client) |
| Database | Prisma 6 + SQLite |
| Audio | Web Audio API + Howler.js |
| Confetti | canvas-confetti |
| AI | z-ai-web-dev-sdk |

## Project Architecture

### Two-Experience System

The app has three "modes" controlled by hash-based routing (`src/lib/router.ts`):

1. **Landing** (`/`) — Entry point with CTA
2. **Builder** (`/#/builder`) — Sender configures the experience
3. **Receiver** (`/#/story/:id`) — Zero-input, loads config from API

### Data Flow

```
Builder Dashboard
    ↓ POST /api/story (saves config to DB)
    ↓ Returns unique story ID
    ↓
Receiver opens /#/story/:id
    ↓ GET /api/story/:id (loads config)
    ↓ Hydrates Zustand store with settings
    ↓ Cinematic opening plays
    ↓ Journey (mini-games) → Question → Finale
    ↓ POST /api/story/:id/progress (reports progress)
    ↓
Builder's StoryStatus panel polls GET /api/story/:id/status
    ↓ Shows receiver activity in real-time
```

### State Management

**Zustand Store** (`src/lib/experience-store.ts`):
- `phase`: boot → setup → journey → question → finale
- `settings`: sender/receiver names, theme, message, miniGames, etc.
- `collectables`: 12 types (flowers, stars, hearts, etc.)
- `achievements`: 12 unlockable badges
- `currentScene`: index into the dynamic scene list
- Persisted to localStorage (partialize: settings, collectables, achievements)

**Photo Store** (`src/lib/photo-store.ts`): In-memory Zustand store for photo object URLs.

**Voice Store** (`src/lib/voice-store.ts`): In-memory + IndexedDB persistence.

### Game Architecture

Each game in `src/components/games/` follows this pattern:

```tsx
export function GameName({ onWin }: { onWin: () => void }) {
  // 1. Refs for game state (avoid stale closures in RAF loops)
  const itemsRef = useRef<Item[]>([]);
  const onWinRef = useRef(onWin);
  useEffect(() => { onWinRef.current = onWin; });

  // 2. State for rendering
  const [items, setItems] = useState<Item[]>([]);

  // 3. Game loop in useEffect with RAF
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      // Read from ref, compute next state, write to ref, setState with plain value
      const next = computeNext(itemsRef.current);
      itemsRef.current = next;
      setItems(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 4. Win condition
  useEffect(() => {
    if (score >= target && !wonRef.current) {
      wonRef.current = true;
      setTimeout(() => onWinRef.current(), 600);
    }
  }, [score]);
}
```

**Critical**: Never use `setState((prev) => { ... })` updater functions for game logic — React may defer them, causing stale reads. Use refs + plain value updates.

### Journey System

The Journey (`src/components/experience/Journey.tsx`) builds a dynamic scene list from `settings.miniGames`:

```ts
const scenes = useMemo(() => {
  const selected = settings.miniGames;
  const games = GAME_REGISTRY.filter(g => selected.includes(g.key));
  const list = [{ kind: "intro" }];
  games.forEach(g => {
    list.push({ kind: "interstitial", ...g.interstitial });
    list.push({ kind: "game", ...g });
  });
  list.push({ kind: "prequestion" });
  return list;
}, [settings.miniGames]);
```

Each game in `GAME_REGISTRY` defines: key, title, subtitle, interstitial, rewards.

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/story` | POST | Create a new story |
| `/api/story` | GET | List all stories |
| `/api/story/[id]` | GET | Load a story config |
| `/api/story/[id]` | PUT | Update a story |
| `/api/story/[id]/progress` | POST | Report receiver progress |
| `/api/story/[id]/status` | GET | Get receiver activity (for sender) |
| `/api/ai` | POST | Generate AI poem/compliment |

### Living World System

- **LivingBackground** (`src/components/world/`): Canvas-based particle system (fireflies, hearts, petals, stars). Accepts `seed` for procedural variation.
- **CursorTrail**: Heart cursor with sparkle particles.
- **AuroraLayer**: Animated gradient background per theme.
- **WanderingNPCs**: Random creatures that walk across the screen.

### Chaos Events

4 rare events (each ~5-12% chance, once per session):
- **LoveOSOverlay**: Fake OS boot sequence
- **RetroChaosMode**: 8-bit pixel mode
- **GravityFlipChaos**: Page rotates 180°
- **FakeBlueScreen**: Windows BSOD (love-themed)

### Audio Engine

`src/lib/sound.ts` uses Web Audio API for procedural audio (no external files):
- `playHeartbeat()`: Thump-thump sound
- `playChime(freq)`: Sparkling chime
- `playFlourish()`: Achievement fanfare
- `startAmbient()`: Low drone pad
- All respect the mute toggle

## Common Tasks

### Add a New Mini-Game

1. Create `src/components/games/MyGame.tsx` following the pattern above
2. Add to `GAME_REGISTRY` in `Journey.tsx`:
   ```ts
   {
     key: "mygame",
     title: "My Game",
     subtitle: "Description...",
     interstitial: { emoji: "🎮", title: "...", body: "..." },
     rewards: { collectables: [["heart", 2]], popup: "..." },
   }
   ```
3. Add to `renderGame()` switch
4. Add to `MINI_GAMES` in `BuilderDashboard.tsx`
5. Add to default `miniGames` in `experience-store.ts` and `story-config.ts`

### Add a New Theme

1. Add to `THEMES` in `src/lib/themes.ts`:
   ```ts
   mytheme: {
     key: "mytheme",
     name: "My Theme",
     sky: "linear-gradient(...)",
     particles: ["#color1", "#color2"],
     accent: "#color",
     cursorEmoji: "✨",
     creatures: ["firefly", "star"],
     description: "...",
   }
   ```
2. Add to `ThemeKey` type in `experience-store.ts`

### Add a New Achievement

1. Add key to `AchievementKey` type in `experience-store.ts`
2. Add metadata to `ACHIEVEMENT_META` in `src/lib/content.ts`
3. Call `unlock("myAchievement")` when the condition is met

## Debugging

- Check `dev.log` for server errors
- Use `bun run lint` to catch code issues
- Use agent-browser for end-to-end testing
- React DevTools for component inspection
- The Zustand store is logged to localStorage under `love-experience-v1`

## Scripts

```bash
bun run dev        # Start dev server (port 3000)
bun run build      # Production build
bun run lint       # ESLint
bun run db:push    # Push schema to database
bun run db:generate # Regenerate Prisma client
bun run db:reset   # Reset database (destroys data)
```
