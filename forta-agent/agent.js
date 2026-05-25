const { ethers } = require('ethers');
const axios = require('axios');

const CONFIG = {
  RPC_URL: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
  CONTRACT_ADDRESS: process.env.ENERGY_CONTRACT_ADDRESS,
  BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://backend:3001/api/alerts',
  RECONNECT_DELAY: 5000,
};

const CONTRACT_ABI = require('../contracts/EnergyTradingContract.json').abi;

let provider;
let contract;

async function sendAlert(alert) {
  try {
    await axios.post(CONFIG.BACKEND_API_URL, { findings: [alert] });
    console.log(`Alert sent: ${alert.name}`);
  } catch (err) {
    console.error('Failed to send alert:', err.message);
  }
}

function setupEventListeners() {
  contract.on('EnergyTradeExecuted', (buyer, seller, amount, price, timestamp, event) => {
    const amountEth = ethers.formatEther(amount);
    const priceEth = ethers.formatEther(price);
    console.log(`Trade: ${amountEth} tokens @ ${priceEth} ETH`);

    let severity = 'Low';
    if (Number(amountEth) >= 500) severity = 'Critical';
    else if (Number(amountEth) >= 100) severity = 'Medium';

    if (severity !== 'Low') {
      sendAlert({
        alertId: 'ENERGY-LARGE-TRADE',
        name: 'Large Trade Detected',
        description: `Trade of ${amountEth} tokens at ${priceEth} ETH`,
        severity,
        type: 'Suspicious',
        metadata: { buyer, seller, amount: amount.toString(), price: price.toString() },
        transactionHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber,
      });
    }
  });

  contract.on('AnomalyDetected', (anomalyType, user, value, timestamp, event) => {
    console.log(`Anomaly: ${anomalyType} by ${user}`);
    sendAlert({
      alertId: `ENERGY-ANOMALY-${anomalyType.toUpperCase()}`,
      name: `Anomaly: ${anomalyType}`,
      description: `Anomaly "${anomalyType}" detected for user ${user}, value: ${value}`,
      severity: 'High',
      type: 'Suspicious',
      metadata: { anomalyType, user, value: value.toString() },
      transactionHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
    });
  });

  contract.on('CircuitBreakerTriggered', (newState, reason, timestamp, event) => {
    const states = ['Normal', 'Paused', 'Emergency'];
    console.log(`Circuit Breaker: ${states[newState] || newState} — ${reason}`);
    sendAlert({
      alertId: 'ENERGY-CIRCUIT-BREAKER',
      name: 'Circuit Breaker Triggered',
      description: `State changed to ${states[newState] || newState}. Reason: ${reason}`,
      severity: 'Critical',
      type: 'Info',
      metadata: { newState: newState.toString(), reason },
      transactionHash: event.log.transactionHash,
      blockNumber: event.log.blockNumber,
    });
  });

  console.log('Event listeners active');
}

async function start() {
  if (!CONFIG.CONTRACT_ADDRESS) {
    console.error('ENERGY_CONTRACT_ADDRESS not set');
    process.exit(1);
  }

  console.log('Connecting to', CONFIG.RPC_URL);
  console.log('Monitoring contract', CONFIG.CONTRACT_ADDRESS);

  provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);

  // Wait for blockchain to be available
  while (true) {
    try {
      await provider.getBlockNumber();
      break;
    } catch {
      console.log('Waiting for blockchain node...');
      await new Promise((r) => setTimeout(r, CONFIG.RECONNECT_DELAY));
    }
  }

  contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  setupEventListeners();

  // Reconnect on disconnect
  provider.on('error', (err) => {
    console.error('Provider error:', err.message);
    setTimeout(start, CONFIG.RECONNECT_DELAY);
  });

  console.log('Event monitor running');
}

start().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
