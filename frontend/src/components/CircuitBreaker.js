import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, Grid, 
  Alert, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, FormControl, InputLabel, 
  Select, MenuItem, Divider, Paper
} from '@mui/material';
import { 
  Warning, Error, CheckCircle, PowerSettingsNew,
  Security, Speed, History, Settings
} from '@mui/icons-material';

const CircuitBreaker = ({ state, onTrigger, stats }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState('Triggered');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const getStateColor = (state) => {
    switch (state) {
      case 'Normal': return 'success';
      case 'Warning': return 'warning';
      case 'Triggered': return 'error';
      case 'Emergency': return 'error';
      default: return 'default';
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'Normal': return <CheckCircle />;
      case 'Warning': return <Warning />;
      case 'Triggered': return <Error />;
      case 'Emergency': return <Error />;
      default: return <Warning />;
    }
  };

  const getStateDescription = (state) => {
    switch (state) {
      case 'Normal':
        return 'All systems operating normally. Trading and monitoring active.';
      case 'Warning':
        return 'System under observation. Some restrictions may apply.';
      case 'Triggered':
        return 'Trading suspended due to security concerns. Investigation in progress.';
      case 'Emergency':
        return 'Critical system shutdown. Immediate intervention required.';
      default:
        return 'System status unknown.';
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAction('Triggered');
    setReason('');
    setCustomReason('');
  };

  const handleSubmit = () => {
    const finalReason = reason === 'Custom' ? customReason : reason;
    if (finalReason.trim()) {
      onTrigger(action, finalReason);
      handleCloseDialog();
    }
  };

  const isActionDisabled = () => {
    return !reason || (reason === 'Custom' && !customReason.trim());
  };

  const getSystemHealth = () => {
    if (stats.activeAlerts > 5) return 'Critical';
    if (stats.activeAlerts > 2) return 'Warning';
    return 'Good';
  };

  const getSystemHealthColor = (health) => {
    switch (health) {
      case 'Good': return 'success';
      case 'Warning': return 'warning';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'white' }}>
        Circuit Breaker Control
      </Typography>

      {/* Current Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getStateIcon(state)}
                <Typography variant="h5" sx={{ ml: 1 }}>
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
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security />
                <Typography variant="h5" sx={{ ml: 1 }}>
                  System Health
                </Typography>
              </Box>
              <Chip
                label={getSystemHealth()}
                color={getSystemHealthColor(getSystemHealth())}
                size="large"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active Alerts: {stats.activeAlerts}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                High Severity: {stats.highSeverityAlerts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Network: {stats.networkHealth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Control Panel */}
      <Card sx={{ bgcolor: 'background.paper', mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
            Manual Control
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use the circuit breaker to manually control system operations. 
                This should only be used in emergency situations or for testing purposes.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                startIcon={<PowerSettingsNew />}
                onClick={handleOpenDialog}
                sx={{ height: 56 }}
              >
                Control Circuit Breaker
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {stats.totalTrades}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Trades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <History color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {stats.totalAlerts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Settings color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {stats.dailyVolume}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily Volume (ETH)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Circuit Breaker Control Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PowerSettingsNew color="warning" />
            Circuit Breaker Control
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Warning:</strong> This action will affect system operations. 
              Please ensure this is necessary before proceeding.
            </Alert>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={action}
              label="Action"
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="Normal">Resume Normal Operations</MenuItem>
              <MenuItem value="Warning">Set Warning Mode</MenuItem>
              <MenuItem value="Triggered">Trigger Circuit Breaker</MenuItem>
              <MenuItem value="Emergency">Emergency Shutdown</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reason}
              label="Reason"
              onChange={(e) => setReason(e.target.value)}
            >
              <MenuItem value="Security Threat">Security Threat Detected</MenuItem>
              <MenuItem value="System Overload">System Overload</MenuItem>
              <MenuItem value="Network Issues">Network Issues</MenuItem>
              <MenuItem value="Testing">System Testing</MenuItem>
              <MenuItem value="Maintenance">Scheduled Maintenance</MenuItem>
              <MenuItem value="Custom">Custom Reason</MenuItem>
            </Select>
          </FormControl>

          {reason === 'Custom' && (
            <TextField
              fullWidth
              label="Custom Reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter custom reason..."
              sx={{ mb: 2 }}
            />
          )}

          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Action:</strong> {action}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Reason:</strong> {reason === 'Custom' ? customReason : reason}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="warning"
            disabled={isActionDisabled()}
          >
            Execute Action
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CircuitBreaker; 