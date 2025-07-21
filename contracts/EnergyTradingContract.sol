// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EnergyTradingContract
 * @dev Smart contract for blockchain-based energy trading with real-time protection
 * Features: Circuit breaker, anomaly detection events, energy token management
 */
contract EnergyTradingContract is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // Circuit breaker states
    enum CircuitBreakerState { Normal, Paused, Emergency }
    CircuitBreakerState public circuitBreakerState = CircuitBreakerState.Normal;
    
    // Trading parameters
    uint256 public constant MIN_TRADE_AMOUNT = 1 ether;
    uint256 public constant MAX_TRADE_AMOUNT = 1000 ether;
    uint256 public constant MAX_DAILY_VOLUME = 10000 ether;
    
    // Rate limiting
    uint256 public dailyVolume;
    uint256 public lastVolumeReset;
    mapping(address => uint256) public userDailyVolume;
    mapping(address => uint256) public userLastReset;
    
    // Anomaly detection thresholds
    uint256 public suspiciousVolumeThreshold = 500 ether;
    uint256 public rapidTradeThreshold = 5; // trades per minute
    mapping(address => uint256) public userTradeCount;
    mapping(address => uint256) public userLastTradeTime;
    
    // Events for monitoring
    event EnergyTokenMinted(address indexed producer, uint256 amount, uint256 timestamp);
    event EnergyTradeExecuted(address indexed buyer, address indexed seller, uint256 amount, uint256 price, uint256 timestamp);
    event CircuitBreakerTriggered(CircuitBreakerState newState, string reason, uint256 timestamp);
    event AnomalyDetected(string anomalyType, address indexed user, uint256 value, uint256 timestamp);
    event VolumeLimitExceeded(address indexed user, uint256 attemptedAmount, uint256 limit, uint256 timestamp);
    
    // Modifiers
    modifier circuitBreakerActive() {
        require(circuitBreakerState != CircuitBreakerState.Emergency, "Contract is in emergency state");
        _;
    }
    
    modifier volumeLimitCheck(uint256 amount) {
        require(amount >= MIN_TRADE_AMOUNT, "Trade amount too small");
        require(amount <= MAX_TRADE_AMOUNT, "Trade amount too large");
        require(dailyVolume + amount <= MAX_DAILY_VOLUME, "Daily volume limit exceeded");
        _;
    }
    
    modifier rateLimitCheck(address user) {
        require(block.timestamp - userLastTradeTime[user] >= 60, "Rate limit: 1 trade per minute");
        _;
    }
    
    constructor() ERC20("EnergyToken", "ENERGY") {
        lastVolumeReset = block.timestamp;
    }
    
    /**
     * @dev Mint energy tokens for energy producers
     * @param amount Amount of energy tokens to mint
     */
    function mintEnergyTokens(uint256 amount) 
        external 
        circuitBreakerActive 
        whenNotPaused 
        nonReentrant 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= 1000 ether, "Minting amount too large");
        
        _mint(msg.sender, amount);
        
        emit EnergyTokenMinted(msg.sender, amount, block.timestamp);
        
        // Check for suspicious minting patterns
        if (amount > 500 ether) {
            emit AnomalyDetected("LargeMinting", msg.sender, amount, block.timestamp);
        }
    }
    
    /**
     * @dev Execute energy trade between users
     * @param seller Address of the energy seller
     * @param amount Amount of energy tokens to trade
     * @param price Price per energy token
     */
    function tradeEnergy(
        address seller, 
        uint256 amount, 
        uint256 price
    ) 
        external 
        payable 
        circuitBreakerActive 
        whenNotPaused 
        nonReentrant 
        volumeLimitCheck(amount)
        rateLimitCheck(msg.sender)
    {
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Cannot trade with yourself");
        require(balanceOf(seller) >= amount, "Seller has insufficient balance");
        require(msg.value == amount * price, "Incorrect payment amount");
        
        // Update volume tracking
        _updateVolumeTracking(msg.sender, amount);
        
        // Transfer tokens
        _transfer(seller, msg.sender, amount);
        
        // Transfer payment to seller
        payable(seller).transfer(msg.value);
        
        // Update trade tracking
        _updateTradeTracking(msg.sender);
        
        emit EnergyTradeExecuted(msg.sender, seller, amount, price, block.timestamp);
        
        // Anomaly detection checks
        _checkForAnomalies(msg.sender, amount, price);
    }
    
    /**
     * @dev Circuit breaker controls - only owner can trigger
     */
    function triggerCircuitBreaker(CircuitBreakerState newState, string memory reason) 
        external 
        onlyOwner 
    {
        circuitBreakerState = newState;
        
        if (newState == CircuitBreakerState.Paused) {
            _pause();
        } else if (newState == CircuitBreakerState.Normal) {
            _unpause();
        }
        
        emit CircuitBreakerTriggered(newState, reason, block.timestamp);
    }
    
    /**
     * @dev Update anomaly detection thresholds
     */
    function updateThresholds(
        uint256 _suspiciousVolumeThreshold,
        uint256 _rapidTradeThreshold
    ) 
        external 
        onlyOwner 
    {
        suspiciousVolumeThreshold = _suspiciousVolumeThreshold;
        rapidTradeThreshold = _rapidTradeThreshold;
    }
    
    /**
     * @dev Reset daily volume tracking
     */
    function resetDailyVolume() external onlyOwner {
        dailyVolume = 0;
        lastVolumeReset = block.timestamp;
    }
    
    /**
     * @dev Internal function to update volume tracking
     */
    function _updateVolumeTracking(address user, uint256 amount) internal {
        // Reset daily volume if 24 hours have passed
        if (block.timestamp - lastVolumeReset >= 1 days) {
            dailyVolume = 0;
            lastVolumeReset = block.timestamp;
        }
        
        // Reset user volume if 24 hours have passed
        if (block.timestamp - userLastReset[user] >= 1 days) {
            userDailyVolume[user] = 0;
            userLastReset[user] = block.timestamp;
        }
        
        dailyVolume += amount;
        userDailyVolume[user] += amount;
    }
    
    /**
     * @dev Internal function to update trade tracking
     */
    function _updateTradeTracking(address user) internal {
        if (block.timestamp - userLastTradeTime[user] >= 1 minutes) {
            userTradeCount[user] = 1;
        } else {
            userTradeCount[user]++;
        }
        userLastTradeTime[user] = block.timestamp;
    }
    
    /**
     * @dev Internal function to check for anomalies
     */
    function _checkForAnomalies(address user, uint256 amount, uint256 price) internal {
        // Check for suspicious volume
        if (amount > suspiciousVolumeThreshold) {
            emit AnomalyDetected("SuspiciousVolume", user, amount, block.timestamp);
        }
        
        // Check for rapid trading
        if (userTradeCount[user] > rapidTradeThreshold) {
            emit AnomalyDetected("RapidTrading", user, userTradeCount[user], block.timestamp);
        }
        
        // Check for unusual price movements (simplified)
        if (price > 2 ether || price < 0.1 ether) {
            emit AnomalyDetected("UnusualPrice", user, price, block.timestamp);
        }
    }
    
    /**
     * @dev Get contract state for monitoring
     */
    function getContractState() external view returns (
        CircuitBreakerState state,
        uint256 totalSupply_,
        uint256 dailyVolume_,
        uint256 lastVolumeReset_
    ) {
        return (
            circuitBreakerState,
            totalSupply(),
            dailyVolume,
            lastVolumeReset
        );
    }
    
    /**
     * @dev Get user trading statistics
     */
    function getUserStats(address user) external view returns (
        uint256 balance_,
        uint256 userDailyVolume_,
        uint256 userTradeCount_,
        uint256 userLastTradeTime_
    ) {
        return (
            balanceOf(user),
            userDailyVolume[user],
            userTradeCount[user],
            userLastTradeTime[user]
        );
    }
} 