const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ethers } = require('ethers');
const { Sequelize, DataTypes } = require('sequelize');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const winston = require('winston');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:2003",
        methods: ["GET", "POST"]
    }
});

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Database configuration
const sequelize = new Sequelize(
    process.env.DB_NAME || 'energy_trading_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 2000,
        dialect: 'postgres',
        logging: false
    }
);

// Define database models
const Alert = sequelize.define('Alert', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    alertId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    severity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    transactionHash: {
        type: DataTypes.STRING,
        allowNull: true
    },
    blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'mitigated', 'resolved'),
        defaultValue: 'active'
    }
});

const Trade = sequelize.define('Trade', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    buyer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    seller: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false
    },
    transactionHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

const CircuitBreakerEvent = sequelize.define('CircuitBreakerEvent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    newState: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    triggeredBy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

// Blockchain configuration
const provider = new ethers.providers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545'
);

const contractAddress = process.env.ENERGY_CONTRACT_ADDRESS;
const contractABI = require('../contracts/EnergyTradingContract.json').abi;
const energyContract = new ethers.Contract(contractAddress, contractABI, provider);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global variables for tracking
let activeAlerts = new Map();
let circuitBreakerState = 'Normal';
let mitigationStrategies = new Map();

// Initialize mitigation strategies
function initializeMitigationStrategies() {
    mitigationStrategies.set('ENERGY-SUSPICIOUS-VOLUME', {
        action: 'MONITOR',
        threshold: 3,
        circuitBreaker: false
    });
    
    mitigationStrategies.set('ENERGY-RAPID-TRADING', {
        action: 'PAUSE_USER',
        threshold: 2,
        circuitBreaker: false
    });
    
    mitigationStrategies.set('ENERGY-FRONT-RUNNING', {
        action: 'CIRCUIT_BREAKER',
        threshold: 1,
        circuitBreaker: true
    });
    
    mitigationStrategies.set('ENERGY-UNUSUAL-PRICE', {
        action: 'MONITOR',
        threshold: 5,
        circuitBreaker: false
    });
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        circuitBreakerState: circuitBreakerState,
        activeAlerts: activeAlerts.size
    });
});

