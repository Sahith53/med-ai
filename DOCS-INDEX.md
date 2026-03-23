# 📚 Med-AI Documentation Index

Welcome! This file helps you find the right documentation quickly.

---

## 🎯 "I want to..."

### Start the Project
- **Quick:** Just run `bun dev` (see [QUICK-START.txt](QUICK-START.txt))
- **First time:** Follow [SETUP.md](SETUP.md)
- **Visual guide:** See [STARTUP-FLOW.md](STARTUP-FLOW.md)
- **Automated:** Double-click `START-DEV.bat`

### Fix a Problem
- **Troubleshooting:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Quick fixes:** Check [QUICK-START.txt](QUICK-START.txt) → Troubleshooting section

### Learn About the Project
- **Overview:** See [README.md](README.md)
- **Tech stack:** See [README.md](README.md) → Tech Stack section
- **Project structure:** See [SETUP.md](SETUP.md) → Project Structure

### Understand a Workflow
- **Daily coding:** See [STARTUP-FLOW.md](STARTUP-FLOW.md) → Workflows
- **After git pull:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) → Problem #4
- **Testing webhooks:** See [SETUP.md](SETUP.md) → Testing Webhooks

---

## 📖 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **README.md** | Project overview & tech stack | Learn about the project |
| **SETUP.md** | Complete setup guide | First time setup, detailed info |
| **QUICK-START.txt** | Cheat sheet | Quick reference anytime |
| **STARTUP-FLOW.md** | Visual guides & workflows | Understand the process |
| **TROUBLESHOOTING.md** | Fix common problems | When something breaks |
| **DOCS-INDEX.md** | This file | Find other docs |

---

## 🚀 Quick Start Paths

### Path 1: Complete Beginner
1. Read [README.md](README.md) - Understand what this is
2. Read [SETUP.md](SETUP.md) - Learn how to set up
3. Follow setup steps
4. Bookmark [QUICK-START.txt](QUICK-START.txt) for future use

### Path 2: Just Want to Code
1. Double-click `START-DEV.bat`
2. Wait for browser to open
3. Start coding!
4. Keep [QUICK-START.txt](QUICK-START.txt) nearby

### Path 3: Visual Learner
1. Read [STARTUP-FLOW.md](STARTUP-FLOW.md)
2. Follow the flowcharts
3. Use [QUICK-START.txt](QUICK-START.txt) as reference

---

## 🔧 Common Scenarios

### Scenario: "I forgot how to start the project"
→ Open [QUICK-START.txt](QUICK-START.txt)
→ Or double-click `START-DEV.bat`

### Scenario: "Something is broken"
→ Open [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
→ Find your error message
→ Follow the solution

### Scenario: "I pulled from Git and now it's broken"
→ [TROUBLESHOOTING.md](TROUBLESHOOTING.md) → Problem #4

### Scenario: "I need to add a new package"
→ Run `bun add <package-name>`
→ Commit the `bun.lock` file

### Scenario: "Database schema changed"
→ Run `bun run db:push`

### Scenario: "I want to see the database"
→ Run `bun run db:studio`
→ Opens at `https://local.drizzle.studio`

---

## 🎓 Learning Resources

### Next.js (Framework)
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Tutorial](https://nextjs.org/learn)

### Bun (Runtime)
- [Bun Docs](https://bun.sh/docs)

### Drizzle (Database)
- [Drizzle Docs](https://orm.drizzle.team)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)

### Stream.io (Video/Chat)
- [Stream Video Docs](https://getstream.io/video/docs/)
- [Stream Chat Docs](https://getstream.io/chat/docs/)

### Better Auth (Authentication)
- [Better Auth Docs](https://better-auth.com)

### OpenAI (AI)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## 📋 Command Reference

### Essential Commands
```bash
bun dev              # Start development server
bun install          # Install dependencies
bun run db:push      # Update database schema
bun run db:studio    # Open database GUI
```

### Build Commands
```bash
bun run build        # Build for production
bun start            # Run production build
bun run lint         # Check code quality
```

### Development Commands
```bash
bun run dev:webhook  # Start ngrok for webhooks
```

---

## 🗂️ Project Structure Overview

```
med-ai/
├── 📄 Documentation Files
│   ├── README.md              (Project overview)
│   ├── SETUP.md              (Complete setup guide)
│   ├── QUICK-START.txt       (Cheat sheet)
│   ├── STARTUP-FLOW.md       (Visual guides)
│   ├── TROUBLESHOOTING.md    (Problem solutions)
│   └── DOCS-INDEX.md         (This file)
│
├── 🚀 Quick Start Scripts
│   ├── START-DEV.bat         (Windows batch script)
│   └── start-dev.ps1         (PowerShell script)
│
├── 💻 Source Code
│   └── src/
│       ├── app/              (Pages & API routes)
│       ├── db/               (Database)
│       └── modules/          (Features)
│
├── ⚙️ Configuration
│   ├── .env                  (Environment variables)
│   ├── package.json          (Dependencies)
│   ├── next.config.ts        (Next.js config)
│   ├── drizzle.config.ts     (Database config)
│   └── tsconfig.json         (TypeScript config)
│
└── 📦 Dependencies
    └── node_modules/         (Installed packages)
```

---

## 💡 Pro Tips

1. **Bookmark this file** - it's your documentation hub
2. **Keep QUICK-START.txt open** - for quick reference
3. **Check TROUBLESHOOTING.md first** - when something breaks
4. **Use START-DEV.bat** - for hassle-free startup
5. **Read terminal output** - it tells you what's wrong

---

## 🎯 Most Used Files (Bookmark These!)

| File | Frequency | Purpose |
|------|-----------|---------|
| **QUICK-START.txt** | Daily | Quick commands reference |
| **TROUBLESHOOTING.md** | When stuck | Fix problems |
| **START-DEV.bat** | Daily | Automated startup |

---

## 📞 Help Decision Tree

```
Got a question?
│
├─ "How do I start?"
│  └─ QUICK-START.txt or START-DEV.bat
│
├─ "Something's broken"
│  └─ TROUBLESHOOTING.md
│
├─ "First time setup"
│  └─ SETUP.md
│
├─ "Want to understand the process"
│  └─ STARTUP-FLOW.md
│
├─ "What is this project?"
│  └─ README.md
│
└─ "Where do I find...?"
   └─ DOCS-INDEX.md (you are here!)
```

---

## 🔄 Keep This Updated

When adding new documentation:
1. Create the file
2. Add it to this index
3. Update the "I want to..." section if relevant
4. Commit the changes

---

**Welcome to Med-AI! You now have all the documentation you need to succeed! 🎉**

*Last Updated: March 2026*
