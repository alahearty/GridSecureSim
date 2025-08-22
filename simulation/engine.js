const { ethers } = require('ethers');
const axios = require('axios');

/**
 * Simulation Engine for Energy Trading Protection System
 * Generates synthetic IoT energy data and simulates attack scenarios
 */

class SimulationEngine {
    constructor(config = {}) {
        this.config = {
            // Blockchain configuration
            rpcUrl: config.rpcUrl || 'http://localhost:8545',
            contractAddress: config.contractAddress || '0x0000000000000000000000000000000000000000',
            privateKey: config.privateKey || process.env.SIMULATION_PRIVATE_KEY,
            
            // Simulation parameters
            simulationDuration: config.simulationDuration || 300000, // 5 minutes
            tradeInterval: config.tradeInterval || 10000, // 10 seconds
            attackProbability: config.attackProbability || 0.1, // 10% chance of attack
            
            // IoT data parameters
            energyProductionRange: config.energyProductionRange || [10, 100], // kWh
            energyConsumptionRange: config.energyConsumptionRange || [5, 50], // kWh
            priceRange: config.priceRange || [0.1, 2.0], // ETH per kWh
            
            // Backend API
            backendUrl: config.backendUrl || 'http://localhost:2001/api',
            
            // Attack scenarios
            attackScenarios: config.attackScenarios || ['front-running', 'flash-loan', 'volume-manipulation']
        };
        
        this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
        this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
        this.contract = null;
        this.simulationRunning = false;
        this.tradeHistory = [];
        this.attackHistory = [];
        
        this.initializeContract();
    }
    
    /**
     * Initialize smart contract connection
     */
    async initializeContract() {
        try {
            const contractABI = require('../contracts/EnergyTradingContract.json').abi;
            this.contract = new ethers.Contract(
                this.config.contractAddress,
                contractABI,
                this.wallet
            );
            
            console.log('Contract initialized:', this.config.contractAddress);
        } catch (error) {
            console.error('Error initializing contract:', error);
        }
    }
    
    /**
     * Start the simulation
     */
    async startSimulation() {
        if (this.simulationRunning) {
            console.log('Simulation already running');
            return;
        }
        
        console.log('Starting energy trading simulation...');
        this.simulationRunning = true;
        
        const startTime = Date.now();
        const endTime = startTime + this.config.simulationDuration;
        
        // Start normal trading simulation
        const tradingInterval = setInterval(async () => {
            if (Date.now() > endTime) {
                clearInterval(tradingInterval);
                this.stopSimulation();
                return;
            }
            
            await this.generateNormalTrade();
            
            // Randomly trigger attack scenarios
            if (Math.random() < this.config.attackProbability) {
                await this.triggerRandomAttack();
            }
        }, this.config.tradeInterval);
        
        // Start IoT data generation
        const iotInterval = setInterval(async () => {
            if (Date.now() > endTime) {
                clearInterval(iotInterval);
                return;
            }
            
            await this.generateIoTData();
        }, 5000); // Every 5 seconds
    }
    
    /**
     * Stop the simulation
     */
    stopSimulation() {
        this.simulationRunning = false;
        console.log('Simulation stopped');
        this.generateSimulationReport();
    }
    
    /**
     * Generate normal energy trading activity
     */
    async generateNormalTrade() {
        try {
            // Generate random trade parameters
            const buyer = this.generateRandomAddress();
            const seller = this.generateRandomAddress();
            const amount = this.generateRandomAmount(
                this.config.energyConsumptionRange[0],
                this.config.energyConsumptionRange[1]
            );
            const price = this.generateRandomPrice(
                this.config.priceRange[0],
                this.config.priceRange[1]
            );
            
            // Simulate energy token minting for seller
            const mintAmount = amount * 1.2; // Seller needs more tokens than selling
            await this.simulateTokenMinting(seller, mintAmount);
            
            // Simulate trade execution
            const tradeData = {
                buyer,
                seller,
                            amount: ethers.parseEther(amount.toString()),
            price: ethers.parseEther(price.toString()),
                timestamp: Date.now(),
                type: 'normal'
            };
            
            this.tradeHistory.push(tradeData);
            
            console.log(`Normal trade: ${buyer} bought ${amount} kWh from ${seller} at ${price} ETH/kWh`);
            
        } catch (error) {
            console.error('Error generating normal trade:', error);
        }
    }
    
