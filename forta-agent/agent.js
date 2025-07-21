const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { ethers } = require("ethers");

// Configuration
const CONFIG = {
    // Contract addresses (to be set after deployment)
    ENERGY_CONTRACT_ADDRESS: process.env.ENERGY_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    
    // Anomaly detection thresholds
    SUSPICIOUS_VOLUME_THRESHOLD: ethers.utils.parseEther("500"), // 500 ETH
    RAPID_TRADE_THRESHOLD: 5, // trades per minute
    UNUSUAL_PRICE_MIN: ethers.utils.parseEther("0.1"), // 0.1 ETH
    UNUSUAL_PRICE_MAX: ethers.utils.parseEther("2"), // 2 ETH
    LARGE_MINTING_THRESHOLD: ethers.utils.parseEther("500"), // 500 ETH
    
    // Time windows for analysis
    ANALYSIS_WINDOW: 60 * 1000, // 1 minute in milliseconds
    VOLUME_ANALYSIS_WINDOW: 5 * 60 * 1000, // 5 minutes
    
    // Backend API endpoint
    BACKEND_API_URL: process.env.BACKEND_API_URL || "http://localhost:3001/api/alerts"
};

// In-memory storage for tracking
let tradeHistory = new Map();
let volumeHistory = new Map();
let userTradeCounts = new Map();
let anomalyHistory = [];

/**
 * Initialize the Forta agent
 */
function initialize() {
    console.log("Energy Trading Protection Agent initialized");
    console.log("Monitoring contract:", CONFIG.ENERGY_CONTRACT_ADDRESS);
    
    // Clean up old data periodically
    setInterval(cleanupOldData, CONFIG.ANALYSIS_WINDOW);
}

/**
 * Main handler for processing transactions
 */
async function handleTransaction(txEvent) {
    const findings = [];
    
    try {
        // Check if transaction involves our energy contract
        if (!isEnergyContractTransaction(txEvent)) {
            return findings;
        }
        
        // Process different types of events
        const tradeFindings = await processTradeEvents(txEvent);
        const mintingFindings = await processMintingEvents(txEvent);
        const anomalyFindings = await processAnomalyEvents(txEvent);
        const circuitBreakerFindings = await processCircuitBreakerEvents(txEvent);
        
        findings.push(...tradeFindings, ...mintingFindings, ...anomalyFindings, ...circuitBreakerFindings);
        
        // Send alerts to backend if any findings
        if (findings.length > 0) {
            await sendAlertsToBackend(findings, txEvent);
        }
        
    } catch (error) {
        console.error("Error processing transaction:", error);
        findings.push(
            Finding.fromObject({
                name: "Error in Energy Trading Agent",
                description: `Error processing transaction: ${error.message}`,
                alertId: "ENERGY-AGENT-ERROR",
                severity: FindingSeverity.High,
                type: FindingType.Suspicious,
                metadata: {
                    error: error.message,
                    transactionHash: txEvent.hash
                }
            })
        );
    }
    
    return findings;
}

/**
 * Check if transaction involves the energy contract
 */
function isEnergyContractTransaction(txEvent) {
    return txEvent.to && 
           txEvent.to.toLowerCase() === CONFIG.ENERGY_CONTRACT_ADDRESS.toLowerCase();
}

/**
 * Process energy trade events
 */
async function processTradeEvents(txEvent) {
    const findings = [];
    
    // Look for EnergyTradeExecuted events
    const tradeEvents = txEvent.filterLog("EnergyTradeExecuted");
    
    for (const event of tradeEvents) {
        const { buyer, seller, amount, price, timestamp } = event.args;
        
        // Update trade history
        updateTradeHistory(buyer, amount, price, timestamp);
        
        // Check for anomalies
        const tradeAnomalies = await detectTradeAnomalies(buyer, seller, amount, price, timestamp);
        findings.push(...tradeAnomalies);
    }
    
    return findings;
}

/**
 * Process energy token minting events
 */
async function processMintingEvents(txEvent) {
    const findings = [];
    
    // Look for EnergyTokenMinted events
    const mintingEvents = txEvent.filterLog("EnergyTokenMinted");
    
    for (const event of mintingEvents) {
        const { producer, amount, timestamp } = event.args;
        
        // Check for large minting
        if (amount.gt(CONFIG.LARGE_MINTING_THRESHOLD)) {
            findings.push(
                Finding.fromObject({
                    name: "Large Energy Token Minting Detected",
                    description: `Large amount of energy tokens minted: ${ethers.utils.formatEther(amount)} ETH`,
                    alertId: "ENERGY-LARGE-MINTING",
                    severity: FindingSeverity.Medium,
                    type: FindingType.Suspicious,
                    metadata: {
                        producer: producer,
                        amount: amount.toString(),
                        threshold: CONFIG.LARGE_MINTING_THRESHOLD.toString(),
                        timestamp: timestamp.toString()
                    }
                })
            );
        }
    }
    
    return findings;
}

