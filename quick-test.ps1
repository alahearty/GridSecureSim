# Quick Test for GridSecureSim
Write-Host "Testing GridSecureSim..." -ForegroundColor Green

# Test 1: Check if backend is running
Write-Host "`n1. Testing Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:2002/api/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   Backend is running and responding" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "   Backend is not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check if frontend port is available
Write-Host "`n2. Testing Frontend Port..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:2000" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   Frontend is responding on port 2000" -ForegroundColor Green
} catch {
    Write-Host "   Frontend is not responding on port 2000: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest Complete!" -ForegroundColor Green
Write-Host "If backend is not working, run: node backend/server-test.js" -ForegroundColor Yellow
Write-Host "If frontend is not working, run: cd frontend; `$env:PORT=2000; npm start" -ForegroundColor Yellow
