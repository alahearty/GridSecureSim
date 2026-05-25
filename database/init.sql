-- Energy Trading Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "Alerts" (
    id SERIAL PRIMARY KEY,
    "alertId" VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    metadata JSONB,
    "transactionHash" VARCHAR(255),
    "blockNumber" INTEGER,
    timestamp TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'resolved')),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Trades" (
    id SERIAL PRIMARY KEY,
    buyer VARCHAR(255) NOT NULL,
    seller VARCHAR(255) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    "transactionHash" VARCHAR(255) NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CircuitBreakerEvents" (
    id SERIAL PRIMARY KEY,
    "newState" VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    "triggeredBy" VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON "Alerts"(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON "Alerts"(severity);
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON "Trades"(timestamp);
