# Med-AI Quick Start Script
# Double-click this file to start your development server!

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   MED-AI PROJECT - QUICK START SCRIPT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "📍 Current Directory: $ScriptDir" -ForegroundColor Green
Write-Host ""

# Check if this is first time setup
$firstTime = -not (Test-Path "node_modules")

if ($firstTime) {
    Write-Host "🆕 First time setup detected!" -ForegroundColor Yellow
    Write-Host ""
    
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    bun Install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Write-Host "💡 Try running: bun install" -ForegroundColor Yellow
        pause
        exit 1
    }
    
    Write-Host ""
    
    # Setup database
    Write-Host "🗄️  Setting up database..." -ForegroundColor Cyan
    bun run db:push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database setup complete!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database setup had issues (might be okay)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "  🌐 App will be available at:" -ForegroundColor White
Write-Host "     http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "  💡 Tips:" -ForegroundColor White
Write-Host "     • Browser will auto-reload when you save files" -ForegroundColor Gray
Write-Host "     • Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "     • Check this terminal for errors" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Wait a moment for user to read
Start-Sleep -Seconds 2

# Open browser after server starts (background job)
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:3000"
} | Out-Null

# Start the dev server
bun dev
