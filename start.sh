#!/bin/bash

# Energy Trading Protection System - Quick Start Script

echo "🚀 Starting Energy Trading Protection System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configuration before continuing."
    echo "   - Set ENERGY_CONTRACT_ADDRESS after deploying the smart contract"
    echo "   - Set CONTRACT_PRIVATE_KEY for circuit breaker control"
    echo "   - Set SIMULATION_PRIVATE_KEY for testing"
    read -p "Press Enter to continue after updating .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile smart contracts
echo "🔨 Compiling smart contracts..."
npm run compile

# Start local blockchain (optional)
read -p "Do you want to start a local blockchain node? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⛓️  Starting local blockchain..."
    docker-compose --profile local up -d ganache
    sleep 5
fi

# Deploy smart contract
read -p "Do you want to deploy the smart contract? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📄 Deploying smart contract..."
    npm run deploy:contract
    
    # Update .env with contract address
    if [ -f deployment-localhost.json ]; then
        CONTRACT_ADDRESS=$(node -e "console.log(require('./deployment-localhost.json').contractAddress)")
        sed -i "s/ENERGY_CONTRACT_ADDRESS=.*/ENERGY_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
        echo "✅ Updated .env with contract address: $CONTRACT_ADDRESS"
    fi
fi

# Start the system
echo "🏃 Starting the system..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Display access information
echo ""
echo "🎉 Energy Trading Protection System is running!"
echo ""
echo "📱 Access Points:"
echo "   Dashboard: http://localhost:2000"
echo "   Backend API: http://localhost:2002"
echo "   Database: localhost:2001"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop system: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Update: docker-compose pull && docker-compose up -d"
echo ""
echo "🧪 Testing:"
echo "   Run simulation: npm run simulate"
echo "   Test attack scenarios: node simulation/engine.js test"
echo ""

# Optional: Start simulation
read -p "Do you want to start the simulation engine? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🎮 Starting simulation engine..."
    docker-compose exec simulation node simulation/engine.js start
fi

echo "✅ Setup complete! The system is ready for use." 