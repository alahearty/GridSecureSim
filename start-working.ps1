# Working Start Script for GridSecureSim
# Uses existing dependencies to start the application

Write-Host "🚀 Starting GridSecureSim (Working Mode)..." -ForegroundColor Green

# Kill any existing Node.js processes
Write-Host "🔄 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Check if backend can start
Write-Host "`n📡 Testing Backend..." -ForegroundColor Cyan
try {
    # Start backend in background
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    }
    
    # Wait for backend to start
    Start-Sleep -Seconds 5
    
    # Check if backend is responding
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:2002/api/health" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✅ Backend is running on port 2002" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Backend may not be fully started yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Failed to start backend: $($_.Exception.Message)" -ForegroundColor Red
}

# Start frontend
Write-Host "`n🌐 Starting Frontend..." -ForegroundColor Cyan
try {
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "$using:PWD\frontend"
        $env:PORT = "2000"
        npm start
    }
    Write-Host "   ✅ Frontend starting on port 2000" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to start frontend: $($_.Exception.Message)" -ForegroundColor Red
}

# Display status
Write-Host "`n📊 Application Status:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:2002" -ForegroundColor White
Write-Host "   Frontend: http://localhost:2000" -ForegroundColor White

Write-Host "`n🔧 Management Commands:" -ForegroundColor Yellow
Write-Host "   View jobs: Get-Job" -ForegroundColor White
Write-Host "   Stop all: Get-Job | Stop-Job" -ForegroundColor White
Write-Host "   View logs: Receive-Job -Job (Get-Job | Select-Object -First 1)" -ForegroundColor White

Write-Host "`n🎉 GridSecureSim is starting!" -ForegroundColor Green
Write-Host "💡 Check the URLs above in your browser" -ForegroundColor Yellow