    /**
     * Generate synthetic IoT energy data
     */
    async generateIoTData() {
        try {
            // Simulate solar panel production
            const solarProduction = this.generateSolarProduction();
            
            // Simulate household consumption
            const householdConsumption = this.generateHouseholdConsumption();
            
            // Simulate grid demand
            const gridDemand = this.generateGridDemand();
            
            const iotData = {
                timestamp: Date.now(),
                solarProduction,
                householdConsumption,
                gridDemand,
                netEnergy: solarProduction - householdConsumption,
                price: this.generateDynamicPrice(solarProduction, householdConsumption)
            };
            
            // Send IoT data to backend for analysis
            await this.sendIoTDataToBackend(iotData);
            
            console.log('IoT data generated:', {
                solar: `${solarProduction} kWh`,
                consumption: `${householdConsumption} kWh`,
                net: `${iotData.netEnergy} kWh`,
                price: `${iotData.price} ETH/kWh`
            });
            
        } catch (error) {
            console.error('Error generating IoT data:', error);
        }
    }
    
    /**
     * Generate solar energy production with realistic patterns
     */
    generateSolarProduction() {
        const hour = new Date().getHours();
        const baseProduction = 50; // Base production in kWh
        
        // Solar production follows a bell curve during daylight hours
        let solarFactor = 0;
        if (hour >= 6 && hour <= 18) {
            const peakHour = 12;
            const distanceFromPeak = Math.abs(hour - peakHour);
            solarFactor = Math.exp(-(distanceFromPeak * distanceFromPeak) / 8);
        }
        
        // Add some randomness
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        
        return Math.round(baseProduction * solarFactor * randomFactor);
    }
    
    /**
     * Generate household energy consumption
     */
    generateHouseholdConsumption() {
        const hour = new Date().getHours();
        const baseConsumption = 30; // Base consumption in kWh
        
        // Higher consumption during morning and evening
        let consumptionFactor = 1;
        if (hour >= 7 && hour <= 9) consumptionFactor = 1.3; // Morning peak
        if (hour >= 18 && hour <= 22) consumptionFactor = 1.5; // Evening peak
        
        // Add randomness
        const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        
        return Math.round(baseConsumption * consumptionFactor * randomFactor);
    }
    
    /**
     * Generate grid demand
     */
    generateGridDemand() {
        const hour = new Date().getHours();
        const baseDemand = 1000; // Base grid demand in kWh
        
        // Higher demand during business hours
        let demandFactor = 1;
        if (hour >= 9 && hour <= 17) demandFactor = 1.4; // Business hours
        if (hour >= 18 && hour <= 22) demandFactor = 1.2; // Evening
        
        return Math.round(baseDemand * demandFactor);
    }
    
    /**
     * Generate dynamic energy price based on supply and demand
     */
    generateDynamicPrice(solarProduction, householdConsumption) {
        const netEnergy = solarProduction - householdConsumption;
        const basePrice = 1.0; // Base price in ETH/kWh
        
        // Price increases when demand exceeds supply
        let priceFactor = 1;
        if (netEnergy < 0) {
            priceFactor = 1 + Math.abs(netEnergy) / 100; // Price increases with deficit
        } else if (netEnergy > 50) {
            priceFactor = 0.8; // Price decreases with surplus
        }
        
        return Math.round((basePrice * priceFactor) * 100) / 100;
    }
    
