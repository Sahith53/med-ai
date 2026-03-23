# 🚀 Med-AI Project Setup Guide

## 📋 Prerequisites

Before you start, make sure you have these installed on your system:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Bun** (recommended) - [Install](https://bun.sh/)
   ```bash
   # Install Bun on Windows (PowerShell)
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
   OR use **npm** / **yarn** / **pnpm** if you prefer
3. **Git** - [Download](https://git-scm.com/)
4. **ngrok** (for webhook testing) - [Download](https://ngrok.com/)

---

## 🏁 First Time Setup

### Step 1: Clone & Navigate

```bash
cd "c:\My Stuff\LPU\SEM 7\Capstone\med-ai"
```

### Step 2: Install Dependencies

```bash
bun install
```

**Alternative package managers:**
```bash
npm install        # if using npm
yarn install       # if using yarn
pnpm install       # if using pnpm
```

### Step 3: Configure Environment Variables

The `.env` file is already configured with all necessary credentials:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Authentication (Better Auth)
BETTER_AUTH_SECRET=g4LIoUiuoAYLCszN2zR0tgRBezmqbOYv
BETTER_AUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stream.io (Video & Chat)
NEXT_PUBLIC_STREAM_VIDEO_API_KEY="bcchq3yeqa94"
STREAM_VIDEO_SECRECT_KEY="s4y8f22gnttbxhr2b82j6tw8qpju8hd37cup3h37nza6kasc65jre8r29gg6edv5"
NEXT_PUBLIC_STREAM_CHAT_API_KEY="bcchq3yeqa94"
STREAM_CHAT_SECRECT_KEY="s4y8f22gnttbxhr2b82j6tw8qpju8hd37cup3h37nza6kasc65jre8r29gg6edv5"

# OpenAI
OPENAI_API_KEY="sk-proj-..."
```

✅ **No changes needed unless you want to use different services.**

### Step 4: Set Up Database Schema

Push your database schema to Neon PostgreSQL:

```bash
bun run db:push
```

This command syncs your Drizzle ORM schema with the database.

**Output should show:**
```
✓ Schema pushed successfully
```

---

## 🎯 Running the Project

### Daily Development Workflow

**Every time you want to work on the project, run:**

```bash
bun dev
```

**What this does:**
- Starts Next.js development server
- Runs on `http://localhost:3000`
- Auto-reloads when you make code changes
- Shows build errors in terminal

**Access the app:**
Open your browser and go to: **http://localhost:3000**

---

## 🛠️ Available Commands

| Command | What It Does | When To Use |
|---------|--------------|-------------|
| `bun dev` | Start development server | **Every time** you code |
| `bun run build` | Build for production | Before deploying |
| `bun start` | Run production build | After building |
| `bun run lint` | Check code quality | Before committing |
| `bun run db:push` | Update database schema | After changing schema files |
| `bun run db:studio` | Open database GUI | To view/edit database |
| `bun run dev:webhook` | Start ngrok tunnel | When testing webhooks |

---

## 🔄 Common Workflows

### 1. Regular Development
```bash
# Open terminal in project folder
cd "c:\My Stuff\LPU\SEM 7\Capstone\med-ai"

# Start the dev server
bun dev

# Open browser: http://localhost:3000
```

### 2. After Changing Database Schema
```bash
# Push changes to database
bun run db:push

# View database in GUI (optional)
bun run db:studio
```

### 3. Testing Webhooks Locally
```bash
# Terminal 1: Run the app
bun dev

# Terminal 2: Start ngrok tunnel
bun run dev:webhook
```

This exposes your local server at: `winning-hagfish-upright.ngrok-free.app`

### 4. Viewing Database
```bash
bun run db:studio
```
Opens Drizzle Studio at `https://local.drizzle.studio`

---

## 🐛 Troubleshooting

### Problem: Port 3000 already in use
**Solution:**
```bash
# Kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change port in package.json:
"dev": "next dev -p 3001"
```

### Problem: Database connection error
**Solution:**
- Check if `DATABASE_URL` in `.env` is correct
- Ensure Neon database is active (free tier may pause)
- Run `bun run db:push` to sync schema

### Problem: "Module not found" errors
**Solution:**
```bash
# Delete and reinstall dependencies
rm -rf node_modules
rm bun.lock
bun install
```

### Problem: OpenAI API errors
**Solution:**
- Verify API key in `.env` is valid
- Check OpenAI account has credits
- Check API usage limits

### Problem: Build errors after `git pull`
**Solution:**
```bash
# Reinstall dependencies
bun install

# Push database changes
bun run db:push

# Clear Next.js cache
rm -rf .next
bun dev
```

---

## 📂 Project Structure

```
med-ai/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   └── webhook/  # Webhook handlers
│   │   ├── page.tsx      # Home page
│   │   └── layout.tsx    # Root layout
│   ├── db/               # Database config & schema
│   │   └── index.ts      # Drizzle setup
│   └── modules/          # Feature modules
│       └── agents/       # AI agent features
├── public/               # Static assets
├── .env                  # Environment variables
├── package.json          # Dependencies & scripts
├── next.config.ts        # Next.js configuration
├── drizzle.config.ts     # Database configuration
└── tsconfig.json         # TypeScript config
```

---

## 🔐 Security Notes

1. **Never commit `.env` to Git** (it's in `.gitignore`)
2. **API Keys**: Current keys are exposed - consider rotating them before production
3. **Database**: Using pooled connection for better performance
4. **HTTPS**: Use ngrok or similar for secure webhook testing

---

## 🎓 Key Technologies Used

| Technology | Purpose | Docs |
|------------|---------|------|
| **Next.js 15** | React framework | [nextjs.org](https://nextjs.org) |
| **Bun** | JavaScript runtime | [bun.sh](https://bun.sh) |
| **Drizzle ORM** | Database toolkit | [orm.drizzle.team](https://orm.drizzle.team) |
| **Neon** | PostgreSQL database | [neon.tech](https://neon.tech) |
| **Better Auth** | Authentication | [better-auth.com](https://better-auth.com) |
| **Stream.io** | Video/Chat SDK | [getstream.io](https://getstream.io) |
| **OpenAI** | AI/GPT models | [openai.com](https://openai.com) |
| **Inngest** | Background jobs | [inngest.com](https://inngest.com) |

---

## 📝 Quick Reference Card

**Copy this for daily use:**

```bash
# 1. Navigate to project
cd "c:\My Stuff\LPU\SEM 7\Capstone\med-ai"

# 2. Start development
bun dev

# 3. Access app
# Browser: http://localhost:3000
```

**That's it! You're ready to code! 🎉**

---

## 💡 Tips

1. **Keep terminal open**: Don't close the terminal running `bun dev`
2. **Hot reload**: Save files and browser auto-refreshes
3. **Check console**: Browser DevTools shows errors
4. **Check terminal**: Build errors appear here
5. **Commit often**: Use Git to save your progress

---

## 🆘 Need Help?

- Check terminal output for errors
- Read Next.js docs: https://nextjs.org/docs
- Check this file: `SETUP.md`
- Review `.env` file for correct credentials

---

**Last Updated:** March 2026
