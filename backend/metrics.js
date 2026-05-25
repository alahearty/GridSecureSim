// Lightweight Prometheus-compatible metrics (no external dependency)

const counters = {};
const histograms = {};

function inc(name, labels = {}) {
  const key = metricKey(name, labels);
  counters[key] = (counters[key] || 0) + 1;
}

function observe(name, value, labels = {}) {
  const key = metricKey(name, labels);
  if (!histograms[key]) histograms[key] = { sum: 0, count: 0 };
  histograms[key].sum += value;
  histograms[key].count += 1;
}

function metricKey(name, labels) {
  const parts = Object.entries(labels).sort().map(([k, v]) => `${k}="${v}"`);
  return parts.length ? `${name}{${parts.join(',')}}` : name;
}

function metricsMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    inc('http_requests_total', { method: req.method, path: route, status: res.statusCode });
    observe('http_request_duration_seconds', duration, { method: req.method, path: route });
  });
  next();
}

function formatMetrics() {
  const lines = [];

  lines.push('# HELP http_requests_total Total HTTP requests');
  lines.push('# TYPE http_requests_total counter');
  for (const [key, val] of Object.entries(counters)) {
    lines.push(`${key} ${val}`);
  }

  lines.push('# HELP http_request_duration_seconds HTTP request duration');
  lines.push('# TYPE http_request_duration_seconds summary');
  for (const [key, val] of Object.entries(histograms)) {
    lines.push(`${key.replace('}', ',quantile="avg"}')} ${val.count ? (val.sum / val.count).toFixed(4) : 0}`);
    lines.push(`${key.replace('{', '_count{')|| `${key}_count`} ${val.count}`);
    lines.push(`${key.replace('{', '_sum{') || `${key}_sum`} ${val.sum.toFixed(4)}`);
  }

  // Process metrics
  const mem = process.memoryUsage();
  lines.push('# HELP process_resident_memory_bytes Resident memory size in bytes');
  lines.push('# TYPE process_resident_memory_bytes gauge');
  lines.push(`process_resident_memory_bytes ${mem.rss}`);
  lines.push('# HELP process_heap_used_bytes Heap used in bytes');
  lines.push('# TYPE process_heap_used_bytes gauge');
  lines.push(`process_heap_used_bytes ${mem.heapUsed}`);
  lines.push('# HELP nodejs_uptime_seconds Process uptime');
  lines.push('# TYPE nodejs_uptime_seconds gauge');
  lines.push(`nodejs_uptime_seconds ${process.uptime().toFixed(0)}`);

  return lines.join('\n') + '\n';
}

module.exports = { inc, observe, metricsMiddleware, formatMetrics };
