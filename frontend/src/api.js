import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
});

export const socket = io(BACKEND_URL || window.location.origin, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 3000,
});

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function mapAlert(alert) {
  return {
    id: alert.id,
    alertId: alert.alertId,
    severity: capitalize(alert.severity),
    type: alert.name || alert.alertId,
    message: alert.description,
    timestamp: alert.timestamp,
    status: capitalize(alert.status),
    details: alert.metadata?.details || alert.description,
    source: alert.metadata?.source || 'System',
    confidence: alert.metadata?.confidence || 0,
    transactionHash: alert.transactionHash,
    blockNumber: alert.blockNumber,
  };
}

export function mapTrade(trade) {
  const amount = parseFloat(trade.amount);
  let type = 'normal';
  if (amount >= 500) type = 'whale';
  else if (amount >= 100) type = 'large';

  return {
    id: trade.id,
    buyer: trade.buyer,
    seller: trade.seller,
    amount: String(trade.amount),
    price: String(trade.price),
    timestamp: trade.timestamp,
    type,
    status: 'completed',
    gasUsed: trade.gasUsed || 0,
    transactionHash: trade.transactionHash,
  };
}

export function computeStats(alerts, trades) {
  const high = alerts.filter(a => a.severity === 'High').length;
  const medium = alerts.filter(a => a.severity === 'Medium').length;
  const low = alerts.filter(a => a.severity === 'Low').length;
  const active = alerts.filter(a => a.status === 'Active').length;
  const completed = trades.filter(t => t.status === 'completed').length;
  const pending = trades.filter(t => t.status === 'pending').length;
  const failed = trades.filter(t => t.status === 'failed').length;
  const totalVolume = trades.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const avgPrice = trades.length > 0
    ? trades.reduce((sum, t) => sum + parseFloat(t.price || 0), 0) / trades.length
    : 0;
  const avgSize = trades.length > 0 ? totalVolume / trades.length : 0;
  const totalGas = trades.reduce((sum, t) => sum + (t.gasUsed || 0), 0);

  return {
    totalAlerts: alerts.length,
    activeAlerts: active,
    totalTrades: trades.length,
    dailyVolume: totalVolume.toFixed(1),
    highSeverityAlerts: high,
    mediumSeverityAlerts: medium,
    lowSeverityAlerts: low,
    completedTrades: completed,
    pendingTrades: pending,
    failedTrades: failed,
    averageTradeSize: avgSize.toFixed(1),
    averagePrice: avgPrice.toFixed(2),
    totalGasUsed: totalGas.toLocaleString(),
    networkHealth: 'Good',
    lastUpdate: new Date().toISOString(),
  };
}

export default api;
