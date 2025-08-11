import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import {
  Search,
  Warning,
  Error,
  Info,
  FilterList,
  Refresh
} from '@mui/icons-material';

const Alerts = ({ alerts = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <Error />;
      case 'medium':
        return <Warning />;
      case 'low':
        return <Info />;
      default:
        return <Info />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || alert.severity?.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Security Alerts
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <Chip
          label={filterType === 'all' ? 'All Severities' : filterType}
          onClick={() => setFilterType(filterType === 'all' ? 'high' : 
                                     filterType === 'high' ? 'medium' : 
                                     filterType === 'medium' ? 'low' : 'all')}
          icon={<FilterList />}
          variant="outlined"
        />

        <IconButton>
          <Refresh />
        </IconButton>
      </Box>

      {/* Alerts Summary */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Alerts
                </Typography>
                <Typography variant="h4">
                  {alerts.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  High Severity
                </Typography>
                <Typography variant="h4" color="error">
                  {alerts.filter(a => a.severity?.toLowerCase() === 'high').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Medium Severity
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {alerts.filter(a => a.severity?.toLowerCase() === 'medium').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Low Severity
                </Typography>
                <Typography variant="h4" color="info.main">
                  {alerts.filter(a => a.severity?.toLowerCase() === 'low').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Alerts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Severity</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.map((alert, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getSeverityIcon(alert.severity)}
                    <Chip
                      label={alert.severity || 'Unknown'}
                      color={getSeverityColor(alert.severity)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {alert.type}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {alert.message}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={alert.status || 'Active'}
                    color={alert.status === 'Resolved' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAlerts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No alerts found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter criteria' : 'All clear! No security alerts at the moment.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Alerts; 