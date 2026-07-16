# Local Setup Guide

This guide covers everything you need to do after downloading the project to get it running locally.

## Prerequisites

1. **Node.js 18+** — download from https://nodejs.org
2. **Bun** (recommended, much faster) — install from https://bun.sh
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

## Quick Start (Windows)

Double-click `start.bat` — it handles everything automatically.

## Quick Start (Mac/Linux)

```bash
bun install
bun run db:generate
bun run db:push
bun run dev
```

Then open http://localhost:3000

## Changes You Need to Make

### 1. Environment Variables

Create a `.env` file in the project root (it should already exist, but verify):

```
DATABASE_URL="file:./db/custom.db"
```

This uses SQLite — no external database server needed. The database file is created automatically at `db/custom.db`.

### 2. AI Configuration (Optional but Recommended)

The AI poem/compliment generator uses the `z-ai-web-dev-sdk`. It should work out of the box if the SDK is installed. If AI generation fails, the builder still works — you just won't be able to auto-generate poems.

To verify AI works:
1. Open the Builder Dashboard (`/#/builder`)
2. Fill in names
3. Scroll to "AI-generated romance"
4. Click "generate" — if a poem appears, AI is working

### 3. Port Configuration

The dev server runs on port 3000 by default. To change it:
- Edit `package.json` → `"dev": "next dev -p 3000"`
- Change `3000` to your preferred port

### 4. Database Reset

If you want to wipe all stories and start fresh:
```bash
bun run db:reset
```
Or simply delete `db/custom.db` and run `bun run db:push` again.

## How to Use

### As the Sender (Creator)

1. Open http://localhost:3000
2. Click "Open the Builder"
3. Fill in the two names (required)
4. Customize: theme, atmosphere, story, AI poem, mini-games, ending, secrets, music
5. Click "Generate unique link"
6. Copy the link (e.g. `http://localhost:3000/#/story/ABC12345`)
7. Share it with the receiver
8. Watch the "Receiver activity" panel to see when they open it and how far they get

### As the Receiver

1. Open the shared link
2. A cinematic opening plays automatically — zero inputs required
3. Their name appears throughout ("Welcome, {name}")
4. Play through the mini-games
5. Reach the question ("Will you be my Valentine?")
6. Press YES
7. Watch the finale with their name in the stars
8. Click "Let's Make This Date Happen" — the sender is notified

## File Structure Overview

```
my-project/
├── start.bat                  # Windows quick-start script
├── package.json               # Dependencies + scripts
├── prisma/
│   └── schema.prisma          # Database schema (Story + StoryView models)
├── db/
│   └── custom.db              # SQLite database (auto-created)
├── public/
│   └── manifest.json          # PWA manifest
├── .env                       # Environment variables
└── src/
    ├── app/
    │   ├── page.tsx           # Main router (landing/builder/story)
    │   ├── layout.tsx         # Root layout with fonts
    │   ├── globals.css        # Global styles + animations
    │   └── api/
    │       ├── story/         # Story CRUD + progress + status APIs
    │       └── ai/            # AI poem/compliment generation
    ├── lib/
    │   ├── experience-store.ts  # Zustand store (phase, settings, collectables)
    │   ├── story-config.ts     # Story config types + seed system
    │   ├── sound.ts            # Web Audio engine
    │   ├── themes.ts           # 7 theme definitions
    │   ├── db.ts               # Prisma client singleton
    │   └── router.ts           # Hash-based router
    ├── components/
    │   ├── builder/            # Builder Dashboard + status
    │   ├── experience/         # Opening, Journey, Question, Finale, HUD, etc.
    │   ├── games/              # 10 mini-games
    │   └── world/              # Living background, cursor trail, aurora
    └── hooks/                  # Custom React hooks
```

## Troubleshooting

### "Cannot connect to localhost:3000"
- Make sure the dev server is running (`bun run dev`)
- Check for errors in the terminal

### Database errors
- Delete `db/custom.db` and run `bun run db:push`

### AI generation not working
- The AI uses `z-ai-web-dev-sdk` which should work without API keys in this environment
- If it fails, you can still manually write poems in the builder

### Heart Catch game not counting
- This was a known bug that's been fixed. Make sure you have the latest code.
- The game uses ref-based state management to avoid React stale-closure issues.
