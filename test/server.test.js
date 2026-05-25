const request = require('supertest');
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

// Use SQLite in-memory for tests
const sequelize = new Sequelize('sqlite::memory:', { logging: false });

// Define models matching server.js
const Alert = sequelize.define('Alert', {
  alertId: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  severity: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING },
  metadata: { type: DataTypes.JSON },
  transactionHash: { type: DataTypes.STRING },
  blockNumber: { type: DataTypes.INTEGER },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
});

const Trade = sequelize.define('Trade', {
  buyer: { type: DataTypes.STRING, allowNull: false },
  seller: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
  price: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
  transactionHash: { type: DataTypes.STRING },
  blockNumber: { type: DataTypes.INTEGER },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const CircuitBreakerEvent = sequelize.define('CircuitBreakerEvent', {
  newState: { type: DataTypes.STRING, allowNull: false },
  reason: { type: DataTypes.TEXT },
  triggeredBy: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// Build a minimal Express app mirroring server.js routes
function buildApp() {
  const app = express();
  app.use(express.json());

  const { validatePagination, apiKeyAuth } = require('../backend/middleware');

  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.post('/api/alerts', async (req, res) => {
    try {
      const { findings, transactionHash } = req.body;
      if (!Array.isArray(findings) || findings.length === 0) {
        return res.status(400).json({ error: 'findings must be a non-empty array' });
      }
      if (!transactionHash || typeof transactionHash !== 'string') {
        return res.status(400).json({ error: 'transactionHash is required' });
      }
      for (const f of findings) {
        await Alert.create({
          alertId: f.alertId || 'unknown',
          name: f.name || 'Alert',
          description: f.description || '',
          severity: f.severity || 'Low',
          type: f.type || 'Info',
          metadata: f.metadata || {},
          transactionHash,
          blockNumber: req.body.blockNumber || 0,
          timestamp: new Date(),
        });
      }
      res.json({ success: true, processed: findings.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/alerts', validatePagination, async (req, res) => {
    try {
      const { limit, offset, page } = req.pagination;
      const { status } = req.query;
      const validStatuses = ['active', 'mitigated', 'resolved'];
      const where = status && validStatuses.includes(status) ? { status } : {};
      const result = await Alert.findAndCountAll({
        where,
        order: [['timestamp', 'DESC']],
        limit,
        offset,
      });
      res.json({
        alerts: result.rows,
        total: result.count,
        page,
        totalPages: Math.ceil(result.count / limit),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/trades', validatePagination, async (req, res) => {
    try {
      const { limit, offset, page } = req.pagination;
      const result = await Trade.findAndCountAll({
        order: [['timestamp', 'DESC']],
        limit,
        offset,
      });
      res.json({
        trades: result.rows,
        total: result.count,
        page,
        totalPages: Math.ceil(result.count / limit),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/circuit-breaker/status', (req, res) => {
    res.json({ state: 0, description: 'Normal', timestamp: new Date().toISOString() });
  });

  app.post('/api/circuit-breaker', apiKeyAuth, (req, res) => {
    const { action, reason } = req.body;
    const validActions = ['pause', 'resume', 'emergency'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    if (!reason || typeof reason !== 'string') {
      return res.status(400).json({ error: 'reason is required' });
    }
    res.json({ success: true, action, reason });
  });

  return app;
}

// Tests
let app;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  app = buildApp();
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/health', () => {
  test('returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('POST /api/alerts', () => {
  test('rejects empty body', async () => {
    const res = await request(app).post('/api/alerts').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/findings/);
  });

  test('rejects missing transactionHash', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .send({ findings: [{ name: 'Test' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/transactionHash/);
  });

  test('processes valid alert', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .send({
        findings: [
          { alertId: 'TEST-001', name: 'Test Alert', severity: 'High', type: 'Suspicious' },
        ],
        transactionHash: '0xabc123',
        blockNumber: 100,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.processed).toBe(1);
  });

  test('processes multiple findings', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .send({
        findings: [
          { alertId: 'TEST-002', name: 'A1', severity: 'Low' },
          { alertId: 'TEST-003', name: 'A2', severity: 'Medium' },
        ],
        transactionHash: '0xdef456',
      });
    expect(res.status).toBe(200);
    expect(res.body.processed).toBe(2);
  });
});

describe('GET /api/alerts', () => {
  test('returns paginated alerts', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.alerts)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(3);
    expect(res.body.page).toBe(1);
  });

  test('respects limit param', async () => {
    const res = await request(app).get('/api/alerts?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.alerts.length).toBe(1);
    expect(res.body.totalPages).toBeGreaterThan(1);
  });

  test('filters by status', async () => {
    const res = await request(app).get('/api/alerts?status=active');
    expect(res.status).toBe(200);
    for (const alert of res.body.alerts) {
      expect(alert.status).toBe('active');
    }
  });

  test('ignores invalid status filter', async () => {
    const res = await request(app).get('/api/alerts?status=invalid');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(3);
  });
});

describe('GET /api/trades', () => {
  test('returns empty trades initially', async () => {
    const res = await request(app).get('/api/trades');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.trades)).toBe(true);
  });
});

describe('GET /api/circuit-breaker/status', () => {
  test('returns normal state', async () => {
    const res = await request(app).get('/api/circuit-breaker/status');
    expect(res.status).toBe(200);
    expect(res.body.state).toBe(0);
    expect(res.body.description).toBe('Normal');
  });
});

describe('POST /api/circuit-breaker', () => {
  test('rejects invalid action', async () => {
    const res = await request(app)
      .post('/api/circuit-breaker')
      .send({ action: 'destroy', reason: 'test' });
    expect(res.status).toBe(400);
  });

  test('rejects missing reason', async () => {
    const res = await request(app)
      .post('/api/circuit-breaker')
      .send({ action: 'pause' });
    expect(res.status).toBe(400);
  });

  test('accepts valid pause', async () => {
    const res = await request(app)
      .post('/api/circuit-breaker')
      .send({ action: 'pause', reason: 'Suspicious activity detected' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('accepts valid emergency', async () => {
    const res = await request(app)
      .post('/api/circuit-breaker')
      .send({ action: 'emergency', reason: 'Critical breach' });
    expect(res.status).toBe(200);
    expect(res.body.action).toBe('emergency');
  });
});
