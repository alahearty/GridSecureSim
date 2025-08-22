FROM node:18-alpine

WORKDIR /app

# Copy root package files first
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy simulation source code
COPY simulation/ ./simulation/

# Copy contracts directory
COPY contracts/ ./contracts/

# Expose port
EXPOSE 3000

# Start simulation engine
CMD ["node", "simulation/engine.js"]
