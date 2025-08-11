# Test Run Script for GridSecureSim
# Starts the simplified test version

Write-Host "🧪 Starting GridSecureSim Test Version..." -ForegroundColor Green

# Kill any existing Node.js processes
Write-Host "🔄 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Start the simplified backend
Write-Host "`n📡 Starting Simplified Backend..." -ForegroundColor Cyan
try {
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        node backend/server-test.js
    }
    Write-Host "   ✅ Backend job started" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to start backend: $($_.Exception.Message)" -ForegroundColor Red
}

# Wait for backend to start
Write-Host "   ⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test backend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:2002/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Backend is responding on port 2002" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Backend may not be ready yet: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Start frontend
Write-Host "`n🌐 Starting Frontend..." -ForegroundColor Cyan
try {
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "$using:PWD\frontend"
        $env:PORT = "2000"
        npm start
    }
    Write-Host "   ✅ Frontend job started" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to start frontend: $($_.Exception.Message)" -ForegroundColor Red
}

# Display status
Write-Host "`n📊 Test Application Status:" -ForegroundColor White
Write-Host "   Backend (Test):  http://localhost:2002" -ForegroundColor White
Write-Host "   Frontend:        http://localhost:2000" -ForegroundColor White

Write-Host "`n🔧 Test Endpoints:" -ForegroundColor Yellow
Write-Host "   Health Check:    http://localhost:2002/api/health" -ForegroundColor White
Write-Host "   Alerts:          http://localhost:2002/api/alerts" -ForegroundColor White
Write-Host "   Trades:          http://localhost:2002/api/trades" -ForegroundColor White
Write-Host "   Circuit Breaker: http://localhost:2002/api/circuit-breaker/status" -ForegroundColor White

Write-Host "`n🎮 Management Commands:" -ForegroundColor Yellow
Write-Host "   View jobs:       Get-Job" -ForegroundColor White
Write-Host "   Stop all:        Get-Job | Stop-Job" -ForegroundColor White
Write-Host "   View logs:       Receive-Job -Job (Get-Job | Select-Object -First 1)" -ForegroundColor White

Write-Host "`n🎉 GridSecureSim Test Version is starting!" -ForegroundColor Green
Write-Host "💡 Open http://localhost:2000 in your browser to test the frontend" -ForegroundColor Yellow
Write-Host "💡 Test the API at http://localhost:2002/api/health" -ForegroundColor Yellow

# Wait a bit and show job status
Start-Sleep -Seconds 2
Write-Host "`n📋 Current Jobs:" -ForegroundColor Cyan
Get-Job | Format-Table -AutoSize
