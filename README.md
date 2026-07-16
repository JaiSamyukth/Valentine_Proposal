# 💖 Love Experience

A cinematic, interactive Valentine's Day / Proposal web app. Build a personalized world for someone special, share a link, and they experience a zero-input cinematic journey — with their name in the stars, mini-games, and a heartfelt question.

## Quick Start

### Windows
Double-click `start.bat`

### Mac/Linux
```bash
bun install && bun run db:push && bun run dev
```
Open http://localhost:3000

## Documentation

| Document | Description |
|----------|-------------|
| [LOCAL_SETUP.md](./LOCAL_SETUP.md) | Setup guide — what to change after downloading |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to Vercel, Docker, or self-host |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Architecture, game loop patterns, how to add features |
| [TECHNICAL.md](./TECHNICAL.md) | Full technical reference (API, schema, systems) |
| [CUSTOMER.md](./CUSTOMER.md) | Customer-facing feature overview |
| [INVESTOR.md](./INVESTOR.md) | Market analysis, business model, financials |

## How It Works

1. **You** (the sender) open `/#/builder` and configure everything — names, theme, story, games, music, secrets
2. Click "Generate unique link" → get a shareable URL like `/#/story/ABC12345`
3. **They** (the receiver) open the link → a cinematic experience begins automatically (zero inputs)
4. They play through mini-games, reach "Will you be my Valentine?", press YES, see a finale with their name in the stars
5. **You** see it all in real-time — when they opened, how far they got, and the moment they accept the date

## Features

- 🎬 Cinematic opening ("Searching the universe... Receiver located: {name}")
- 🎮 10 mini-games (Heart Catch, Memory Match, Cupid's Arrow, Treasure Hunt, etc.)
- ✨ Dynamic personalization (receiver's name as glowing star letters)
- 🤖 AI-generated love poems & compliments
- 📸 Photos + voice notes (in-browser, persisted via IndexedDB)
- 🎵 Spotify/YouTube music embed
- 🌌 7 themes (Aurora, Galaxy, Blossom, Sunset, Forest, Ocean, Luxury)
- 🌀 Procedural seeds (each link is a unique universe)
- 💖 Receiver tracking (views, progress, "date accepted" notification)
- 🔒 Secret codes (hide a message in the Collection HUD)
- 🎉 4 chaos events (LoveOS boot, 8-bit retro, gravity flip, fake blue screen)
- 🏆 12 achievements + 12 collectable types
- 🕹️ Easter eggs (Konami code, typed commands, Developer Room, Portal Room)

## Tech Stack

Next.js 16 · TypeScript · Tailwind CSS 4 · Framer Motion · Prisma · SQLite · Zustand · Web Audio API · z-ai-web-dev-sdk

## License

MIT — build something beautiful.
