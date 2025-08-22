import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, 
  LinearProgress, Chip, Alert, Paper, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Warning, CheckCircle,
  Error, Info, Timeline, Speed, ShowChart, BarChart
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, AreaChart, Area } from 'recharts';

const Dashboard = ({ alerts, trades, stats }) => {
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    // Generate chart data from trades
    if (trades && trades.length > 0) {
      const now = Date.now();
      let data = [];
      
      switch (timeRange) {
        case '1h':
          data = generateHourlyData(trades, now, 1);
          break;
        case '6h':
          data = generateHourlyData(trades, now, 6);
          break;
        case '24h':
          data = generateHourlyData(trades, now, 24);
          break;
        case '7d':
          data = generateDailyData(trades, now, 7);
          break;
        default:
          data = generateHourlyData(trades, now, 24);
      }
      
      setChartData(data);
    }
  }, [trades, timeRange]);

  const generateHourlyData = (trades, now, hours) => {
    const data = [];
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now - i * 60 * 60 * 1000);
      const hourTrades = trades.filter(trade => {
        const tradeTime = new Date(trade.timestamp);
        return tradeTime.getHours() === time.getHours() && 
               tradeTime.getDate() === time.getDate();
      });
      
      const volume = hourTrades.reduce((sum, trade) => sum + parseFloat(trade.amount), 0);
      const avgPrice = hourTrades.length > 0 
        ? hourTrades.reduce((sum, trade) => sum + parseFloat(trade.price), 0) / hourTrades.length
        : 0;
      const tradeCount = hourTrades.length;
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        volume: parseFloat(volume.toFixed(2)),
        price: parseFloat(avgPrice.toFixed(4)),
        trades: tradeCount,
        timestamp: time.getTime()
      });
    }
    return data;
  };

  const generateDailyData = (trades, now, days) => {
    const data = [];
    for (let i = days; i >= 0; i--) {
      const time = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayTrades = trades.filter(trade => {
        const tradeTime = new Date(trade.timestamp);
        return tradeTime.getDate() === time.getDate() && 
               tradeTime.getMonth() === time.getMonth();
      });
      
      const volume = dayTrades.reduce((sum, trade) => sum + parseFloat(trade.amount), 0);
      const avgPrice = dayTrades.length > 0 
        ? dayTrades.reduce((sum, trade) => sum + parseFloat(trade.price), 0) / dayTrades.length
        : 0;
      const tradeCount = dayTrades.length;
      
      data.push({
        time: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: parseFloat(volume.toFixed(2)),
        price: parseFloat(avgPrice.toFixed(4)),
        trades: tradeCount,
        timestamp: time.getTime()
      });
    }
    return data;
  };

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

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No trading data available for the selected time range
          </Typography>
        </Box>
      );
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="time" 
                stroke="#fff"
                tick={{ fill: '#fff' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#2196f3"
                tick={{ fill: '#2196f3' }}
                label={{ value: 'Volume (ETH)', angle: -90, position: 'insideLeft', fill: '#2196f3' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#ff9800"
                tick={{ fill: '#ff9800' }}
                label={{ value: 'Price (ETH)', angle: 90, position: 'insideRight', fill: '#ff9800' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#333', 
                  border: '1px solid #555',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="volume" 
                stroke="#2196f3" 
                strokeWidth={3}
                dot={{ fill: '#2196f3', strokeWidth: 2, r: 4 }}
                name="Volume"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="price" 
                stroke="#ff9800" 
                strokeWidth={2}
                dot={{ fill: '#ff9800', strokeWidth: 2, r: 3 }}
                name="Price"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="time" 
                stroke="#fff"
                tick={{ fill: '#fff' }}
              />
              <YAxis 
                stroke="#4caf50"
                tick={{ fill: '#4caf50' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#333', 
                  border: '1px solid #555',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#4caf50" 
                fill="#4caf50"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Volume"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="time" 
                stroke="#fff"
                tick={{ fill: '#fff' }}
              />
              <YAxis 
                stroke="#9c27b0"
                tick={{ fill: '#9c27b0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#333', 
                  border: '1px solid #555',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar 
                dataKey="volume" 
                fill="#9c27b0"
                radius={[4, 4, 0, 0]}
                name="Volume"
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
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

      {/* Trading Charts Section */}
      <Card sx={{ bgcolor: 'background.paper', mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShowChart sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ color: 'white' }}>
                Trading Activity Charts
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={(e, newRange) => newRange && setTimeRange(newRange)}
                size="small"
                sx={{ bgcolor: 'background.default' }}
              >
                <ToggleButton value="1h" sx={{ color: 'white' }}>1H</ToggleButton>
                <ToggleButton value="6h" sx={{ color: 'white' }}>6H</ToggleButton>
                <ToggleButton value="24h" sx={{ color: 'white' }}>24H</ToggleButton>
                <ToggleButton value="7d" sx={{ color: 'white' }}>7D</ToggleButton>
              </ToggleButtonGroup>
              
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(e, newType) => newType && setChartType(newType)}
                size="small"
                sx={{ bgcolor: 'background.default' }}
              >
                <ToggleButton value="line" sx={{ color: 'white' }}>
                  <ShowChart fontSize="small" />
                </ToggleButton>
                <ToggleButton value="area" sx={{ color: 'white' }}>
                  <BarChart fontSize="small" />
                </ToggleButton>
                <ToggleButton value="bar" sx={{ color: 'white' }}>
                  <BarChart fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          
          {renderChart()}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Data updates in real-time • Last update: {new Date().toLocaleTimeString()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                icon={<TrendingUp />} 
                label={`Volume: ${chartData.reduce((sum, d) => sum + d.volume, 0).toFixed(2)} ETH`} 
                color="primary" 
                size="small" 
              />
              <Chip 
                icon={<ShowChart />} 
                label={`Trades: ${chartData.reduce((sum, d) => sum + d.trades, 0)}`} 
                color="secondary" 
                size="small" 
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

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