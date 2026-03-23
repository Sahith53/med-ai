# 🎯 Med-AI Startup Flow

## Visual Guide: How to Start Your Project

```
┌─────────────────────────────────────────────────────────┐
│  START HERE: Want to work on Med-AI?                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  ❓ Is this your FIRST TIME?                            │
└─────────────────────────────────────────────────────────┘
                          │
           ┌──────────────┴──────────────┐
           │                             │
          YES                           NO
           │                             │
           ▼                             ▼
┌────────────────────┐        ┌──────────────────────┐
│  FIRST TIME SETUP  │        │   REGULAR STARTUP    │
│  ─────────────────  │        │   ───────────────    │
│  1. bun install    │        │   1. Open terminal   │
│  2. bun run db:push│        │   2. cd to project   │
│  3. bun dev        │        │   3. bun dev         │
└────────────────────┘        └──────────────────────┘
           │                             │
           └──────────────┬──────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  ✅ Server Running at http://localhost:3000             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  💻 CODE → SAVE → AUTO-RELOAD → SEE CHANGES             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  🛑 Done? Press Ctrl+C in terminal to stop              │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Commands

### Option A: First Time Setup
```bash
# 1. Navigate to project
cd "c:\My Stuff\LPU\SEM 7\Capstone\med-ai"

# 2. Install dependencies
bun install

# 3. Set up database
bun run db:push

# 4. Start development server
bun dev

# 5. Open browser
start http://localhost:3000
```

### Option B: Regular Startup (Every Other Time)
```bash
# 1. Navigate to project
cd "c:\My Stuff\LPU\SEM 7\Capstone\med-ai"

# 2. Start server
bun dev

# 3. Open browser
start http://localhost:3000
```

---

## 🔄 Common Workflows

### Workflow 1: Daily Coding Session
```
Open Terminal → cd to project → bun dev → Code → Save → See changes
```

### Workflow 2: After Pulling from Git
```
git pull → bun install → bun run db:push → bun dev
```

### Workflow 3: Testing Webhooks
```
Terminal 1: bun dev
Terminal 2: bun run dev:webhook
```

### Workflow 4: Database Changes
```
Edit schema → bun run db:push → bun dev
```

---

## 🎨 Visual Process Map

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  INSTALL │ ──> │ DATABASE │ ──> │   START  │ ──> │   CODE   │
│ packages │     │  setup   │     │   app    │     │  & test  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
bun install      bun run          bun dev          Save files
                 db:push                           Browser reloads
```

---

## 🎯 Decision Tree: "Something's Not Working"

```
┌───────────────────────┐
│  Is the server        │
│  running?             │
└───────────────────────┘
         │
    ┌────┴────┐
   NO        YES
    │          │
    ▼          ▼
Run       ┌───────────────┐
bun dev   │ Can you see   │
          │ localhost:3000?│
          └───────────────┘
               │
          ┌────┴────┐
         NO        YES
          │          │
          ▼          ▼
      Check      ┌────────────┐
      terminal   │ Changes    │
      for errors │ showing?   │
                 └────────────┘
                      │
                 ┌────┴────┐
                NO        YES
                 │          │
                 ▼          ▼
            Save file   ✅ WORKING!
            Clear .next   Keep coding
            Restart
```

---

## 💡 Pro Tips

1. **Bookmark** `http://localhost:3000` in your browser
2. **Pin** this file for quick reference
3. **Keep terminal open** while coding
4. **Use Ctrl+C** to stop the server
5. **Check terminal first** when errors occur

---

## 🚨 Emergency Fixes

### Nuclear Option (When nothing works)
```bash
# Stop server (Ctrl+C)
rm -rf node_modules
rm -rf .next
rm bun.lock
bun install
bun run db:push
bun dev
```

### Quick Reset
```bash
# Stop server (Ctrl+C)
rm -rf .next
bun dev
```

---

## 📞 Help Resources

| Problem | Solution File |
|---------|--------------|
| "How do I start?" | QUICK-START.txt |
| "Detailed setup" | SETUP.md |
| "Project info" | README.md |
| "Visual guide" | STARTUP-FLOW.md (this file) |

---

**Remember:** Most of the time, you just need to run `bun dev` and you're good to go! 🚀
