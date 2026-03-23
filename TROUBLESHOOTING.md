# 🔧 Med-AI Troubleshooting Guide

Quick solutions to common problems you might encounter.

---

## 🚨 Common Problems & Solutions

### 1. Port 3000 Already in Use

**Error Message:**
```
Port 3000 is already in use
EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Option A - Find and kill the process:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual number)
taskkill /PID <PID_NUMBER> /F
```

**Option B - Use a different port:**
```bash
# Edit package.json, change:
"dev": "next dev"
# to:
"dev": "next dev -p 3001"

# Then run:
bun dev
# Access at: http://localhost:3001
```

---

### 2. Database Connection Failed

**Error Message:**
```
Error: connect ECONNREFUSED
Database connection error
```

**Solutions:**

1. **Check your `.env` file has `DATABASE_URL`**
2. **Push schema to database:**
   ```bash
   bun run db:push
   ```
3. **Check if Neon database is active** (free tier may pause)
4. **Verify DATABASE_URL format:**
   ```
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   ```

---

### 3. Module Not Found Error

**Error Message:**
```
Module not found: Can't resolve 'xyz'
Error: Cannot find module 'abc'
```

**Solutions:**

```bash
# Delete and reinstall dependencies
rm -rf node_modules
rm bun.lock
bun install

# If that doesn't work, also clear Next.js cache
rm -rf .next
bun dev
```

---

### 4. Build Failed After Git Pull

**Error Message:**
```
Error: Build failed
Type errors in components
```

**Solutions:**

```bash
# Reinstall dependencies (new packages may have been added)
bun install

# Update database schema (schema might have changed)
bun run db:push

# Clear cache and restart
rm -rf .next
bun dev
```

---

### 5. Changes Not Showing in Browser

**Symptoms:**
- Save file but browser doesn't update
- Old code still running

**Solutions:**

1. **Check if dev server is running** (look at terminal)
2. **Hard refresh browser:**
   - Chrome/Edge: `Ctrl + Shift + R`
   - Or open DevTools and right-click refresh button → "Empty Cache and Hard Reload"
3. **Clear Next.js cache:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next
   bun dev
   ```

---

### 6. Bun Command Not Found

**Error Message:**
```
'bun' is not recognized as an internal or external command
```

**Solutions:**

**Install Bun:**
```powershell
# PowerShell (as Administrator)
powershell -c "irm bun.sh/install.ps1 | iex"
```

**OR use alternative package manager:**
```bash
# Use npm instead
npm install
npm run dev

