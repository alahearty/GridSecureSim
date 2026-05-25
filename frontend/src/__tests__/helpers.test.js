import { mapAlert, mapTrade, computeStats } from '../api';
import {
  getSeverityColor, getStatusColor, getTradeTypeColor,
  getTradeStatusColor, getCircuitBreakerColor,
} from '../utils';

// ── api.js helpers ──────────────────────────────────────────────────

describe('mapAlert', () => {
  const raw = {
    id: 1, alertId: 'ENERGY-1', severity: 'high', name: 'Test',
    description: 'desc', timestamp: '2024-01-01', status: 'active',
    metadata: { details: 'd', source: 's', confidence: 0.9 },
    transactionHash: '0xabc', blockNumber: 42,
  };

  it('capitalizes severity and status', () => {
    const out = mapAlert(raw);
    expect(out.severity).toBe('High');
    expect(out.status).toBe('Active');
  });

  it('maps metadata fields', () => {
    const out = mapAlert(raw);
    expect(out.details).toBe('d');
    expect(out.source).toBe('s');
    expect(out.confidence).toBe(0.9);
  });

  it('falls back when metadata is missing', () => {
    const out = mapAlert({ ...raw, metadata: null });
    expect(out.details).toBe('desc');
    expect(out.source).toBe('System');
    expect(out.confidence).toBe(0);
  });
});

describe('mapTrade', () => {
  const raw = {
    id: 1, buyer: 'A', seller: 'B', amount: '150', price: '10',
    timestamp: '2024-01-01', transactionHash: '0x1', status: 'pending',
  };

  it('classifies normal / large / whale', () => {
    expect(mapTrade({ ...raw, amount: '50' }).type).toBe('normal');
    expect(mapTrade({ ...raw, amount: '100' }).type).toBe('large');
    expect(mapTrade({ ...raw, amount: '500' }).type).toBe('whale');
  });

  it('passes through status from backend', () => {
    expect(mapTrade(raw).status).toBe('pending');
  });

  it('defaults status to completed', () => {
    const { status, ...noStatus } = raw;
    expect(mapTrade(noStatus).status).toBe('completed');
  });
});

describe('computeStats', () => {
  const alerts = [
    { severity: 'High', status: 'Active' },
    { severity: 'Medium', status: 'Active' },
    { severity: 'Low', status: 'Resolved' },
  ];
  const trades = [
    { amount: '100', price: '10', status: 'completed', gasUsed: 21000 },
    { amount: '200', price: '20', status: 'pending', gasUsed: 21000 },
  ];

  it('counts alerts by severity', () => {
    const s = computeStats(alerts, trades);
    expect(s.highSeverityAlerts).toBe(1);
    expect(s.mediumSeverityAlerts).toBe(1);
    expect(s.lowSeverityAlerts).toBe(1);
  });

  it('counts active alerts', () => {
    expect(computeStats(alerts, trades).activeAlerts).toBe(2);
  });

  it('computes trade totals', () => {
    const s = computeStats(alerts, trades);
    expect(s.totalTrades).toBe(2);
    expect(s.completedTrades).toBe(1);
    expect(s.pendingTrades).toBe(1);
    expect(parseFloat(s.dailyVolume)).toBe(300);
  });

  it('handles empty inputs', () => {
    const s = computeStats([], []);
    expect(s.totalAlerts).toBe(0);
    expect(s.totalTrades).toBe(0);
    expect(parseFloat(s.averagePrice)).toBe(0);
  });
});

// ── utils.js ────────────────────────────────────────────────────────

describe('getSeverityColor', () => {
  it('returns correct chip colors', () => {
    expect(getSeverityColor('High')).toBe('error');
    expect(getSeverityColor('Medium')).toBe('warning');
    expect(getSeverityColor('Low')).toBe('info');
    expect(getSeverityColor('unknown')).toBe('default');
  });
});

describe('getStatusColor', () => {
  it('returns correct chip colors', () => {
    expect(getStatusColor('Active')).toBe('error');
    expect(getStatusColor('Monitoring')).toBe('warning');
    expect(getStatusColor('Resolved')).toBe('success');
  });
});

describe('getTradeTypeColor', () => {
  it('returns correct chip colors', () => {
    expect(getTradeTypeColor('whale')).toBe('error');
    expect(getTradeTypeColor('large')).toBe('warning');
    expect(getTradeTypeColor('normal')).toBe('info');
  });
});

describe('getTradeStatusColor', () => {
  it('returns correct chip colors', () => {
    expect(getTradeStatusColor('completed')).toBe('success');
    expect(getTradeStatusColor('pending')).toBe('warning');
    expect(getTradeStatusColor('failed')).toBe('error');
  });
});

describe('getCircuitBreakerColor', () => {
  it('returns correct chip colors', () => {
    expect(getCircuitBreakerColor('Normal')).toBe('success');
    expect(getCircuitBreakerColor('Warning')).toBe('warning');
  });
});