    /**
     * Trigger random attack scenario
     */
    async triggerRandomAttack() {
        const attackType = this.config.attackScenarios[
            Math.floor(Math.random() * this.config.attackScenarios.length)
        ];
        
        console.log(`Triggering attack scenario: ${attackType}`);
        
        switch (attackType) {
            case 'front-running':
                await this.simulateFrontRunningAttack();
                break;
            case 'flash-loan':
                await this.simulateFlashLoanAttack();
                break;
            case 'volume-manipulation':
                await this.simulateVolumeManipulationAttack();
                break;
            default:
                console.log('Unknown attack type:', attackType);
        }
    }
    
    /**
     * Simulate front-running attack
     */
    async simulateFrontRunningAttack() {
        try {
            const victim = this.generateRandomAddress();
            const attacker = this.generateRandomAddress();
            const amount = this.generateRandomAmount(100, 500);
            const price = this.generateRandomPrice(1.0, 1.5);
            
            // Attacker observes victim's transaction and front-runs
            console.log(`Front-running attack: Attacker ${attacker} front-running victim ${victim}`);
            
            // Simulate multiple rapid transactions
            for (let i = 0; i < 3; i++) {
                const frontRunTrade = {
                    buyer: attacker,
                    seller: this.generateRandomAddress(),
                                amount: ethers.parseEther((amount * (1 + i * 0.1)).toString()),
            price: ethers.parseEther((price * (1 + i * 0.05)).toString()),
                    timestamp: Date.now() + i * 1000, // 1 second apart
                    type: 'front-running'
                };
                
                this.tradeHistory.push(frontRunTrade);
                this.attackHistory.push({
                    type: 'front-running',
                    data: frontRunTrade,
                    timestamp: Date.now()
                });
                
                console.log(`Front-run trade ${i + 1}: ${attacker} bought ${amount * (1 + i * 0.1)} kWh`);
            }
            
        } catch (error) {
            console.error('Error simulating front-running attack:', error);
        }
    }
    
    /**
     * Simulate flash loan attack
     */
    async simulateFlashLoanAttack() {
        try {
            const attacker = this.generateRandomAddress();
            const flashLoanAmount = 10000; // Large amount for flash loan
            
            console.log(`Flash loan attack: Attacker ${attacker} borrowing ${flashLoanAmount} kWh`);
            
            // Simulate flash loan sequence
            const flashLoanSequence = [
                {
                    type: 'borrow',
                    amount: flashLoanAmount,
                    timestamp: Date.now()
                },
                {
                    type: 'trade',
                    amount: flashLoanAmount * 0.8,
                    price: 0.5, // Manipulated low price
                    timestamp: Date.now() + 1000
                },
                {
                    type: 'trade',
                    amount: flashLoanAmount * 0.8,
                    price: 2.0, // Manipulated high price
                    timestamp: Date.now() + 2000
                },
                {
                    type: 'repay',
                    amount: flashLoanAmount,
                    timestamp: Date.now() + 3000
                }
            ];
            
            for (const step of flashLoanSequence) {
                const tradeData = {
                    buyer: attacker,
                    seller: this.generateRandomAddress(),
                                amount: ethers.parseEther(step.amount.toString()),
            price: ethers.parseEther(step.price.toString()),
                    timestamp: step.timestamp,
                    type: 'flash-loan'
                };
                
                this.tradeHistory.push(tradeData);
            }
            
            this.attackHistory.push({
                type: 'flash-loan',
                data: flashLoanSequence,
                timestamp: Date.now()
            });
            
            console.log('Flash loan attack sequence completed');
            
        } catch (error) {
            console.error('Error simulating flash loan attack:', error);
        }
    }
    
