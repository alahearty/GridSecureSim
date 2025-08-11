const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'GridSecureSim Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Backend is working!',
        data: 'Test successful'
    });
});

// Start server
const PORT = 2002;
app.listen(PORT, () => {
    console.log(`🚀 GridSecureSim Simple Backend running on port ${PORT}`);
    console.log(`📱 Test at: http://localhost:${PORT}/api/health`);
    console.log(`💡 This is a minimal working version`);
});

console.log('Starting server...');
