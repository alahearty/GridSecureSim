import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import io from 'socket.io-client';
// import axios from 'axios'; // Commented out since we're using dummy data

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

// Socket connection (commented out for now)
// const socket = io('http://localhost:2002');

// Dummy data for testing
const DUMMY_ALERTS = [
  {
    id: 1,
    type: 'High Volume Alert',
    severity: 'High',
    status: 'active',
    description: 'Unusual trading volume detected: 1500 MWh in last 5 minutes',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    contractAddress: '0x1234...5678',
    transactionHash: '0xabcd...efgh',
    metadata: {
      volume: '1500 MWh',
      threshold: '1000 MWh',
      timeWindow: '5 minutes'
    }
  },
  {
    id: 2,
    type: 'Price Anomaly',
    severity: 'Medium',
    status: 'active',
    description: 'Energy price deviation detected: 15% above market average',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    contractAddress: '0x1234...5678',
    transactionHash: '0xijkl...mnop',
    metadata: {
      price: '€85/MWh',
      marketAverage: '€74/MWh',
      deviation: '15%'
    }
  },
  {
    id: 3,
    type: 'Rapid Trading',
    severity: 'Low',
    status: 'resolved',
    description: 'Multiple trades detected from same address within 1 minute',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    contractAddress: '0x1234...5678',
    transactionHash: '0xqrst...uvwx',
    metadata: {
      tradeCount: 8,
      timeWindow: '1 minute',
      address: '0x9876...5432'
    }
  },
  {
    id: 4,
    type: 'Large Minting',
    severity: 'High',
    status: 'active',
    description: 'Large energy token minting detected: 5000 MWh',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    contractAddress: '0x1234...5678',
    transactionHash: '0xyzaa...bbcc',
    metadata: {
      amount: '5000 MWh',
      threshold: '3000 MWh',
      address: '0x1111...2222'
    }
  },
  {
    id: 5,
    type: 'Contract Interaction',
    severity: 'Medium',
    status: 'resolved',
    description: 'Unusual contract interaction pattern detected',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    contractAddress: '0x1234...5678',
    transactionHash: '0xdddd...eeee',
    metadata: {
      function: 'transferEnergy',
      gasUsed: '150,000',
      unusual: 'High gas usage'
    }
  }
];

const DUMMY_TRADES = [
  {
    id: 1,
    type: 'buy',
    amount: '500 MWh',
    price: '€75.50/MWh',
    total: '€37,750',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    status: 'completed',
    buyer: '0x1111...2222',
    seller: '0x3333...4444',
    transactionHash: '0xaaaa...bbbb',
    energyType: 'Solar',
    location: 'Germany'
  },
  {
    id: 2,
    type: 'sell',
    amount: '300 MWh',
    price: '€72.30/MWh',
    total: '€21,690',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: 'completed',
    buyer: '0x5555...6666',
    seller: '0x7777...8888',
    transactionHash: '0xcccc...dddd',
    energyType: 'Wind',
    location: 'Netherlands'
  },
  {
    id: 3,
    type: 'buy',
    amount: '750 MWh',
    price: '€78.90/MWh',
    total: '€59,175',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    status: 'pending',
    buyer: '0x9999...aaaa',
    seller: '0xbbbb...cccc',
    transactionHash: '0xeeee...ffff',
    energyType: 'Hydro',
    location: 'Norway'
  },
  {
    id: 4,
    type: 'sell',
    amount: '200 MWh',
    price: '€71.20/MWh',
    total: '€14,240',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    status: 'completed',
    buyer: '0xdddd...eeee',
    seller: '0xffff...1111',
    transactionHash: '0x2222...3333',
    energyType: 'Nuclear',
    location: 'France'
  },
  {
    id: 5,
    type: 'buy',
    amount: '1000 MWh',
    price: '€76.80/MWh',
    total: '€76,800',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    status: 'completed',
    buyer: '0x4444...5555',
    seller: '0x6666...7777',
    transactionHash: '0x8888...9999',
    energyType: 'Biomass',
    location: 'Sweden'
  }
];