    /**
     * Simulate volume manipulation attack
     */
    async simulateVolumeManipulationAttack() {
        try {
            const attacker = this.generateRandomAddress();
            const manipulationAmount = 2000; // Large volume for manipulation
            
            console.log(`Volume manipulation attack: Attacker ${attacker} manipulating volume with ${manipulationAmount} kWh`);
            
            // Simulate rapid large-volume trades
            for (let i = 0; i < 5; i++) {
                const manipulationTrade = {
                    buyer: attacker,
                    seller: this.generateRandomAddress(),
                                amount: ethers.parseEther((manipulationAmount / 5).toString()),
            price: ethers.parseEther(this.generateRandomPrice(0.8, 1.2).toString()),
                    timestamp: Date.now() + i * 2000, // 2 seconds apart
                    type: 'volume-manipulation'
                };
                
                this.tradeHistory.push(manipulationTrade);
            }
            
            this.attackHistory.push({
                type: 'volume-manipulation',
                data: { attacker, manipulationAmount },
                timestamp: Date.now()
            });
            
            console.log('Volume manipulation attack completed');
            
        } catch (error) {
            console.error('Error simulating volume manipulation attack:', error);
        }
    }
    
    /**
     * Simulate token minting
     */
    async simulateTokenMinting(address, amount) {
        try {
            const mintData = {
                producer: address,
                amount: ethers.parseEther(amount.toString()),
                timestamp: Date.now()
            };
            
            console.log(`Token minting: ${address} minted ${amount} kWh`);
            
            // In a real scenario, this would call the smart contract
            // await this.contract.mintEnergyTokens(mintData.amount);
            
        } catch (error) {
            console.error('Error simulating token minting:', error);
        }
    }
    
    /**
     * Send IoT data to backend
     */
    async sendIoTDataToBackend(iotData) {
        try {
            await axios.post(`${this.config.backendUrl}/iot-data`, iotData);
        } catch (error) {
            console.error('Error sending IoT data to backend:', error);
        }
    }
    
    /**
     * Generate random Ethereum address
     */
    generateRandomAddress() {
        return ethers.Wallet.createRandom().address;
    }
    
    /**
     * Generate random amount within range
     */
    generateRandomAmount(min, max) {
        return Math.round((min + Math.random() * (max - min)) * 100) / 100;
    }
    
    /**
     * Generate random price within range
     */
    generateRandomPrice(min, max) {
        return Math.round((min + Math.random() * (max - min)) * 100) / 100;
    }
    
    /**
     * Generate simulation report
     */
    generateSimulationReport() {
        const report = {
            duration: this.config.simulationDuration / 1000, // seconds
            totalTrades: this.tradeHistory.length,
            totalAttacks: this.attackHistory.length,
            attackTypes: this.attackHistory.map(attack => attack.type),
            tradeVolume: this.tradeHistory.reduce((sum, trade) => 
                sum + parseFloat(ethers.formatEther(trade.amount)), 0
            ),
            averagePrice: this.tradeHistory.reduce((sum, trade) => 
                sum + parseFloat(ethers.formatEther(trade.price)), 0
            ) / this.tradeHistory.length
        };
        
        console.log('\n=== Simulation Report ===');
        console.log(`Duration: ${report.duration} seconds`);
        console.log(`Total Trades: ${report.totalTrades}`);
        console.log(`Total Attacks: ${report.totalAttacks}`);
        console.log(`Attack Types: ${report.attackTypes.join(', ')}`);
        console.log(`Total Volume: ${report.tradeVolume.toFixed(2)} kWh`);
        console.log(`Average Price: ${report.averagePrice.toFixed(4)} ETH/kWh`);
        console.log('========================\n');
        
        return report;
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const engine = new SimulationEngine({
        simulationDuration: 300000, // 5 minutes
        tradeInterval: 10000, // 10 seconds
        attackProbability: 0.1 // 10% chance
    });
    
    switch (command) {
        case 'start':
            engine.startSimulation();
            break;
        case 'test':
            console.log('Running quick test simulation...');
            engine.config.simulationDuration = 60000; // 1 minute
            engine.startSimulation();
            break;
        default:
            console.log('Usage: node engine.js [start|test]');
            console.log('  start - Run full simulation');
            console.log('  test  - Run quick test simulation');
    }
}

module.exports = SimulationEngine; 