// Receive alerts from Forta Agent
app.post('/api/alerts', async (req, res) => {
    try {
        const { findings, transactionHash, blockNumber, timestamp } = req.body;
        
        logger.info('Received alerts from Forta Agent', {
            findingsCount: findings.length,
            transactionHash,
            blockNumber
        });
        
        // Process each finding
        for (const finding of findings) {
            await processAlert(finding, transactionHash, blockNumber, timestamp);
        }
        
        // Emit real-time updates to frontend
        io.emit('newAlerts', {
            alerts: findings,
            timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, processed: findings.length });
        
    } catch (error) {
        logger.error('Error processing alerts:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const { page = 1, limit = 50, status } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = status ? { status } : {};
        
        const alerts = await Alert.findAndCountAll({
            where: whereClause,
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            alerts: alerts.rows,
            total: alerts.count,
            page: parseInt(page),
            totalPages: Math.ceil(alerts.count / limit)
        });
        
    } catch (error) {
        logger.error('Error fetching alerts:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get alert statistics
app.get('/api/alerts/stats', async (req, res) => {
    try {
        const stats = await Alert.findAll({
            attributes: [
                'severity',
                'type',
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['severity', 'type', 'status']
        });
        
        res.json({ stats });
        
    } catch (error) {
        logger.error('Error fetching alert stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get recent trades
app.get('/api/trades', async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        const trades = await Trade.findAndCountAll({
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            trades: trades.rows,
            total: trades.count,
            page: parseInt(page),
            totalPages: Math.ceil(trades.count / limit)
        });
        
    } catch (error) {
        logger.error('Error fetching trades:', error);
        res.status(500).json({ error: error.message });
    }
});

// Circuit breaker control
app.post('/api/circuit-breaker', async (req, res) => {
    try {
        const { action, reason } = req.body;
        
        if (!['pause', 'resume', 'emergency'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        await triggerCircuitBreaker(action, reason);
        
        res.json({ success: true, action, reason });
        
    } catch (error) {
        logger.error('Error triggering circuit breaker:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get circuit breaker status
app.get('/api/circuit-breaker/status', async (req, res) => {
    try {
        const contractState = await energyContract.getContractState();
        
        res.json({
            contractState: contractState.state,
            totalSupply: contractState.totalSupply_.toString(),
            dailyVolume: contractState.dailyVolume_.toString(),
            lastVolumeReset: new Date(contractState.lastVolumeReset_.toNumber() * 1000).toISOString()
        });
        
    } catch (error) {
        logger.error('Error fetching circuit breaker status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Process individual alert
async function processAlert(finding, transactionHash, blockNumber, timestamp) {
    try {
        // Store alert in database
        const alert = await Alert.create({
            alertId: finding.alertId,
            name: finding.name,
            description: finding.description,
            severity: finding.severity,
            type: finding.type,
            metadata: finding.metadata,
            transactionHash,
            blockNumber,
            timestamp: new Date(timestamp)
        });
        
        // Add to active alerts
        activeAlerts.set(finding.alertId, {
            ...finding,
            timestamp: new Date(timestamp),
            id: alert.id
        });
        
        // Check if mitigation is needed
        await checkMitigation(finding);
        
        logger.info('Alert processed', {
            alertId: finding.alertId,
            severity: finding.severity,
            type: finding.type
        });
        
    } catch (error) {
        logger.error('Error processing alert:', error);
        throw error;
    }
}

// Check if mitigation is needed
async function checkMitigation(finding) {
    const strategy = mitigationStrategies.get(finding.alertId);
    
    if (!strategy) {
        return;
    }
    
    // Count recent alerts of this type
    const recentAlerts = await Alert.count({
        where: {
            alertId: finding.alertId,
            timestamp: {
                [Sequelize.Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            }
        }
    });
    
    if (recentAlerts >= strategy.threshold) {
        await executeMitigation(finding, strategy);
    }
}

// Execute mitigation strategy
async function executeMitigation(finding, strategy) {
    try {
        logger.warn('Executing mitigation strategy', {
            alertId: finding.alertId,
            strategy: strategy.action,
            threshold: strategy.threshold
        });
        
        switch (strategy.action) {
            case 'CIRCUIT_BREAKER':
                await triggerCircuitBreaker('pause', `Mitigation for ${finding.alertId}`);
                break;
                
            case 'PAUSE_USER':
                // Implement user-specific pause logic
                logger.info('User pause mitigation executed', {
                    user: finding.metadata?.user,
                    alertId: finding.alertId
                });
                break;
                
            case 'MONITOR':
                // Enhanced monitoring - log for analysis
                logger.info('Enhanced monitoring activated', {
                    alertId: finding.alertId,
                    metadata: finding.metadata
                });
                break;
        }
        
        // Update alert status
        await Alert.update(
            { status: 'mitigated' },
            { where: { alertId: finding.alertId } }
        );
        
    } catch (error) {
        logger.error('Error executing mitigation:', error);
    }
}

// Trigger circuit breaker
async function triggerCircuitBreaker(action, reason) {
    try {
        const privateKey = process.env.CONTRACT_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('Contract private key not configured');
        }
        
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractWithSigner = energyContract.connect(wallet);
        
        let newState;
        switch (action) {
            case 'pause':
                newState = 1; // Paused
                break;
            case 'resume':
                newState = 0; // Normal
                break;
            case 'emergency':
                newState = 2; // Emergency
                break;
            default:
                throw new Error('Invalid action');
        }
        
        const tx = await contractWithSigner.triggerCircuitBreaker(newState, reason);
        await tx.wait();
        
        // Log circuit breaker event
        await CircuitBreakerEvent.create({
            newState: action,
            reason,
            triggeredBy: wallet.address,
            timestamp: new Date()
        });
        
        circuitBreakerState = action;
        
        // Emit to frontend
        io.emit('circuitBreakerTriggered', {
            action,
            reason,
            timestamp: new Date().toISOString()
        });
        
        logger.info('Circuit breaker triggered', { action, reason });
        
    } catch (error) {
        logger.error('Error triggering circuit breaker:', error);
        throw error;
    }
}

// Scheduled tasks
cron.schedule('0 * * * *', async () => {
    // Hourly cleanup of old alerts
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await Alert.destroy({
            where: {
                timestamp: {
                    [Sequelize.Op.lt]: thirtyDaysAgo
                },
                status: 'resolved'
            }
        });
        
        logger.info('Cleaned up old alerts');
    } catch (error) {
        logger.error('Error cleaning up old alerts:', error);
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info('Client connected', { id: socket.id });
    
    socket.on('disconnect', () => {
        logger.info('Client disconnected', { id: socket.id });
    });
    
    // Send initial data to new connections
    socket.emit('initialData', {
        circuitBreakerState,
        activeAlertsCount: activeAlerts.size
    });
});

// Database initialization
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established');
        
        await sequelize.sync({ alter: true });
        logger.info('Database models synchronized');
        
    } catch (error) {
        logger.error('Database initialization error:', error);
        process.exit(1);
    }
}

// Start server
const PORT = process.env.PORT || 2002;

async function startServer() {
    try {
        await initializeDatabase();
        initializeMitigationStrategies();
        
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Circuit breaker state: ${circuitBreakerState}`);
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 