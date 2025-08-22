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
    severity: 'High',
    type: 'Suspicious Trading Pattern',
    message: 'Unusual trading volume detected: 1500 ETH in 5 minutes',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: 'Active',
    details: 'Multiple large trades detected from single address 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    source: 'Forta Agent',
    confidence: 0.95
  },
  {
    id: 2,
    severity: 'High',
    type: 'Price Manipulation',
    message: 'Energy token price dropped 40% in 2 minutes',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    status: 'Active',
    details: 'Coordinated sell orders detected across multiple addresses',
    source: 'Price Monitor',
    confidence: 0.88
  },
  {
    id: 3,
    severity: 'Medium',
    type: 'Large Token Minting',
    message: '5000 energy tokens minted in single transaction',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    status: 'Resolved',
    details: 'Address 0x8ba1f109551bD432803012645Hac136c22C177e9 minted tokens',
    source: 'Minting Monitor',
    confidence: 0.72
  },
  {
    id: 4,
    severity: 'Medium',
    type: 'Rapid Trade Sequence',
    message: '15 trades executed in 30 seconds',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    status: 'Active',
    details: 'Unusual trading frequency from address 0x1234567890abcdef1234567890abcdef12345678',
    source: 'Trade Monitor',
    confidence: 0.81
  },
  {
    id: 5,
    severity: 'Low',
    type: 'Gas Price Spike',
    message: 'Gas price increased by 200% in 10 minutes',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: 'Resolved',
    details: 'Network congestion detected, gas prices normalized',
    source: 'Network Monitor',
    confidence: 0.65
  },
  {
    id: 6,
    severity: 'High',
    type: 'Smart Contract Vulnerability',
    message: 'Potential reentrancy attack detected',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    status: 'Active',
    details: 'Multiple calls to withdraw function detected in single transaction',
    source: 'Security Scanner',
    confidence: 0.93
  },
  {
    id: 7,
    severity: 'Medium',
    type: 'Whale Activity',
    message: 'Large holder moved 10,000 energy tokens',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    status: 'Monitoring',
    details: 'Address 0x9876543210fedcba9876543210fedcba98765432 transferred tokens',
    source: 'Whale Tracker',
    confidence: 0.78
  },
  {
    id: 8,
    severity: 'Low',
    type: 'Network Latency',
    message: 'Block confirmation time increased to 15 seconds',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'Resolved',
    details: 'Network performance returned to normal levels',
    source: 'Performance Monitor',
    confidence: 0.55
  },
  {
    id: 9,
    severity: 'High',
    type: 'Flash Loan Attack',
    message: 'Suspicious flash loan pattern detected',
    timestamp: new Date(Date.now() - 4200000).toISOString(),
    status: 'Active',
    details: 'Large flash loan followed by immediate trading activity',
    source: 'Attack Detector',
    confidence: 0.91
  },
  {
    id: 10,
    severity: 'Medium',
    type: 'Unusual Trading Hours',
    message: 'High volume trading detected during off-peak hours',
    timestamp: new Date(Date.now() - 4800000).toISOString(),
    status: 'Monitoring',
    details: 'Trading volume 3x higher than usual for this time period',
    source: 'Pattern Analyzer',
    confidence: 0.74
  }
];

