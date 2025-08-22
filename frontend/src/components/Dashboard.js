import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, 
  LinearProgress, Chip, Alert, Paper
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Warning, CheckCircle,
  Error, Info, Timeline, Speed
} from '@mui/icons-material';

const Dashboard = ({ alerts, trades, stats }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'error';
      case 'Monitoring': return 'warning';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };

  const getTradeTypeColor = (type) => {
    switch (type) {
      case 'whale': return 'error';
      case 'large': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  const getTradeStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const recentAlerts = alerts.slice(0, 5);
  const recentTrades = trades.slice(0, 5);

  const alertSeverityBreakdown = {
    High: alerts.filter(a => a.severity === 'High').length,
    Medium: alerts.filter(a => a.severity === 'Medium').length,
    Low: alerts.filter(a => a.severity === 'Low').length
  };

  const tradeStatusBreakdown = {
    completed: trades.filter(t => t.status === 'completed').length,
    pending: trades.filter(t => t.status === 'pending').length,
    failed: trades.filter(t => t.status === 'failed').length
  };

  const tradeTypeBreakdown = {
    normal: trades.filter(t => t.type === 'normal').length,
    large: trades.filter(t => t.type === 'large').length,
    whale: trades.filter(t => t.type === 'whale').length
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'white' }}>
        Dashboard Overview
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Error color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" color="error">
                  {stats.totalAlerts}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Alerts
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.activeAlerts} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" color="info">
                  {stats.totalTrades}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Trades
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.completedTrades} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="success">
                  {stats.dailyVolume}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Daily Volume (ETH)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg: {stats.averageTradeSize}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="warning">
                  {stats.totalGasUsed}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Gas Used
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Network: {stats.networkHealth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Breakdowns */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Alert Severity Breakdown */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                Alert Severity Breakdown
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">High</Typography>
                  <Typography variant="body2">{alertSeverityBreakdown.High}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(alertSeverityBreakdown.High / stats.totalAlerts) * 100} 
                  color="error"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Medium</Typography>
                  <Typography variant="body2">{alertSeverityBreakdown.Medium}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(alertSeverityBreakdown.Medium / stats.totalAlerts) * 100} 
                  color="warning"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Low</Typography>
                  <Typography variant="body2">{alertSeverityBreakdown.Low}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(alertSeverityBreakdown.Low / stats.totalAlerts) * 100} 
                  color="info"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trade Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                Trade Status Breakdown
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completed</Typography>
                  <Typography variant="body2">{tradeStatusBreakdown.completed}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(tradeStatusBreakdown.completed / stats.totalTrades) * 100} 
                  color="success"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Pending</Typography>
                  <Typography variant="body2">{tradeStatusBreakdown.pending}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(tradeStatusBreakdown.pending / stats.totalTrades) * 100} 
                  color="warning"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Failed</Typography>
                  <Typography variant="body2">{tradeStatusBreakdown.failed}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(tradeStatusBreakdown.failed / stats.totalTrades) * 100} 
                  color="error"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                Recent Alerts
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recentAlerts.map((alert) => (
                  <Paper key={alert.id} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={alert.severity} 
                        size="small" 
                        color={getSeverityColor(alert.severity)}
                      />
                      <Chip 
                        label={alert.status} 
                        size="small" 
                        color={getStatusColor(alert.status)}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {alert.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(alert.timestamp).toLocaleString()} • {alert.source}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Trades */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                Recent Trades
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recentTrades.map((trade) => (
                  <Paper key={trade.id} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={trade.type} 
                        size="small" 
                        color={getTradeTypeColor(trade.type)}
                      />
                      <Chip 
                        label={trade.status} 
                        size="small" 
                        color={getTradeStatusColor(trade.status)}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{trade.amount} ETH</strong> at <strong>{trade.price} ETH</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {trade.buyer.slice(0, 8)}... → {trade.seller.slice(0, 8)}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(trade.timestamp).toLocaleString()}
                      {trade.gasUsed && ` • Gas: ${trade.gasUsed}`}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Status */}
      <Box sx={{ mt: 4 }}>
        <Alert 
          severity={stats.networkHealth === 'Good' ? 'success' : 'warning'}
          icon={stats.networkHealth === 'Good' ? <CheckCircle /> : <Warning />}
        >
          System Status: {stats.networkHealth} • Last Update: {new Date(stats.lastUpdate).toLocaleString()}
        </Alert>
      </Box>
    </Box>
  );
};

export default Dashboard; 