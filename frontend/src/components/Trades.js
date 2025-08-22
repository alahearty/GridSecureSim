import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Grid, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import {
  Search, Refresh, FilterList, Info, TrendingUp, 
  TrendingDown, Schedule, AccountBalance, Receipt
} from '@mui/icons-material';

const Trades = ({ trades, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'whale': return 'error';
      case 'large': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <TrendingUp />;
      case 'pending': return <Schedule />;
      case 'failed': return <TrendingDown />;
      default: return <Info />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'whale': return <AccountBalance />;
      case 'large': return <TrendingUp />;
      case 'normal': return <Receipt />;
      default: return <Info />;
    }
  };

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.transactionHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || trade.status === statusFilter;
    const matchesType = typeFilter === 'All' || trade.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusCounts = {
    completed: trades.filter(t => t.status === 'completed').length,
    pending: trades.filter(t => t.status === 'pending').length,
    failed: trades.filter(t => t.status === 'failed').length
  };

  const typeCounts = {
    normal: trades.filter(t => t.type === 'normal').length,
    large: trades.filter(t => t.type === 'large').length,
    whale: trades.filter(t => t.type === 'whale').length
  };

  const totalVolume = trades.reduce((sum, trade) => sum + parseFloat(trade.amount), 0);
  const averagePrice = trades.reduce((sum, trade) => sum + parseFloat(trade.price), 0) / trades.length;

  const handleTradeClick = (trade) => {
    setSelectedTrade(trade);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTrade(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'white' }}>
        Energy Trading History
      </Typography>

      {/* Search and Filter Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ bgcolor: 'background.paper' }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setStatusFilter(statusFilter === 'All' ? 'completed' : 
                   statusFilter === 'completed' ? 'pending' : 
                   statusFilter === 'pending' ? 'failed' : 'All')}
            sx={{ bgcolor: 'background.paper' }}
          >
            {statusFilter}
          </Button>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setTypeFilter(typeFilter === 'All' ? 'normal' : 
                   typeFilter === 'normal' ? 'large' : 
                   typeFilter === 'large' ? 'whale' : 'All')}
            sx={{ bgcolor: 'background.paper' }}
          >
            {typeFilter}
          </Button>
        </Grid>
        <Grid item xs={12} md={2}>
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

      {/* Trading Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {statusCounts.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {statusCounts.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">
                {statusCounts.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {totalVolume.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Volume (ETH)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trade Type Breakdown */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">
                {typeCounts.normal}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Normal Trades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {typeCounts.large}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Large Trades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                {typeCounts.whale}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Whale Trades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trades Table */}
      <Card sx={{ bgcolor: 'background.paper' }}>
        <CardContent>
          <TableContainer component={Paper} sx={{ bgcolor: 'background.default' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount (ETH)</TableCell>
                  <TableCell>Price (ETH)</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Gas Used</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTrades.length > 0 ? (
                  filteredTrades.map((trade) => (
                    <TableRow 
                      key={trade.id} 
                      hover 
                      onClick={() => handleTradeClick(trade)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Chip
                          icon={getTypeIcon(trade.type)}
                          label={trade.type}
                          color={getTypeColor(trade.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {trade.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {trade.price}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {trade.buyer.slice(0, 8)}...{trade.buyer.slice(-6)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {trade.seller.slice(0, 8)}...{trade.seller.slice(-6)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(trade.status)}
                          label={trade.status}
                          color={getStatusColor(trade.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {trade.gasUsed ? trade.gasUsed.toLocaleString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(trade.timestamp).toLocaleString()}
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
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <Box>
                        <Typography variant="h6" color="text.secondary">
                          No trades found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your search or filter criteria.
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

      {/* Trade Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedTrade && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getTypeIcon(selectedTrade.type)}
                <Typography variant="h6">
                  Trade Details
                </Typography>
                <Chip
                  label={selectedTrade.type}
                  color={getTypeColor(selectedTrade.type)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Trade Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Amount: {selectedTrade.amount} ETH
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Price: {selectedTrade.price} ETH
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Total Value: {(parseFloat(selectedTrade.amount) * parseFloat(selectedTrade.price)).toFixed(2)} ETH
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedTrade.status)}
                    label={selectedTrade.status}
                    color={getStatusColor(selectedTrade.status)}
                    sx={{ mb: 2 }}
                  />
                  {selectedTrade.gasUsed && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Gas Used: {selectedTrade.gasUsed.toLocaleString()}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Addresses
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Buyer:</strong> {selectedTrade.buyer}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Seller:</strong> {selectedTrade.seller}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Transaction Hash
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedTrade.transactionHash}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Timestamp
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedTrade.timestamp).toLocaleString()}
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

export default Trades; 