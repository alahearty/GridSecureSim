import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Grid, Alert, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import {
  Search, Refresh, FilterList, Info, Warning, Error,
  CheckCircle, Schedule, Source
} from '@mui/icons-material';

const Alerts = ({ alerts, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'High': return <Error />;
      case 'Medium': return <Warning />;
      case 'Low': return <Info />;
      default: return <Info />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <Error />;
      case 'Monitoring': return <Schedule />;
      case 'Resolved': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const severityCounts = {
    High: alerts.filter(a => a.severity === 'High').length,
    Medium: alerts.filter(a => a.severity === 'Medium').length,
    Low: alerts.filter(a => a.severity === 'Low').length
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAlert(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'white' }}>
        Security Alerts
      </Typography>

      {/* Search and Filter Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ bgcolor: 'background.paper' }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setSeverityFilter(severityFilter === 'All' ? 'High' : 
                   severityFilter === 'High' ? 'Medium' : 
                   severityFilter === 'Medium' ? 'Low' : 'All')}
            sx={{ bgcolor: 'background.paper' }}
          >
            {severityFilter} Severities
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Refresh />}
            onClick={onRefresh}
            sx={{ bgcolor: 'primary.main' }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      {/* Alert Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">
                {severityCounts.High}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Severity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {severityCounts.Medium}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medium Severity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {severityCounts.Low}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Severity
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {alerts.filter(a => a.status === 'Resolved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts Table */}
      <Card sx={{ bgcolor: 'background.paper' }}>
        <CardContent>
          <TableContainer component={Paper} sx={{ bgcolor: 'background.default' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Severity</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <TableRow 
                      key={alert.id} 
                      hover 
                      onClick={() => handleAlertClick(alert)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Chip
                          icon={getSeverityIcon(alert.severity)}
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {alert.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {alert.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(alert.status)}
                          label={alert.status}
                          color={getStatusColor(alert.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Source />}
                          label={alert.source}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(alert.timestamp).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Info />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <Box>
                        <Typography variant="h6" color="text.secondary">
                          No alerts found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          All clear! No security alerts at the moment.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedAlert && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getSeverityIcon(selectedAlert.severity)}
                <Typography variant="h6">
                  {selectedAlert.type}
                </Typography>
                <Chip
                  label={selectedAlert.severity}
                  color={getSeverityColor(selectedAlert.severity)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Alert Message
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedAlert.message}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedAlert.details}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedAlert.status)}
                    label={selectedAlert.status}
                    color={getStatusColor(selectedAlert.status)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Source
                  </Typography>
                  <Chip
                    icon={<Source />}
                    label={selectedAlert.source}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Confidence
                  </Typography>
                  <Typography variant="body2">
                    {(selectedAlert.confidence * 100).toFixed(0)}%
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Timestamp
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Alerts; 