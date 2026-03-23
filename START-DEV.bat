@echo off
title Med-AI Development Server
color 0A

echo ═══════════════════════════════════════════════════
echo    MED-AI PROJECT - QUICK START
echo ═══════════════════════════════════════════════════
echo.

cd /d "%~dp0"
echo 📍 Location: %CD%
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo 🆕 First time setup detected!
    echo.
    echo 📦 Installing dependencies...
    call bun install
    echo.
    echo 🗄️  Setting up database...
    call bun run db:push
    echo.
)

echo 🚀 Starting development server...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   🌐 App URL: http://localhost:3000
echo.
echo   💡 Tips:
echo      • Save files to see changes
echo      • Press Ctrl+C to stop
echo      • Check terminal for errors
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Wait and open browser
timeout /t 5 /nobreak >nul
start http://localhost:3000

:: Start dev server
call bun dev

pause
