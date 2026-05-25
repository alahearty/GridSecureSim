import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, CircularProgress, Typography, Button } from '@mui/material';
import api, { socket, mapAlert, mapTrade, computeStats } from './api';

import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import Trades from './components/Trades';
import CircuitBreaker from './components/CircuitBreaker';
import Navigation from './components/Navigation';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2196f3' },
    secondary: { main: '#f50057' },
    background: { default: '#0a0a0a', paper: '#1a1a1a' },
  },
});

const EMPTY_STATS = {
  totalAlerts: 0, activeAlerts: 0, totalTrades: 0, dailyVolume: '0',
  highSeverityAlerts: 0, mediumSeverityAlerts: 0, lowSeverityAlerts: 0,
  completedTrades: 0, pendingTrades: 0, failedTrades: 0,
  averageTradeSize: '0', averagePrice: '0', totalGasUsed: '0',
  networkHealth: 'Unknown', lastUpdate: new Date().toISOString(),
};

function App() {
  const [alerts, setAlerts] = useState([]);
  const [trades, setTrades] = useState([]);
  const [circuitBreakerState, setCircuitBreakerState] = useState('Normal');
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await api.get('/api/alerts?limit=50');
      const mapped = (data.alerts || []).map(mapAlert);
      setAlerts(mapped);
      return mapped;
    } catch (err) {
      console.error('Failed to fetch alerts:', err.message);
      return [];
    }
  }, []);

  const fetchTrades = useCallback(async () => {
    try {
      const { data } = await api.get('/api/trades?limit=50');
      const mapped = (data.trades || []).map(mapTrade);
      setTrades(mapped);
      return mapped;
    } catch (err) {
      console.error('Failed to fetch trades:', err.message);
      return [];
    }
  }, []);

  const fetchCircuitBreaker = useCallback(async () => {
    try {
      const { data } = await api.get('/api/circuit-breaker/status');
      const states = ['Normal', 'Paused', 'Emergency'];
      setCircuitBreakerState(states[data.state] || data.state || 'Normal');
    } catch (err) {
      console.error('Failed to fetch circuit breaker:', err.message);
    }
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [alertsData, tradesData] = await Promise.all([
        fetchAlerts(), fetchTrades(), fetchCircuitBreaker(),
      ]);
      setStats(computeStats(alertsData || [], tradesData || []));
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend. Is the server running?');
    }
  }, [fetchAlerts, fetchTrades, fetchCircuitBreaker]);

  useEffect(() => {
    setLoading(true);
    loadAll().finally(() => setLoading(false));

    socket.on('newAlerts', () => loadAll());
    socket.on('circuitBreakerTriggered', (data) => {
      setCircuitBreakerState(data.action);
      loadAll();
    });

    const interval = setInterval(loadAll, 30000);
    return () => {
      socket.off('newAlerts');
      socket.off('circuitBreakerTriggered');
      clearInterval(interval);
    };
  }, [loadAll]);

  const triggerCircuitBreaker = async (action, reason) => {
    try {
      await api.post('/api/circuit-breaker', { action: action.toLowerCase(), reason });
      setCircuitBreakerState(action);
      await loadAll();
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      alert('Failed to trigger circuit breaker: ' + msg);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {error && (
        <Box sx={{ p: 2, bgcolor: 'error.dark', color: 'white', textAlign: 'center' }}>
          <Typography variant="body2" component="span">{error}</Typography>
          <Button size="small" sx={{ ml: 2, color: 'white' }} onClick={loadAll}>Retry</Button>
        </Box>
      )}
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation circuitBreakerState={circuitBreakerState} stats={stats} />
          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
              <Routes>
                <Route path="/" element={<Dashboard alerts={alerts} trades={trades} stats={stats} />} />
                <Route path="/alerts" element={<Alerts alerts={alerts} onRefresh={fetchAlerts} />} />
                <Route path="/trades" element={<Trades trades={trades} onRefresh={fetchTrades} />} />
                <Route path="/circuit-breaker" element={<CircuitBreaker state={circuitBreakerState} onTrigger={triggerCircuitBreaker} stats={stats} />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
