import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ alerts, trades, circuitBreakerState, stats }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Generate chart data from trades
    if (trades && trades.length > 0) {
      const data = trades.slice(-20).map((trade, index) => ({
        time: index,
        volume: parseFloat(trade.amount) || 0,
        price: parseFloat(trade.price) || 0
      }));
      setChartData(data);
    }
  }, [trades]);

  const getCircuitBreakerColor = (state) => {
    switch (state) {
      case 'Normal': return 'success';
      case 'Paused': return 'warning';
      case 'Emergency': return 'error';
      default: return 'default';
    }
  };

  const getCircuitBreakerIcon = (state) => {
    switch (state) {
      case 'Normal': return <CheckCircle />;
      case 'Paused': return <Warning />;
      case 'Emergency': return <Error />;
      default: return <Warning />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Energy Trading Protection Dashboard
      </Typography>

      {/* Circuit Breaker Status */}
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              {getCircuitBreakerIcon(circuitBreakerState)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                Circuit Breaker Status
              </Typography>
            </Box>
            <Chip
              label={circuitBreakerState}
              color={getCircuitBreakerColor(circuitBreakerState)}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Alerts
              </Typography>
              <Typography variant="h4">
                {stats.totalAlerts}
              </Typography>
              <Box display="flex" alignItems="center">
                <Error color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="error">
                  {stats.activeAlerts} Active
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Trades
              </Typography>
              <Typography variant="h4">
                {stats.totalTrades}
              </Typography>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="primary">
                  Today
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Daily Volume
              </Typography>
              <Typography variant="h4">
                {parseFloat(stats.dailyVolume).toFixed(2)} ETH
              </Typography>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success">
                  +12.5%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                System Health
              </Typography>
              <Typography variant="h4">
                98%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={98} 
                sx={{ mt: 1 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trading Volume Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trading Volume (Last 20 Trades)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Alerts
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {alerts && alerts.slice(0, 5).map((alert, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="error">
                      {alert.type}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 