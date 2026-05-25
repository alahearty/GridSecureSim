# GridSecureSim

Blockchain-based energy trading simulation with real-time smart contract protection, anomaly detection, and circuit breaker controls.

## Quick Start

```bash
cp env.example .env
npm install
cd frontend && npm install && cd ..
docker-compose up --build -d
```

## Services

| Service        | URL                      |
|---------------|--------------------------|
| Frontend      | http://localhost:3000     |
| Backend API   | http://localhost:3001     |
| PostgreSQL    | localhost:5432            |
| Blockchain    | http://localhost:8545     |

## Development

```bash
npm run dev          # Backend with hot reload
npm run frontend     # React dev server
npm run compile      # Compile Solidity contracts
npm run deploy:contract  # Deploy to local chain
npm run simulate     # Run trading simulation
```

## Architecture

- **Frontend** — React + MUI dashboard with live alerts, trades, and circuit breaker controls
- **Backend** — Express API with PostgreSQL, WebSocket updates, and blockchain event monitoring
- **Smart Contract** — Solidity ERC-20 energy token with trading, rate limiting, and anomaly detection
- **Simulation** — Synthetic IoT data and attack scenario generator
- **Forta Agent** — Transaction monitoring and threat detection