# Use yarn instead
yarn install
yarn dev
```

---

### 7. OpenAI API Errors

**Error Message:**
```
OpenAI API Error 401
Invalid API key
Rate limit exceeded
```

**Solutions:**

1. **Check API key in `.env`:**
   ```env
   OPENAI_API_KEY="sk-proj-..."
   ```
2. **Verify key is valid** at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. **Check account has credits**
4. **Check rate limits** (wait a few minutes if exceeded)

---

### 8. Stream.io Video/Chat Errors

**Error Message:**
```
Stream API Error
Invalid API key
```

**Solutions:**

1. **Check `.env` has all Stream keys:**
   ```env
   NEXT_PUBLIC_STREAM_VIDEO_API_KEY="..."
   STREAM_VIDEO_SECRECT_KEY="..."
   NEXT_PUBLIC_STREAM_CHAT_API_KEY="..."
   STREAM_CHAT_SECRECT_KEY="..."
   ```
2. **Verify keys** at [getstream.io/dashboard](https://getstream.io/dashboard)
3. **Restart dev server** after changing `.env`

---

### 9. Better Auth Errors

**Error Message:**
```
Auth error
Invalid secret
```

**Solutions:**

1. **Check `.env` has auth config:**
   ```env
   BETTER_AUTH_SECRET=...
   BETTER_AUTH_URL=http://localhost:3000
   ```
2. **Ensure BETTER_AUTH_URL matches your dev server URL**
3. **If secret is missing, generate one:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

### 10. Slow Performance / App Hanging

**Symptoms:**
- Page loads slowly
- Browser freezes
- High CPU usage

**Solutions:**

1. **Check browser DevTools Console** for errors
2. **Check terminal** for build errors
3. **Clear browser cache** (see Problem #5)
4. **Restart dev server:**
   ```bash
   # Ctrl+C to stop
   bun dev
   ```
5. **Check for infinite loops** in your code
6. **Reduce open browser tabs**

---

### 11. TypeScript Errors

**Error Message:**
```
Type 'X' is not assignable to type 'Y'
```

**Solutions:**

1. **Check the error message carefully** - TypeScript usually explains the issue
2. **Install type definitions:**
   ```bash
   bun add -d @types/node @types/react @types/react-dom
   ```
3. **Restart VS Code/Cursor** (sometimes TypeScript server needs restart)
4. **Check `tsconfig.json`** is present

---

### 12. Webhook Not Working Locally

**Symptoms:**
- External services can't reach your webhook
- Webhook endpoint returns 404

**Solutions:**

1. **Start ngrok tunnel:**
   ```bash
   bun run dev:webhook
   ```
2. **Use the ngrok URL** in external service:
   ```
   https://winning-hagfish-upright.ngrok-free.app/api/webhook
   ```
3. **Check webhook route exists:**
   ```
   src/app/api/webhook/route.ts
   ```

---

### 13. Database Studio Won't Open

**Error Message:**
```
Failed to start Drizzle Studio
Port already in use
```

**Solutions:**

```bash
# Stop any running Drizzle Studio instances
# Then run:
bun run db:studio

# Access at: https://local.drizzle.studio
```

---

## 🆘 Nuclear Option (Last Resort)

When nothing else works, try this complete reset:

```bash
# 1. Stop all running processes (Ctrl+C in all terminals)

# 2. Delete everything except source code
rm -rf node_modules
rm -rf .next
rm bun.lock

# 3. Reinstall from scratch
bun install

# 4. Reset database
bun run db:push

# 5. Start fresh
bun dev
```

---

## 🔍 Debugging Checklist

Before asking for help, check these:

- [ ] Is the dev server running? (`bun dev`)
- [ ] Did you save the file?
- [ ] Check terminal for errors
- [ ] Check browser DevTools Console (F12)
- [ ] Is `.env` file present with all keys?
- [ ] Did you run `bun install` after pulling from Git?
- [ ] Try hard refresh in browser (Ctrl+Shift+R)
- [ ] Try restarting dev server

---

## 📚 Where to Find Help

1. **Check error in terminal** - usually tells you what's wrong
2. **Browser DevTools Console (F12)** - shows frontend errors
3. **Network tab in DevTools** - shows API call failures
4. **Read this file** - `TROUBLESHOOTING.md`
5. **Check setup guide** - `SETUP.md`
6. **Search error message** on Google/Stack Overflow

---

## 💡 Prevention Tips

To avoid problems in the future:

1. **Always pull before starting:** `git pull`
2. **Run `bun install` after pulling** (if dependencies changed)
3. **Keep dev server running** while coding
4. **Don't edit `.env` while server is running**
5. **Commit often** to avoid losing work
6. **Read terminal output** - it often warns you of issues
7. **Keep Bun updated:** `bun upgrade`

---

## 🎯 Quick Command Reference

| Problem | Quick Fix |
|---------|-----------|
| Port in use | `taskkill /PID <PID> /F` |
| Module error | `bun install` |
| DB error | `bun run db:push` |
| Changes not showing | `rm -rf .next && bun dev` |
| Complete reset | Delete `node_modules`, `.next`, reinstall |

---

**Remember:** 90% of problems are solved by:
1. Restarting the dev server
2. Running `bun install`
3. Clearing the `.next` folder

---

**Still stuck?** Read the error message carefully - it usually tells you exactly what's wrong! 🎯