const DUMMY_TRADES = [
  {
    id: 1,
    buyer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    seller: '0x8ba1f109551bD432803012645Hac136c22C177e9',
    amount: '150.5',
    price: '0.85',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: 'normal',
    status: 'completed',
    gasUsed: '45000',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 2,
    buyer: '0x1234567890abcdef1234567890abcdef12345678',
    seller: '0x9876543210fedcba9876543210fedcba98765432',
    amount: '75.2',
    price: '0.92',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    type: 'normal',
    status: 'completed',
    gasUsed: '32000',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: 3,
    buyer: '0x8ba1f109551bD432803012645Hac136c22C177e9',
    seller: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    amount: '200.0',
    price: '0.78',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    type: 'large',
    status: 'completed',
    gasUsed: '55000',
    transactionHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
  },
  {
    id: 4,
    buyer: '0x9876543210fedcba9876543210fedcba98765432',
    seller: '0x1234567890abcdef1234567890abcdef12345678',
    amount: '45.8',
    price: '0.95',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    type: 'normal',
    status: 'completed',
    gasUsed: '28000',
    transactionHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'
  },
  {
    id: 5,
    buyer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    seller: '0x8ba1f109551bD432803012645Hac136c22C177e9',
    amount: '300.0',
    price: '0.82',
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    type: 'large',
    status: 'pending',
    gasUsed: '0',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 6,
    buyer: '0x1234567890abcdef1234567890abcdef12345678',
    seller: '0x9876543210fedcba9876543210fedcba98765432',
    amount: '25.5',
    price: '0.88',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: 'normal',
    status: 'completed',
    gasUsed: '25000',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: 7,
    buyer: '0x8ba1f109551bD432803012645Hac136c22C177e9',
    seller: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    amount: '500.0',
    price: '0.75',
    timestamp: new Date(Date.now() - 2100000).toISOString(),
    type: 'whale',
    status: 'completed',
    gasUsed: '75000',
    transactionHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
  },
  {
    id: 8,
    buyer: '0x9876543210fedcba9876543210fedcba98765432',
    seller: '0x1234567890abcdef1234567890abcdef12345678',
    amount: '12.3',
    price: '0.91',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    type: 'normal',
    status: 'failed',
    gasUsed: '0',
    transactionHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'
  },
  {
    id: 9,
    buyer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    seller: '0x8ba1f109551bD432803012645Hac136c22C177e9',
    amount: '180.7',
    price: '0.87',
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    type: 'normal',
    status: 'completed',
    gasUsed: '42000',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 10,
    buyer: '0x1234567890abcdef1234567890abcdef12345678',
    seller: '0x9876543210fedcba9876543210fedcba98765432',
    amount: '95.4',
    price: '0.89',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    type: 'normal',
    status: 'completed',
    gasUsed: '35000',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: 11,
    buyer: '0x8ba1f109551bD432803012645Hac136c22C177e9',
    seller: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    amount: '750.0',
    price: '0.73',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    type: 'whale',
    status: 'completed',
    gasUsed: '85000',
    transactionHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
  },
  {
    id: 12,
    buyer: '0x9876543210fedcba9876543210fedcba98765432',
    seller: '0x1234567890abcdef1234567890abcdef12345678',
    amount: '33.8',
    price: '0.94',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'normal',
    status: 'completed',
    gasUsed: '30000',
    transactionHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'
  }
];