/**
 * Process anomaly detection events
 */
async function processAnomalyEvents(txEvent) {
    const findings = [];
    
    // Look for AnomalyDetected events
    const anomalyEvents = txEvent.filterLog("AnomalyDetected");
    
    for (const event of anomalyEvents) {
        const { anomalyType, user, value, timestamp } = event.args;
        
        findings.push(
            Finding.fromObject({
                name: `Smart Contract Anomaly: ${anomalyType}`,
                description: `Anomaly detected in energy trading contract: ${anomalyType}`,
                alertId: `ENERGY-ANOMALY-${anomalyType.toUpperCase()}`,
                severity: FindingSeverity.High,
                type: FindingType.Suspicious,
                metadata: {
                    anomalyType: anomalyType,
                    user: user,
                    value: value.toString(),
                    timestamp: timestamp.toString()
                }
            })
        );
    }
    
    return findings;
}

/**
 * Process circuit breaker events
 */
async function processCircuitBreakerEvents(txEvent) {
    const findings = [];
    
    // Look for CircuitBreakerTriggered events
    const circuitBreakerEvents = txEvent.filterLog("CircuitBreakerTriggered");
    
    for (const event of circuitBreakerEvents) {
        const { newState, reason, timestamp } = event.args;
        
        findings.push(
            Finding.fromObject({
                name: "Circuit Breaker Triggered",
                description: `Circuit breaker state changed to: ${newState}. Reason: ${reason}`,
                alertId: "ENERGY-CIRCUIT-BREAKER",
                severity: FindingSeverity.Critical,
                type: FindingType.Info,
                metadata: {
                    newState: newState.toString(),
                    reason: reason,
                    timestamp: timestamp.toString()
                }
            })
        );
    }
    
    return findings;
}

/**
 * Detect trade-specific anomalies
 */
async function detectTradeAnomalies(buyer, seller, amount, price, timestamp) {
    const findings = [];
    
    // Check for suspicious volume
    if (amount.gt(CONFIG.SUSPICIOUS_VOLUME_THRESHOLD)) {
        findings.push(
            Finding.fromObject({
                name: "Suspicious Trade Volume Detected",
                description: `Large trade volume detected: ${ethers.utils.formatEther(amount)} ETH`,
                alertId: "ENERGY-SUSPICIOUS-VOLUME",
                severity: FindingSeverity.Medium,
                type: FindingType.Suspicious,
                metadata: {
                    buyer: buyer,
                    seller: seller,
                    amount: amount.toString(),
                    price: price.toString(),
                    threshold: CONFIG.SUSPICIOUS_VOLUME_THRESHOLD.toString(),
                    timestamp: timestamp.toString()
                }
            })
        );
    }
    
    // Check for unusual prices
    if (price.lt(CONFIG.UNUSUAL_PRICE_MIN) || price.gt(CONFIG.UNUSUAL_PRICE_MAX)) {
        findings.push(
            Finding.fromObject({
                name: "Unusual Trade Price Detected",
                description: `Unusual price detected: ${ethers.utils.formatEther(price)} ETH`,
                alertId: "ENERGY-UNUSUAL-PRICE",
                severity: FindingSeverity.Medium,
                type: FindingType.Suspicious,
                metadata: {
                    buyer: buyer,
                    seller: seller,
                    amount: amount.toString(),
                    price: price.toString(),
                    minPrice: CONFIG.UNUSUAL_PRICE_MIN.toString(),
                    maxPrice: CONFIG.UNUSUAL_PRICE_MAX.toString(),
                    timestamp: timestamp.toString()
                }
            })
        );
    }
    
    // Check for rapid trading
    const userTrades = userTradeCounts.get(buyer) || 0;
    if (userTrades > CONFIG.RAPID_TRADE_THRESHOLD) {
        findings.push(
            Finding.fromObject({
                name: "Rapid Trading Detected",
                description: `User ${buyer} has made ${userTrades} trades in the analysis window`,
                alertId: "ENERGY-RAPID-TRADING",
                severity: FindingSeverity.High,
                type: FindingType.Suspicious,
                metadata: {
                    user: buyer,
                    tradeCount: userTrades.toString(),
                    threshold: CONFIG.RAPID_TRADE_THRESHOLD.toString(),
                    timestamp: timestamp.toString()
                }
            })
        );
    }
    
    // Check for potential front-running
    const frontRunningFindings = await detectFrontRunning(buyer, seller, amount, price, timestamp);
    findings.push(...frontRunningFindings);
    
    return findings;
}

