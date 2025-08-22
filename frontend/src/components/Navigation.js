import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Notifications as AlertsIcon,
  SwapHoriz as TradesIcon,
  Warning as CircuitBreakerIcon
} from '@mui/icons-material';

const Navigation = ({ circuitBreakerState, stats }) => {
  const location = useLocation();
  const drawerWidth = 280;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Alerts', icon: <AlertsIcon />, path: '/alerts' },
    { text: 'Trades', icon: <TradesIcon />, path: '/trades' },
    { text: 'Circuit Breaker', icon: <CircuitBreakerIcon />, path: '/circuit-breaker' }
  ];

  const getCircuitBreakerColor = (state) => {
    switch (state) {
      case 'Normal':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Emergency':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid #333'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          GridSecureSim
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'gray', mb: 1 }}>
            Circuit Breaker Status
          </Typography>
          <Chip
            label={circuitBreakerState}
            color={getCircuitBreakerColor(circuitBreakerState)}
            size="small"
            sx={{ color: 'white' }}
          />
        </Box>

        <Divider sx={{ backgroundColor: '#333', mb: 2 }} />

        {/* Statistics */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Statistics
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Alerts: <Chip label={stats.totalAlerts} size="small" color="error" />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Active Alerts: <Chip label={stats.activeAlerts} size="small" color="warning" />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Trades: <Chip label={stats.totalTrades} size="small" color="info" />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Daily Volume: <Chip label={`${stats.dailyVolume} ETH`} size="small" color="success" />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Network Health: <Chip label={stats.networkHealth} size="small" color="success" />
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
              Last Update: {new Date(stats.lastUpdate).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ backgroundColor: '#333' }} />

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              color: location.pathname === item.path ? '#2196f3' : 'white',
              '&:hover': {
                backgroundColor: '#333'
              },
              mb: 1
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Navigation;