const DUMMY_STATS = {
  totalAlerts: 10,
  activeAlerts: 6,
  totalTrades: 12,
  dailyVolume: '2,456.3',
  highSeverityAlerts: 4,
  mediumSeverityAlerts: 4,
  lowSeverityAlerts: 2,
  completedTrades: 10,
  pendingTrades: 1,
  failedTrades: 1,
  averageTradeSize: '204.7',
  averagePrice: '0.84',
  totalGasUsed: '465,000',
  networkHealth: 'Good',
  lastUpdate: new Date().toISOString()
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
      // Simulate new alerts (20% chance every 10 seconds)
      if (Math.random() < 0.2) {
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Keep max 20 alerts
        setStats(prev => ({
          ...prev,
          totalAlerts: prev.totalAlerts + 1,
          activeAlerts: prev.activeAlerts + 1,
          [newAlert.severity.toLowerCase() + 'SeverityAlerts']: prev[newAlert.severity.toLowerCase() + 'SeverityAlerts'] + 1
        }));
        console.log('🚨 New alert generated:', newAlert.type);
      }

      // Simulate new trades (30% chance every 10 seconds)
      if (Math.random() < 0.3) {
        const newTrade = generateRandomTrade();
        setTrades(prev => [newTrade, ...prev.slice(0, 19)]); // Keep max 20 trades
        setStats(prev => ({
          ...prev,
          totalTrades: prev.totalTrades + 1,
          completedTrades: newTrade.status === 'completed' ? prev.completedTrades + 1 : prev.completedTrades,
          pendingTrades: newTrade.status === 'pending' ? prev.pendingTrades + 1 : prev.pendingTrades,
          failedTrades: newTrade.status === 'failed' ? prev.failedTrades + 1 : prev.failedTrades,
          dailyVolume: (parseFloat(prev.dailyVolume.replace(',', '')) + parseFloat(newTrade.amount)).toFixed(1),
          averageTradeSize: ((parseFloat(prev.averageTradeSize) * (prev.totalTrades - 1) + parseFloat(newTrade.amount)) / prev.totalTrades).toFixed(1),
          averagePrice: ((parseFloat(prev.averagePrice) * (prev.totalTrades - 1) + parseFloat(newTrade.price)) / prev.totalTrades).toFixed(2),
          totalGasUsed: (parseInt(prev.totalGasUsed.replace(',', '')) + parseInt(newTrade.gasUsed || 0)).toLocaleString()
        }));
        console.log('💱 New trade generated:', newTrade.type, newTrade.amount);
      }

      // Simulate status changes (15% chance every 10 seconds)
      if (Math.random() < 0.15) {
        // Randomly resolve an active alert
        setAlerts(prev => {
          const activeAlerts = prev.filter(alert => alert.status === 'Active');
          if (activeAlerts.length > 0) {
            const randomAlert = activeAlerts[Math.floor(Math.random() * activeAlerts.length)];
            const updatedAlerts = prev.map(alert => 
              alert.id === randomAlert.id ? { ...alert, status: 'Resolved' } : alert
            );
            setStats(prevStats => ({
              ...prevStats,
              activeAlerts: prevStats.activeAlerts - 1
            }));
            console.log('✅ Alert resolved:', randomAlert.type);
            return updatedAlerts;
          }
          return prev;
        });

        // Randomly complete a pending trade
        setTrades(prev => {
          const pendingTrades = prev.filter(trade => trade.status === 'pending');
          if (pendingTrades.length > 0) {
            const randomTrade = pendingTrades[Math.floor(Math.random() * pendingTrades.length)];
            const updatedTrades = prev.map(trade => 
              trade.id === randomTrade.id ? { ...trade, status: 'completed', gasUsed: Math.floor(Math.random() * 50000) + 20000 } : trade
            );
            setStats(prevStats => ({
              ...prevStats,
              pendingTrades: prevStats.pendingTrades - 1,
              completedTrades: prevStats.completedTrades + 1,
              totalGasUsed: (parseInt(prevStats.totalGasUsed.replace(',', '')) + parseInt(randomTrade.gasUsed || 35000)).toLocaleString()
            }));
            console.log('✅ Trade completed:', randomTrade.amount);
            return updatedTrades;
          }
          return prev;
        });
      }

      // Update last update timestamp
      setStats(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString()
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Helper functions to generate random data
  const generateRandomAlert = () => {
    const alertTypes = [
      'Suspicious Trading Pattern',
      'Price Manipulation',
      'Large Token Minting',
      'Rapid Trade Sequence',
      'Gas Price Spike',
      'Smart Contract Vulnerability',
      'Whale Activity',
      'Network Latency',
      'Flash Loan Attack',
      'Unusual Trading Hours',
      'MEV Bot Detection',
      'Sandwich Attack',
      'Front-running Detection',
      'Liquidity Drain',
      'Oracle Manipulation'
    ];

    const alertSources = [
      'Forta Agent',
      'Price Monitor',
      'Minting Monitor',
      'Trade Monitor',
      'Network Monitor',
      'Security Scanner',
      'Whale Tracker',
      'Performance Monitor',
      'Attack Detector',
      'Pattern Analyzer'
    ];

    const severities = ['High', 'Medium', 'Low'];
    const statuses = ['Active', 'Monitoring', 'Resolved'];
    
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: Date.now(),
      severity,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      message: generateAlertMessage(severity),
      timestamp: new Date().toISOString(),
      status,
      details: generateAlertDetails(),
      source: alertSources[Math.floor(Math.random() * alertSources.length)],
      confidence: (Math.random() * 0.4 + 0.6).toFixed(2) // 0.6 to 1.0
    };
  };

  const generateRandomTrade = () => {
    const tradeTypes = ['normal', 'large', 'whale'];
    const statuses = ['completed', 'pending', 'failed'];
    const addresses = [
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      '0x8ba1f109551bD432803012645Hac136c22C177e9',
      '0x1234567890abcdef1234567890abcdef12345678',
      '0x9876543210fedcba9876543210fedcba98765432',
      '0xabcdef1234567890abcdef1234567890abcdef12',
      '0xfedcba9876543210fedcba9876543210fedcba98'
    ];

    const type = tradeTypes[Math.floor(Math.random() * tradeTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let amount, price;
    switch (type) {
      case 'whale':
        amount = (Math.random() * 1000 + 500).toFixed(1);
        price = (Math.random() * 0.3 + 0.6).toFixed(2);
        break;
      case 'large':
        amount = (Math.random() * 400 + 100).toFixed(1);
        price = (Math.random() * 0.4 + 0.7).toFixed(2);
        break;
      default:
        amount = (Math.random() * 100 + 10).toFixed(1);
        price = (Math.random() * 0.3 + 0.8).toFixed(2);
    }

    return {
      id: Date.now(),
      buyer: addresses[Math.floor(Math.random() * addresses.length)],
      seller: addresses[Math.floor(Math.random() * addresses.length)],
      amount,
      price,
      timestamp: new Date().toISOString(),
      type,
      status,
      gasUsed: status === 'completed' ? Math.floor(Math.random() * 50000) + 20000 : 0,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
  };

  const generateAlertMessage = (severity) => {
    const messages = {
      High: [
        'Critical security breach detected in smart contract',
        'Massive price manipulation attempt identified',
        'Coordinated attack pattern detected across multiple addresses',
        'Emergency: System vulnerability exploited',
        'Large-scale token drain in progress'
      ],
      Medium: [
        'Unusual trading activity detected',
        'Suspicious transaction pattern identified',
        'Large token movement from known address',
        'Network performance degradation detected',
        'Whale activity above normal thresholds'
      ],
      Low: [
        'Minor network latency detected',
        'Gas price fluctuation observed',
        'Unusual trading hours activity',
        'Minor performance anomaly detected',
        'Low-priority security alert'
      ]
    };
    
    const severityMessages = messages[severity];
    return severityMessages[Math.floor(Math.random() * severityMessages.length)];
  };

  const generateAlertDetails = () => {
    const details = [
      'Multiple large trades detected from single address',
      'Coordinated sell orders detected across multiple addresses',
      'Address 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 executed suspicious transaction',
      'Unusual trading frequency from address 0x1234567890abcdef1234567890abcdef12345678',
      'Network congestion detected, gas prices normalized',
      'Multiple calls to withdraw function detected in single transaction',
      'Address 0x9876543210fedcba9876543210fedcba98765432 transferred tokens',
      'Network performance returned to normal levels',
      'Large flash loan followed by immediate trading activity',
      'Trading volume 3x higher than usual for this time period'
    ];
    
    return details[Math.floor(Math.random() * details.length)];
  };

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
    
    // Update local state and add new alert
    setCircuitBreakerState(action);
    
    const newAlert = {
      id: Date.now(),
      severity: 'High',
      type: 'Circuit Breaker Triggered',
      message: `Circuit breaker ${action.toLowerCase()}: ${reason}`,
      timestamp: new Date().toISOString(),
      status: 'Active',
      details: `System protection mechanism activated due to: ${reason}. All trading operations have been ${action === 'Triggered' ? 'suspended' : 'resumed'}.`,
      source: 'System Monitor',
      confidence: 1.0
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
    setStats(prev => ({
      ...prev,
      totalAlerts: prev.totalAlerts + 1,
      activeAlerts: prev.activeAlerts + 1,
      highSeverityAlerts: prev.highSeverityAlerts + 1
    }));
    
    console.log('🔴 Circuit breaker triggered (dummy):', action, reason);
    
    // Show success message
    alert(`Circuit breaker ${action.toLowerCase()} successfully! Reason: ${reason}`);
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
          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Dashboard 
                      alerts={alerts} 
                      trades={trades} 
                      stats={stats}
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
                      stats={stats}
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