const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for this endpoint' },
});

function apiKeyAuth(req, res, next) {
  const validKey = process.env.API_KEY;
  if (!validKey) return next();
  const provided = req.headers['x-api-key'];
  if (provided === validKey) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function validatePagination(req, res, next) {
  req.pagination = {
    page: Math.max(1, parseInt(req.query.page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(req.query.limit) || 50)),
  };
  req.pagination.offset = (req.pagination.page - 1) * req.pagination.limit;
  next();
}

module.exports = { apiLimiter, strictLimiter, apiKeyAuth, validatePagination };
