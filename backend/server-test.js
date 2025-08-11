const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:2000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Mock data for testing
let circuitBreakerState = 'normal';
let activeAlerts = [];
let mockTrades = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'GridSecureSim Backend (Test Mode)',
        version: '1.0.0'
    });
});

// Mock alerts endpoint
app.get('/api/alerts', (req, res) => {
    res.json({
        alerts: activeAlerts,
        total: activeAlerts.length,
        status: 'success'
    });
});

// Mock trades endpoint
app.get('/api/trades', (req, res) => {
    res.json({
        trades: mockTrades,
        total: mockTrades.length,
        status: 'success'
    });
});

// Circuit breaker status
app.get('/api/circuit-breaker/status', (req, res) => {
    res.json({
        state: circuitBreakerState,
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

// Mock alert creation
app.post('/api/alerts', (req, res) => {
    const alert = {
        id: Date.now(),
        alertId: `ALERT-${Date.now()}`,
        name: req.body.name || 'Test Alert',
        description: req.body.description || 'This is a test alert',
        severity: req.body.severity || 'medium',
        type: req.body.type || 'test',
        timestamp: new Date().toISOString(),
        status: 'active'
    };
    
    activeAlerts.push(alert);
    
    // Emit to frontend
    io.emit('newAlert', alert);
    
    res.json({
        alert,
        status: 'success',
        message: 'Alert created successfully'
    });
});

// Mock trade creation
app.post('/api/trades', (req, res) => {
    const trade = {
        id: Date.now(),
        seller: req.body.seller || '0x1234...',
        buyer: req.body.buyer || '0x5678...',
        amount: req.body.amount || 100,
        price: req.body.price || 0.05,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    
    mockTrades.push(trade);
    
    // Emit to frontend
    io.emit('newTrade', trade);
    
    res.json({
        trade,
        status: 'success',
        message: 'Trade created successfully'
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send initial data
    socket.emit('initialData', {
        circuitBreakerState,
        activeAlertsCount: activeAlerts.length,
        tradesCount: mockTrades.length
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
    
    // Handle circuit breaker toggle
    socket.on('toggleCircuitBreaker', (data) => {
        circuitBreakerState = data.state;
        io.emit('circuitBreakerUpdated', {
            state: circuitBreakerState,
            timestamp: new Date().toISOString()
        });
        console.log('Circuit breaker state changed to:', circuitBreakerState);
    });
});

// Start server
const PORT = process.env.PORT || 2002;

server.listen(PORT, () => {
    console.log(`🚀 GridSecureSim Backend (Test Mode) running on port ${PORT}`);
    console.log(`📱 Frontend should connect to: http://localhost:2000`);
    console.log(`🔌 Backend API available at: http://localhost:${PORT}`);
    console.log(`💡 This is a test version without database dependencies`);
});

// Add some sample data for testing
setTimeout(() => {
    // Add sample alert
    const sampleAlert = {
        id: Date.now(),
        alertId: 'SAMPLE-001',
        name: 'Sample Security Alert',
        description: 'This is a sample security alert for testing the system',
        severity: 'high',
        type: 'security',
        timestamp: new Date().toISOString(),
        status: 'active'
    };
    activeAlerts.push(sampleAlert);
    
    // Add sample trade
    const sampleTrade = {
        id: Date.now(),
        seller: '0x1234567890abcdef...',
        buyer: '0xfedcba0987654321...',
        amount: 150,
        price: 0.06,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    mockTrades.push(sampleTrade);
    
    console.log('📊 Added sample data for testing');
}, 2000);
