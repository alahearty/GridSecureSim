# Quick Start Guide - Energy Trading System

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ (for local development)

## Quick Start (Recommended)

### 1. Automatic Startup
Run the PowerShell script:
```powershell
.\start-services.ps1
```

This will:
- Create necessary directories
- Create `.env` file from template
- Start all services with Docker Compose

### 2. Manual Startup

#### Step 1: Create Environment File
```bash
cp env.example .env
```

#### Step 2: Create Required Directories
```bash
mkdir logs
mkdir database
```

#### Step 3: Start Services
```bash
docker-compose up --build -d
```

## Service URLs
- **Frontend Dashboard**: http://localhost:2002
- **Backend API**: http://localhost:2001
- **Database**: localhost:2000

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild and Start
```bash
docker-compose up --build -d
```

## Troubleshooting

### Port Conflicts
If you get port conflicts, check:
- Port 2000: PostgreSQL
- Port 2001: Backend API
- Port 2002: Frontend

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose ps postgres`
- Check database logs: `docker-compose logs postgres`

### Backend Issues
- Check backend logs: `docker-compose logs backend`
- Verify environment variables in `.env` file

### Frontend Issues
- Check frontend logs: `docker-compose logs frontend`
- Ensure backend is accessible at http://localhost:2001

## Development Mode

To run services locally without Docker:

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Key variables to configure in `.env`:
- `BLOCKCHAIN_RPC_URL`: Your blockchain RPC endpoint
- `ENERGY_CONTRACT_ADDRESS`: Deployed smart contract address
- `CONTRACT_PRIVATE_KEY`: Private key for contract interactions
