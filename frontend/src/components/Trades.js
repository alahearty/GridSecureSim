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
  TrendingUp,
  TrendingDown,
  Visibility,
  FilterList,
  Refresh
} from '@mui/icons-material';

const Trades = ({ trades = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getTradeStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTradeTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'buy':
        return <TrendingUp color="success" />;
      case 'sell':
        return <TrendingDown color="error" />;
      default:
        return <TrendingUp />;
    }
  };

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.to?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || trade.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalVolume = trades.reduce((sum, trade) => sum + (parseFloat(trade.amount) || 0), 0);
  const completedTrades = trades.filter(t => t.status?.toLowerCase() === 'completed').length;
  const failedTrades = trades.filter(t => t.status?.toLowerCase() === 'failed').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Energy Trading Transactions
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search by hash, from, or to address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 400 }}
        />
        
        <Chip
          label={filterStatus === 'all' ? 'All Status' : filterStatus}
          onClick={() => setFilterStatus(filterStatus === 'all' ? 'completed' : 
                                       filterStatus === 'completed' ? 'pending' : 
                                       filterStatus === 'pending' ? 'failed' : 'all')}
          icon={<FilterList />}
          variant="outlined"
        />

        <IconButton>
          <Refresh />
        </IconButton>
      </Box>

      {/* Trading Summary */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Trades
                </Typography>
                <Typography variant="h4">
                  {trades.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Volume
                </Typography>
                <Typography variant="h4" color="primary">
                  {totalVolume.toFixed(2)} ETH
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4" color="success.main">
                  {completedTrades}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Failed
                </Typography>
                <Typography variant="h4" color="error">
                  {failedTrades}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Trades Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Hash</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Amount (ETH)</TableCell>
              <TableCell>Price (ETH/kWh)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrades.map((trade, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getTradeTypeIcon(trade.type)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {trade.type}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {trade.hash ? `${trade.hash.substring(0, 8)}...${trade.hash.substring(trade.hash.length - 6)}` : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {trade.from ? `${trade.from.substring(0, 8)}...${trade.from.substring(trade.from.length - 6)}` : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {trade.to ? `${trade.to.substring(0, 8)}...${trade.to.substring(trade.to.length - 6)}` : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {parseFloat(trade.amount || 0).toFixed(4)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parseFloat(trade.price || 0).toFixed(6)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={trade.status || 'Unknown'}
                    color={getTradeStatusColor(trade.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(trade.timestamp).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTrades.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No trades found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter criteria' : 'No trading activity recorded yet.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Trades; 