/**
 * Detect potential front-running attacks
 */
async function detectFrontRunning(buyer, seller, amount, price, timestamp) {
    const findings = [];
    
    // Simple front-running detection based on recent trades
    const recentTrades = getRecentTrades(CONFIG.ANALYSIS_WINDOW);
    
    // Check if there are multiple trades with similar parameters in a short time
    const similarTrades = recentTrades.filter(trade => 
        trade.seller === seller &&
        Math.abs(trade.price - price) < ethers.utils.parseEther("0.01") &&
        Math.abs(trade.timestamp - timestamp) < 30000 // 30 seconds
    );
    
    if (similarTrades.length >= 2) {
        findings.push(
            Finding.fromObject({
                name: "Potential Front-Running Attack Detected",
                description: `Multiple similar trades detected in short time window`,
                alertId: "ENERGY-FRONT-RUNNING",
                severity: FindingSeverity.High,
                type: FindingType.Attack,
                metadata: {
                    buyer: buyer,
                    seller: seller,
                    amount: amount.toString(),
                    price: price.toString(),
                    similarTradesCount: similarTrades.length.toString(),
                    timestamp: timestamp.toString()
                }
            })
        );
    }
    
    return findings;
}

/**
 * Update trade history for analysis
 */
function updateTradeHistory(user, amount, price, timestamp) {
    const now = Date.now();
    
    // Update user trade count
    const userTrades = userTradeCounts.get(user) || 0;
    userTradeCounts.set(user, userTrades + 1);
    
    // Store trade data
    const tradeData = {
        user,
        amount: amount.toString(),
        price: price.toString(),
        timestamp: timestamp.toString(),
        blockTime: now
    };
    
    if (!tradeHistory.has(user)) {
        tradeHistory.set(user, []);
    }
    tradeHistory.get(user).push(tradeData);
    
    // Update volume history
    if (!volumeHistory.has(user)) {
        volumeHistory.set(user, []);
    }
    volumeHistory.get(user).push({
        amount: amount.toString(),
        timestamp: now
    });
}

/**
 * Get recent trades within time window
 */
function getRecentTrades(timeWindow) {
    const now = Date.now();
    const recentTrades = [];
    
    for (const [user, trades] of tradeHistory.entries()) {
        const userRecentTrades = trades.filter(trade => 
            now - trade.blockTime < timeWindow
        );
        recentTrades.push(...userRecentTrades);
    }
    
    return recentTrades;
}

/**
 * Clean up old data
 */
function cleanupOldData() {
    const now = Date.now();
    
    // Clean up trade history
    for (const [user, trades] of tradeHistory.entries()) {
        const recentTrades = trades.filter(trade => 
            now - trade.blockTime < CONFIG.VOLUME_ANALYSIS_WINDOW
        );
        tradeHistory.set(user, recentTrades);
    }
    
    // Clean up volume history
    for (const [user, volumes] of volumeHistory.entries()) {
        const recentVolumes = volumes.filter(volume => 
            now - volume.timestamp < CONFIG.VOLUME_ANALYSIS_WINDOW
        );
        volumeHistory.set(user, recentVolumes);
    }
    
    // Reset user trade counts periodically
    userTradeCounts.clear();
}

/**
 * Send alerts to backend
 */
async function sendAlertsToBackend(findings, txEvent) {
    try {
        const alertData = {
            findings: findings.map(finding => ({
                name: finding.name,
                description: finding.description,
                alertId: finding.alertId,
                severity: finding.severity,
                type: finding.type,
                metadata: finding.metadata
            })),
            transactionHash: txEvent.hash,
            blockNumber: txEvent.blockNumber,
            timestamp: Date.now()
        };
        
        const response = await fetch(CONFIG.BACKEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alertData)
        });
        
        if (!response.ok) {
            console.error("Failed to send alert to backend:", response.statusText);
        }
    } catch (error) {
        console.error("Error sending alert to backend:", error);
    }
}

module.exports = {
    initialize,
    handleTransaction
}; 