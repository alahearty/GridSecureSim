import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';

// Components
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import Trades from './components/Trades';
import CircuitBreaker from './components/CircuitBreaker';
import Navigation from './components/Navigation';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Socket connection
const socket = io('http://localhost:2002');

function App() {
  const [alerts, setAlerts] = useState([]);
  const [trades, setTrades] = useState([]);
  const [circuitBreakerState, setCircuitBreakerState] = useState('Normal');
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeAlerts: 0,
    totalTrades: 0,
    dailyVolume: '0'
  });

  useEffect(() => {
    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('newAlerts', (data) => {
      console.log('New alerts received:', data);
      fetchAlerts();
    });

    socket.on('circuitBreakerTriggered', (data) => {
      console.log('Circuit breaker triggered:', data);
      setCircuitBreakerState(data.action);
    });

    socket.on('initialData', (data) => {
      console.log('Initial data received:', data);
      setCircuitBreakerState(data.circuitBreakerState);
    });

    // Initial data fetch
    fetchInitialData();

    // Cleanup
    return () => {
      socket.off('newAlerts');
      socket.off('circuitBreakerTriggered');
      socket.off('initialData');
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchAlerts(),
        fetchTrades(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/alerts?limit=100');
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchTrades = async () => {
    try {
      const response = await axios.get('/api/trades?limit=100');
      setTrades(response.data.trades);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [alertsResponse, tradesResponse, circuitBreakerResponse] = await Promise.all([
        axios.get('/api/alerts/stats'),
        axios.get('/api/trades'),
        axios.get('/api/circuit-breaker/status')
      ]);

      const alertStats = alertsResponse.data.stats;
      const totalAlerts = alertStats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
      const activeAlerts = alertStats
        .filter(stat => stat.status === 'active')
        .reduce((sum, stat) => sum + parseInt(stat.count), 0);

      setStats({
        totalAlerts,
        activeAlerts,
        totalTrades: tradesResponse.data.total,
        dailyVolume: circuitBreakerResponse.data.dailyVolume
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const triggerCircuitBreaker = async (action, reason) => {
    try {
      await axios.post('/api/circuit-breaker', { action, reason });
      console.log('Circuit breaker triggered:', action, reason);
    } catch (error) {
      console.error('Error triggering circuit breaker:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation 
            circuitBreakerState={circuitBreakerState}
            stats={stats}
          />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Container maxWidth="xl">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Dashboard 
                      alerts={alerts}
                      trades={trades}
                      circuitBreakerState={circuitBreakerState}
                      stats={stats}
                      onCircuitBreakerTrigger={triggerCircuitBreaker}
                    />
                  } 
                />
                <Route 
                  path="/alerts" 
                  element={
                    <Alerts 
                      alerts={alerts}
                      onRefresh={fetchAlerts}
                    />
                  } 
                />
                <Route 
                  path="/trades" 
                  element={
                    <Trades 
                      trades={trades}
                      onRefresh={fetchTrades}
                    />
                  } 
                />
                <Route 
                  path="/circuit-breaker" 
                  element={
                    <CircuitBreaker 
                      state={circuitBreakerState}
                      onTrigger={triggerCircuitBreaker}
                    />
                  } 
                />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 