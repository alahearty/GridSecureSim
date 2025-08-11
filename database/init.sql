-- Energy Trading Database Initialization
-- This script creates the basic database structure

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create logs table for application logs
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Create index on timestamp for better performance
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);

-- Insert initial log entry
INSERT INTO logs (level, message, metadata) 
VALUES ('info', 'Database initialized', '{"service": "postgres", "version": "17"}');
