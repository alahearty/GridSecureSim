# GridSecureSim Frontend Testing Guide

## 🚀 Frontend is now running with comprehensive mock data!

The frontend has been successfully enhanced with extensive mock data that covers all scenarios and edge cases for thorough testing. This allows you to test the full UI functionality with realistic data without any backend dependencies.

## 🌐 Access the Application

**Frontend Dashboard**: http://localhost:2002
**Backend API**: http://localhost:2001 (not needed for frontend testing)

## 📊 What You'll See

### **Dashboard Overview**
- **Key Metrics Cards**: Total Alerts, Total Trades, Daily Volume, Total Gas Used
- **Trading Activity Charts**: Interactive charts with multiple chart types and time ranges
- **Alert Severity Breakdown**: Visual progress bars showing High/Medium/Low severity distribution
- **Trade Status Breakdown**: Progress bars for completed/pending/failed trades
- **Recent Activity**: Latest 5 alerts and trades with detailed information
- **System Status**: Network health indicator and last update timestamp

### **Trading Charts Features**
- **Multiple Chart Types**: Line charts (dual-axis), Area charts, and Bar charts
- **Time Range Selection**: 1H, 6H, 24H, and 7D views
- **Dual-Axis Line Charts**: Volume (left axis) and Price (right axis) on same chart
- **Real-time Data**: Charts update automatically with new trading data
- **Interactive Tooltips**: Hover over data points for detailed information
- **Responsive Design**: Charts adapt to different screen sizes
- **Data Aggregation**: Automatic grouping by hour or day based on time range

### **Security Alerts Page**
- **10 Comprehensive Alerts** covering various security scenarios:
  - High Severity: Suspicious Trading Patterns, Price Manipulation, Smart Contract Vulnerabilities, Flash Loan Attacks
  - Medium Severity: Large Token Minting, Rapid Trade Sequences, Whale Activity, Unusual Trading Hours
  - Low Severity: Gas Price Spikes, Network Latency
- **Alert Summary Cards**: Counts for each severity level and resolved alerts
- **Advanced Filtering**: Search by type, message, or details; filter by severity
- **Interactive Table**: Click any alert to view detailed information in a modal
- **Real-time Updates**: New alerts appear every 10 seconds (20% chance)

### **Trades History Page**
- **12 Detailed Trades** with realistic blockchain data:
  - Trade Types: Normal, Large, Whale (with different amount/price ranges)
  - Statuses: Completed, Pending, Failed
  - Full transaction details: buyer/seller addresses, gas usage, transaction hashes
- **Trading Summary Cards**: Status breakdown and total volume
- **Trade Type Breakdown**: Visual representation of normal/large/whale trades
- **Advanced Search**: Search by addresses, transaction hashes
- **Dual Filtering**: Filter by status AND trade type simultaneously
- **Interactive Details**: Click any trade to view comprehensive information

### **Circuit Breaker Control**
- **Current Status Display**: Shows current system state with descriptions
- **System Health Monitoring**: Real-time health assessment based on active alerts
- **Manual Control Panel**: Sophisticated dialog for triggering circuit breaker states
- **Action Options**: Normal, Warning, Triggered, Emergency
- **Reason Selection**: Predefined reasons or custom input
- **System Metrics**: Key performance indicators and statistics

## 🔄 Real-Time Simulation Features

### **Dynamic Data Updates**
- **New Alerts**: Generated every 10 seconds (20% probability)
- **New Trades**: Created every 10 seconds (30% probability)
- **Status Changes**: Alerts resolve and trades complete automatically (15% probability)
- **Statistics Updates**: All metrics update in real-time

### **Realistic Data Generation**
- **Alert Types**: 15 different security alert categories
- **Alert Sources**: 10 different monitoring systems
- **Trade Patterns**: Realistic amounts, prices, and gas usage
- **Address Generation**: Valid Ethereum-style addresses
- **Timestamp Management**: Proper chronological ordering

## 🧪 Testing Scenarios

