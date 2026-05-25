export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'High': return 'error';
    case 'Medium': return 'warning';
    case 'Low': return 'info';
    default: return 'default';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'error';
    case 'Monitoring': return 'warning';
    case 'Resolved': return 'success';
    default: return 'default';
  }
};

export const getTradeTypeColor = (type) => {
  switch (type) {
    case 'whale': return 'error';
    case 'large': return 'warning';
    case 'normal': return 'info';
    default: return 'default';
  }
};

export const getTradeStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'failed': return 'error';
    default: return 'default';
  }
};

export const getCircuitBreakerColor = (state) => {
  switch (state) {
    case 'Normal': return 'success';
    case 'Warning': return 'warning';
    case 'Triggered':
    case 'Emergency': return 'error';
    default: return 'default';
  }
};
