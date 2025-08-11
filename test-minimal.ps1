# Test Script for GridSecureSim Components
# Tests what's working without additional dependencies

Write-Host "🧪 Testing GridSecureSim Components..." -ForegroundColor Green

# Test 1: Check Node.js
Write-Host "`n1️⃣ Testing Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not available" -ForegroundColor Red
}

# Test 2: Check npm
Write-Host "`n2️⃣ Testing npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not available" -ForegroundColor Red
}

# Test 3: Check existing dependencies
Write-Host "`n3️⃣ Testing existing dependencies..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
    $moduleCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "   📦 Found $moduleCount packages" -ForegroundColor White
} else {
    Write-Host "   ❌ node_modules not found" -ForegroundColor Red
}

# Test 4: Check frontend dependencies
Write-Host "`n4️⃣ Testing frontend dependencies..." -ForegroundColor Cyan
if (Test-Path "frontend\node_modules") {
    Write-Host "   ✅ Frontend node_modules exists" -ForegroundColor Green
    $frontendModuleCount = (Get-ChildItem "frontend\node_modules" -Directory).Count
    Write-Host "   📦 Found $frontendModuleCount packages" -ForegroundColor White
} else {
    Write-Host "   ❌ Frontend node_modules not found" -ForegroundColor Red
}

# Test 5: Check environment
Write-Host "`n5️⃣ Testing environment..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
}

# Test 6: Check key files
Write-Host "`n6️⃣ Testing key files..." -ForegroundColor Cyan
$keyFiles = @("backend\server.js", "frontend\src\App.js", "contracts\EnergyTrading.sol")
foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file not found" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Test Complete!" -ForegroundColor Green
Write-Host "💡 Run '.\start-minimal.ps1' to start the application" -ForegroundColor Yellow