### **1. Dashboard Functionality**
- ✅ View all metric cards and verify data accuracy
- ✅ Check progress bars for alert and trade breakdowns
- ✅ Monitor recent activity sections
- ✅ Verify system status updates

### **2. Trading Charts Testing**
- ✅ View different chart types (Line, Area, Bar)
- ✅ Switch between time ranges (1H, 6H, 24H, 7D)
- ✅ Verify dual-axis line charts show volume and price
- ✅ Check interactive tooltips on data points
- ✅ Monitor real-time chart updates with new trades
- ✅ Test chart responsiveness on different screen sizes
- ✅ Verify data aggregation by time periods

### **3. Alert Management**
- ✅ Search alerts by type, message, or details
- ✅ Filter by severity (High/Medium/Low)
- ✅ Click alerts to view detailed information
- ✅ Monitor real-time alert generation
- ✅ Test alert resolution simulation

### **4. Trade Analysis**
- ✅ Search trades by address or transaction hash
- ✅ Filter by status (completed/pending/failed)
- ✅ Filter by trade type (normal/large/whale)
- ✅ View comprehensive trade details
- ✅ Monitor trade completion simulation

### **5. Circuit Breaker Operations**
- ✅ View current system status
- ✅ Monitor system health indicators
- ✅ Test manual circuit breaker controls
- ✅ Try different action types and reasons
- ✅ Verify alert generation on circuit breaker actions

### **6. Real-Time Features**
- ✅ Watch for new alerts appearing
- ✅ Observe new trades being added
- ✅ Monitor status changes (alerts resolving, trades completing)
- ✅ Check statistics updating automatically
- ✅ Verify timestamp updates

## 🎯 Advanced Testing

### **Data Validation**
- Verify alert severity distribution matches summary cards
- Check trade status counts against table data
- Validate address formats and transaction hashes
- Confirm timestamp ordering and formatting

### **UI Responsiveness**
- Test on different screen sizes
- Verify modal dialogs work correctly
- Check filter combinations
- Test search functionality with various inputs

### **Performance Testing**
- Monitor with browser developer tools
- Check for memory leaks during real-time updates
- Verify smooth scrolling in large data tables
- Test component re-rendering efficiency

## 📱 Console Messages

Watch the browser console for real-time activity:
- 🚨 New alert generated: [Alert Type]
- 💱 New trade generated: [Trade Type] [Amount]
- ✅ Alert resolved: [Alert Type]
- ✅ Trade completed: [Amount]
- 🔴 Circuit breaker triggered: [Action] [Reason]

## 🚨 Troubleshooting

### **If No Data Appears**
- Check browser console for errors
- Verify the page has loaded completely
- Try refreshing the page
- Check if JavaScript is enabled

### **If Real-Time Updates Stop**
- Check console for error messages
- Verify the interval is running (check console logs)
- Try navigating to a different page and back

### **If Components Don't Render**
- Check browser console for React errors
- Verify all required props are being passed
- Check if Material-UI components are loading

## 🔧 Customization Options

The mock data can be easily modified in `frontend/src/App.js`:
- **Alert Generation**: Modify `generateRandomAlert()` function
- **Trade Generation**: Modify `generateRandomTrade()` function
- **Update Frequency**: Change the `setInterval` timing (currently 10 seconds)
- **Data Volumes**: Adjust the probability percentages for different events

## 📈 Expected Behavior

- **Initial Load**: 10 alerts, 12 trades, comprehensive statistics
- **Trading Charts**: Interactive charts with real-time data updates
- **Chart Types**: Line (dual-axis), Area, and Bar chart options
- **Time Ranges**: 1H, 6H, 24H, and 7D data views
- **Real-Time Updates**: New data appears every 10 seconds
- **Interactive Elements**: All buttons, filters, search functions, and charts work
- **Data Consistency**: Statistics always match the displayed data
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🎉 Ready for Testing!

Your GridSecureSim frontend is now fully populated with comprehensive mock data and ready for thorough testing. Every component has realistic data, real-time updates, and full interactivity. Enjoy exploring the system!
