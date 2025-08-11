# Minimal Start Script for GridSecureSim
# This script starts the application with existing dependencies

Write-Host "🚀 Starting GridSecureSim (Minimal Mode)..." -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "⚠️  Please update .env file with your configuration" -ForegroundColor Yellow
}

# Start services individually
Write-Host "`n📡 Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host "🌐 Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; PORT=2000 npm start"

Write-Host "`n🎉 GridSecureSim is starting!" -ForegroundColor Green
Write-Host "📱 Access Points:" -ForegroundColor White
Write-Host "   Dashboard: http://localhost:2000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:2002" -ForegroundColor White
Write-Host "`n💡 Note: This is minimal mode. Some features may require additional setup." -ForegroundColor Yellow
