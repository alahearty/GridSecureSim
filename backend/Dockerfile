FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ ./backend/
COPY contracts/ ./contracts/

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "backend/server.js"] 