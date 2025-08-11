# Energy Trading System - Service Startup Script
# This script starts the backend and frontend services

Write-Host "Starting Energy Trading System Services..." -ForegroundColor Green

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✓ .env file created. Please edit it with your configuration." -ForegroundColor Green
}

# Create necessary directories
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs" | Out-Null
    Write-Host "✓ Created logs directory" -ForegroundColor Green
}

if (-not (Test-Path "database")) {
    New-Item -ItemType Directory -Name "database" | Out-Null
    Write-Host "✓ Created database directory" -ForegroundColor Green
}

# Start services with Docker Compose
Write-Host "Starting services with Docker Compose..." -ForegroundColor Yellow

try {
    # Stop any existing containers
    docker-compose down
    
    # Build and start services
    docker-compose up --build -d
    
    Write-Host "✓ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:2002" -ForegroundColor White
    Write-Host "  Backend:  http://localhost:2001" -ForegroundColor White
    Write-Host "  Database: localhost:2000" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "To stop services: docker-compose down" -ForegroundColor Yellow
    
} catch {
    Write-Host "✗ Failed to start services. Check the error above." -ForegroundColor Red
    Write-Host "You can try running: docker-compose up --build" -ForegroundColor Yellow
}
