import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip
} from '@mui/material';
import { Warning, Error, CheckCircle } from '@mui/icons-material';

const CircuitBreaker = ({ state, onTrigger }) => {
  const getStateIcon = (currentState) => {
    switch (currentState) {
      case 'Normal':
        return <CheckCircle color="success" />;
      case 'Warning':
        return <Warning color="warning" />;
      case 'Emergency':
        return <Error color="error" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getStateColor = (currentState) => {
    switch (currentState) {
      case 'Normal':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Emergency':
        return 'error';
      default:
        return 'success';
    }
  };

  const getStateDescription = (currentState) => {
    switch (currentState) {
      case 'Normal':
        return 'System operating normally. All trading operations are active.';
      case 'Warning':
        return 'System under stress. Trading volume and frequency may be limited.';
      case 'Emergency':
        return 'System in emergency mode. Trading operations are suspended.';
      default:
        return 'System operating normally.';
    }
  };

  const handleTrigger = (action, reason) => {
    onTrigger(action, reason);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Circuit Breaker Control
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getStateIcon(state)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Current Status
                </Typography>
              </Box>
              
              <Chip
                label={state}
                color={getStateColor(state)}
                size="large"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body1" color="text.secondary">
                {getStateDescription(state)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Manual Override
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use these controls to manually trigger circuit breaker states.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleTrigger('Normal', 'Manual override to normal')}
                  disabled={state === 'Normal'}
                  fullWidth
                >
                  Set to Normal
                </Button>
                
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => handleTrigger('Warning', 'Manual override to warning')}
                  disabled={state === 'Warning'}
                  fullWidth
                >
                  Set to Warning
                </Button>
                
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleTrigger('Emergency', 'Manual override to emergency')}
                  disabled={state === 'Emergency'}
                  fullWidth
                >
                  Set to Emergency
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> Circuit breakers are automatic safety mechanisms that protect the trading system 
              from excessive volatility or system stress. Manual overrides should only be used in emergency situations 
              or for testing purposes.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CircuitBreaker; 