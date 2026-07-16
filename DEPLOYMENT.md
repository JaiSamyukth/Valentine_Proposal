# Deployment Guide

## Option 1: Vercel (Recommended)

Vercel is the easiest deployment target for Next.js apps.

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/love-experience.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment**
   - In Vercel project settings, add environment variable:
     - `DATABASE_URL` = `file:./db/custom.db` (for SQLite)
     - OR use a hosted database (see below)

4. **Deploy**
   - Vercel builds and deploys automatically
   - Your app is live at `https://your-project.vercel.app`

### Database on Vercel

SQLite doesn't persist on serverless platforms. For production, use a hosted database:

**Option A: PlanetScale (MySQL)**
1. Create account at https://planetscale.com
2. Create a database
3. Get connection string
4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url = env("DATABASE_URL")
   }
   ```
5. Set `DATABASE_URL` in Vercel env vars

**Option B: Supabase (PostgreSQL)**
1. Create account at https://supabase.com
2. Create a project
3. Get connection string
4. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url = env("DATABASE_URL")
   }
   ```

**Option C: Turso (SQLite at the edge)**
1. Create account at https://turso.tech
2. Create a database
3. Get connection string
4. Set `DATABASE_URL` in Vercel env vars

### Custom Domain

1. In Vercel project settings → Domains
2. Add your domain (e.g. `love.yourdomain.com`)
3. Update DNS records as instructed

---

## Option 2: Self-Hosted (VPS/Docker)

### Using Docker

1. **Create `Dockerfile`**:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npx prisma generate
   RUN npm run build

   FROM node:20-alpine
   WORKDIR /app
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/prisma ./prisma
   COPY --from=builder /app/db ./db
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Update `next.config`** for standalone output:
   ```js
   const nextConfig = {
     output: 'standalone',
   };
   ```

3. **Build and run**:
   ```bash
   docker build -t love-experience .
   docker run -p 3000:3000 -v $(pwd)/db:/app/db love-experience
   ```

### Using PM2 (without Docker)

```bash
npm install -g pm2
npm run build
pm2 start npm --name "love-experience" -- start
pm2 save
pm2 startup
```

---

## Option 3: Static Export (Limited)

> Note: Static export won't support server-side APIs (story persistence, AI generation).
> Only use this if you don't need link sharing across devices.

```bash
# In next.config, add: output: 'export'
npm run build
# Output goes to /out
```

Deploy the `/out` folder to any static host (Netlify, GitHub Pages, Cloudflare Pages).

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `Z_AI_API_KEY` | Z.AI SDK API key (if using external) | No (SDK works without it in dev) |

## Post-Deployment Checklist

- [ ] App loads at your URL
- [ ] Builder dashboard accessible at `/#/builder`
- [ ] Can generate a story link
- [ ] Receiver link loads the cinematic opening
- [ ] Receiver can play through games
- [ ] Sender can see receiver activity in the status panel
- [ ] "Date accepted" notification works when receiver clicks the final button
- [ ] Database persists across server restarts

## Performance Notes

- The app uses Turbopack for fast dev builds
- Production builds are optimized automatically by Next.js
- Canvas particle system is GPU-accelerated
- Images use Next.js Image optimization
- Consider enabling CDN for static assets in production
