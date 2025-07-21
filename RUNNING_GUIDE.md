# 🚀 Energy Trading Protection System - Running Guide

## 📋 Port Configuration

The system has been configured with the following ports:

- **Dashboard (Frontend)**: `http://localhost:2000`
- **Backend API**: `http://localhost:2002`
- **PostgreSQL Database**: `localhost:2001`

## 🛠️ Prerequisites

Before running the system, ensure you have:

- **Node.js 16+** and npm
- **Docker** and Docker Compose
- **Git** (for cloning the repository)

## 🚀 Quick Start (Recommended)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd energy-trading-protection-system
npm install
```

### 2. Environment Configuration

```bash
# Copy the environment template
cp env.example .env

# Edit the .env file with your configuration
# Important: Update these values:
# - ENERGY_CONTRACT_ADDRESS (after deployment)
# - CONTRACT_PRIVATE_KEY
# - SIMULATION_PRIVATE_KEY
```

### 3. Deploy Smart Contract

```bash
# Compile contracts
npm run compile

# Deploy to local network
npm run deploy:contract

# The deployment script will automatically update your .env file
# with the contract address
```

### 4. Start the System

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or use the quick start script
./start.sh
```

### 5. Access the System

Once all services are running, access the system at:

- **Dashboard**: http://localhost:2000
- **Backend API**: http://localhost:2002
- **Database**: localhost:2001

## 🔧 Manual Setup (Alternative)

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

### Option 2: Individual Components

#### Start Database
```bash
# Start PostgreSQL
docker run -d \
  --name energy_trading_db \
  -e POSTGRES_DB=energy_trading_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 2001:5432 \
  postgres:15
```

#### Start Backend
```bash
# Set environment variables
export PORT=2002
export DB_HOST=localhost
export DB_PORT=2001
export DB_NAME=energy_trading_db
export DB_USER=postgres
export DB_PASSWORD=password

# Start backend
npm run dev
```

#### Start Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start with custom port
PORT=2000 npm start
```

#### Start Simulation Engine
```bash
# Start simulation
npm run simulate

# Or run specific scenarios
node simulation/engine.js start
node simulation/engine.js test
```

## 📊 System Verification

### 1. Check Service Status

```bash
# Check if all containers are running
docker-compose ps

# Expected output:
# Name                    Command               State           Ports
# energy_trading_backend    node backend/server.js    Up      0.0.0.0:2002->3001/tcp
# energy_trading_db         docker-entrypoint.sh postgres    Up      0.0.0.0:2001->5432/tcp
# energy_trading_frontend   nginx -g daemon off;            Up      0.0.0.0:2000->3000/tcp
```

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:2002/api/health

# Get alerts
curl http://localhost:2002/api/alerts

# Get trades
curl http://localhost:2002/api/trades

# Circuit breaker status
curl http://localhost:2002/api/circuit-breaker/status
```

### 3. Database Connection

```bash
# Connect to PostgreSQL
psql -h localhost -p 2001 -U postgres -d energy_trading_db

# Or use Docker
docker exec -it energy_trading_db psql -U postgres -d energy_trading_db
```

## 🧪 Testing & Simulation

### Run Simulation Engine

```bash
# Start simulation with default parameters
npm run simulate

# Run specific attack scenarios
node simulation/engine.js start

# Quick test simulation
node simulation/engine.js test
```

### Attack Scenarios

The simulation engine can test:

1. **Front-Running Attacks**
2. **Flash Loan Attacks**
3. **Volume Manipulation Attacks**

### Monitor Results

- Check the dashboard at http://localhost:2000
- View alerts in real-time
- Monitor circuit breaker status
- Analyze trade patterns

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the ports
netstat -tulpn | grep :2000
netstat -tulpn | grep :2001
netstat -tulpn | grep :2002

# Kill processes if needed
sudo kill -9 <PID>
```

#### 2. Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres
```

#### 3. Backend Connection Issues
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

#### 4. Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Reset System

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## 📈 Monitoring & Management

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df
```

### Backup Database

```bash
# Create backup
docker exec energy_trading_db pg_dump -U postgres energy_trading_db > backup.sql

# Restore backup
docker exec -i energy_trading_db psql -U postgres energy_trading_db < backup.sql
```

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong passwords for database
- Keep private keys secure
- Rotate keys regularly

### Network Security

- The system runs on localhost by default
- For production, configure proper firewall rules
- Use HTTPS in production environments
- Implement proper authentication

## 📝 Configuration Files

### Key Configuration Files

- `docker-compose.yml` - Service orchestration
- `env.example` - Environment template
- `backend/server.js` - Backend configuration
- `frontend/src/App.js` - Frontend configuration
- `hardhat.config.js` - Smart contract configuration

### Environment Variables

```bash
# Required for operation
ENERGY_CONTRACT_ADDRESS=0x...
CONTRACT_PRIVATE_KEY=0x...
DB_HOST=localhost
DB_PORT=2001
PORT=2002

# Optional for testing
SIMULATION_PRIVATE_KEY=0x...
BLOCKCHAIN_RPC_URL=http://localhost:8545
```

## 🎯 Next Steps

1. **Deploy to Testnet**: Update configuration for testnet deployment
2. **Add Authentication**: Implement user authentication
3. **Scale Up**: Configure for production deployment
4. **Monitor**: Set up monitoring and alerting
5. **Backup**: Implement automated backup strategies

## 📞 Support

For issues or questions:

1. Check the logs: `docker-compose logs -f`
2. Verify configuration: Check `.env` file
3. Test connectivity: Use the API endpoints
4. Review documentation: Check README.md

---

**Note**: This system is configured for development and testing. For production deployment, additional security measures and configuration are required. 