const DUMMY_STATS = {
  totalAlerts: 5,
  activeAlerts: 3,
  totalTrades: 5,
  dailyVolume: '€209,655'
};

function App() {
  const [alerts, setAlerts] = useState(DUMMY_ALERTS);
  const [trades, setTrades] = useState(DUMMY_TRADES);
  const [circuitBreakerState, setCircuitBreakerState] = useState('Normal');
  const [stats, setStats] = useState(DUMMY_STATS);

  useEffect(() => {
    // Log that we're running with dummy data
    console.log('🚀 GridSecureSim Frontend running with dummy data for testing');
    console.log('📊 Initial dummy data loaded:', { alerts: alerts.length, trades: trades.length, stats });
    
    // Simulate real-time updates with dummy data
    const interval = setInterval(() => {
      // Simulate new alerts occasionally
      if (Math.random() < 0.1) {
        const newAlert = {
          id: Date.now(),
          type: 'Simulated Alert',
          severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          status: 'active',
          description: 'Simulated alert for testing purposes',
          timestamp: new Date().toISOString(),
          contractAddress: '0x1234...5678',
          transactionHash: '0xsimu...lated',
          metadata: {
            simulated: true,
            timestamp: new Date().toISOString()
          }
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep max 10 alerts
        setStats(prev => ({
          ...prev,
          totalAlerts: prev.totalAlerts + 1,
          activeAlerts: prev.activeAlerts + 1
        }));
        console.log('🔔 New simulated alert added:', newAlert.type);
      }

      // Simulate new trades occasionally
      if (Math.random() < 0.15) {
        const energyTypes = ['Solar', 'Wind', 'Hydro', 'Nuclear', 'Biomass'];
        const locations = ['Germany', 'Netherlands', 'Norway', 'France', 'Sweden'];
        const newTrade = {
          id: Date.now(),
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          amount: `${Math.floor(Math.random() * 1000) + 100} MWh`,
          price: `€${(Math.random() * 20 + 65).toFixed(2)}/MWh`,
          total: '€0', // Will be calculated
          timestamp: new Date().toISOString(),
          status: 'completed',
          buyer: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
          seller: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
          transactionHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
          energyType: energyTypes[Math.floor(Math.random() * energyTypes.length)],
          location: locations[Math.floor(Math.random() * locations.length)]
        };
        
        // Calculate total
        const price = parseFloat(newTrade.price.replace('€', '').replace('/MWh', ''));
        const amount = parseInt(newTrade.amount.replace(' MWh', ''));
        newTrade.total = `€${(price * amount).toLocaleString()}`;
        
        setTrades(prev => [newTrade, ...prev.slice(0, 9)]); // Keep max 10 trades
        setStats(prev => ({
          ...prev,
          totalTrades: prev.totalTrades + 1
        }));
        console.log('💱 New simulated trade added:', `${newTrade.type} ${newTrade.amount} at ${newTrade.price}`);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Dummy functions that simulate API calls
  const fetchAlerts = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Alerts refreshed (dummy data)');
  };

  const fetchTrades = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Trades refreshed (dummy data)');
  };

  const fetchStats = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Stats refreshed (dummy data)');
  };

  const triggerCircuitBreaker = async (action, reason) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update local state
    setCircuitBreakerState(action);
    
    // Add a new alert for the circuit breaker action
    const newAlert = {
      id: Date.now(),
      type: 'Circuit Breaker Triggered',
      severity: action === 'Emergency' ? 'High' : action === 'Warning' ? 'Medium' : 'Low',
      status: 'active',
      description: `Circuit breaker manually triggered: ${action} - ${reason}`,
      timestamp: new Date().toISOString(),
      contractAddress: '0x1234...5678',
      transactionHash: '0xcirc...uit',
      metadata: {
        action,
        reason,
        manual: true,
        timestamp: new Date().toISOString()
      }
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
    setStats(prev => ({
      ...prev,
      totalAlerts: prev.totalAlerts + 1,
      activeAlerts: prev.activeAlerts + 1
    }));
    
    console.log('Circuit breaker triggered (dummy):', action, reason);
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